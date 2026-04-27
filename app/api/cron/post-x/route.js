// app/api/cron/post-x/route.js
// Vercel Cron — runs ~30 min after curate. Posts the latest unpublished article
// to X with the social card OG image.

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/atlas-index";
import { postTweet, uploadMedia } from "@/lib/x-client";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export async function GET(req) {
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = adminClient();

  // Find the latest article with no successful X post yet
  const { data: candidates } = await supabase
    .from("articles")
    .select("id, slug, headline, dek, social_post_x")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(5);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ ok: false, reason: "no_articles" });
  }

  let target = null;
  for (const c of candidates) {
    const { data: existing } = await supabase
      .from("social_posts")
      .select("id")
      .eq("article_id", c.id)
      .eq("platform", "x")
      .eq("status", "posted")
      .maybeSingle();
    if (!existing) { target = c; break; }
  }
  if (!target) return NextResponse.json({ ok: false, reason: "all_posted" });

  const articleUrl = `${SITE}/intelligence/${target.slug}`;
  const text = (target.social_post_x || `${target.headline} {URL}`).replace("{URL}", articleUrl);
  const cleanText = text.length > 280 ? text.slice(0, 277) + "..." : text;

  try {
    // Try to attach the OG card. If image fetch fails, post text-only — better than missing the day.
    let mediaIds = [];
    try {
      const ogRes = await fetch(`${SITE}/api/og/${target.slug}`, { cache: "no-store" });
      if (ogRes.ok) {
        const buf = Buffer.from(await ogRes.arrayBuffer());
        const mediaId = await uploadMedia(buf, "image/png");
        mediaIds = [mediaId];
      }
    } catch (e) {
      console.warn("X media upload skipped:", e.message);
    }
    const result = await postTweet({ text: cleanText, mediaIds });
    await supabase.from("social_posts").insert({
      article_id: target.id,
      platform: "x",
      status: "posted",
      external_id: result.id,
      external_url: result.url,
    });
    return NextResponse.json({ ok: true, slug: target.slug, post_url: result.url });
  } catch (e) {
    await supabase.from("social_posts").insert({
      article_id: target.id,
      platform: "x",
      status: "failed",
      error_message: String(e?.message || e),
    });
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
