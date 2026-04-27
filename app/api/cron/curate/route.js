// app/api/cron/curate/route.js
// Vercel Cron — runs once daily. Pulls every RSS source, scores items,
// asks Claude to pick the winner, generates the Atlas-format article,
// persists it, then recomputes and stores the Atlas Index.
//
// Triggered by vercel.json schedule. Protected by CRON_SECRET.
// maxDuration 60 (Vercel Pro).

import { NextResponse } from "next/server";
import { RSS_SOURCES } from "@/lib/rss-sources";
import { fetchAllFeeds } from "@/lib/rss-parser";
import { rankCandidates, selectWinner, generateArticle, slugify } from "@/lib/curator";
import { computeIndex, adminClient } from "@/lib/atlas-index";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Active conflict zones — kept in code (mirrors dashboard); used by index calc
const CONFLICTS = [
  { sev: "critical" }, { sev: "critical" }, { sev: "critical" }, { sev: "critical" },
  { sev: "high" }, { sev: "high" }, { sev: "high" }, { sev: "high" },
  { sev: "critical" }, { sev: "medium" }, { sev: "high" }, { sev: "high" },
  { sev: "high" }, { sev: "high" }, { sev: "high" }, { sev: "high" },
  { sev: "high" }, { sev: "high" }, { sev: "critical" }, { sev: "high" },
];

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

async function ensureUniqueSlug(supabase, baseSlug) {
  let slug = baseSlug, n = 1;
  for (;;) {
    const { data } = await supabase.from("articles").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    n++; slug = `${baseSlug}-${n}`;
    if (n > 8) return `${baseSlug}-${Date.now()}`;
  }
}

export async function GET(req) {
  // Auth
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (process.env.CRON_SECRET && authHeader !== expected) return unauthorized();

  const log = { started_at: new Date().toISOString(), steps: [] };

  try {
    // 1. Fetch every feed
    const items = await fetchAllFeeds(RSS_SOURCES, { perFeedLimit: 8, hoursBack: 36 });
    log.steps.push({ step: "fetch", item_count: items.length });
    if (items.length === 0) {
      return NextResponse.json({ ok: false, reason: "no_items", log });
    }

    // 2. Heuristic ranking + diversity
    const shortlist = rankCandidates(items, { take: 8 });
    log.steps.push({ step: "shortlist", titles: shortlist.map((s) => s.title) });

    // 3. Pull last 3 days of headlines so Claude avoids repeats
    const supabase = adminClient();
    const { data: recent } = await supabase
      .from("articles")
      .select("headline,published_at")
      .order("published_at", { ascending: false })
      .limit(7);
    const recentTitles = (recent || []).map((r) => r.headline);

    // 4. Claude picks the winner
    const { winner, reason } = await selectWinner(shortlist, { recentTitles });
    log.steps.push({ step: "winner_selected", title: winner.title, reason });

    // 5. Claude generates the Atlas-format article
    const article = await generateArticle(winner);
    log.steps.push({ step: "article_generated", headline: article.headline });

    // 6. Persist
    const baseSlug = slugify(article.headline) || `brief-${Date.now()}`;
    const slug = await ensureUniqueSlug(supabase, baseSlug);
    const { data: inserted, error: insertErr } = await supabase
      .from("articles")
      .insert({
        slug,
        headline: article.headline,
        dek: article.dek,
        body_markdown: article.body_markdown,
        implications: article.implications || [],
        category: article.category || winner.category || "cyber",
        sectors: article.sectors || winner.sectors || [],
        severity: article.severity || "medium",
        tags: article.tags || [],
        source_name: winner.source_name,
        source_url: winner.link,
        source_published_at: winner.published,
        social_post_x: article.social_post_x || null,
        social_caption_instagram: article.social_caption_instagram || null,
        selection_reason: reason,
        published: true,
      })
      .select()
      .single();
    if (insertErr) throw new Error(`db_insert_failed: ${insertErr.message}`);
    log.steps.push({ step: "persisted", id: inserted.id, slug });

    // 7. Recompute Atlas Index
    const { data: allRecent } = await supabase
      .from("articles")
      .select("severity, sectors, published_at")
      .gte("published_at", new Date(Date.now() - 14 * 86400000).toISOString());
    const idx = computeIndex({ articles: allRecent || [], conflicts: CONFLICTS });
    await supabase.from("atlas_index_history").insert({
      score: idx.score,
      label: idx.label,
      components: idx.components,
    });
    log.steps.push({ step: "atlas_index", score: idx.score, label: idx.label });

    return NextResponse.json({ ok: true, slug, headline: article.headline, atlas_index: idx, log });
  } catch (e) {
    log.error = String(e?.message || e);
    return NextResponse.json({ ok: false, error: log.error, log }, { status: 500 });
  }
}
