// app/api/cron/post-instagram/route.js
// Vercel Cron — daily Instagram post. Skips silently if not enabled.
// Activate by setting INSTAGRAM_ENABLED=true plus credentials AFTER Meta approves
// instagram_business_basic + instagram_business_content_publish for your app.

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/atlas-index";
import { instagramEnabled, postToInstagram } from "@/lib/instagram-client";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export async function GET(req) {
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!instagramEnabled()) {
    return NextResponse.json({ ok: false, reason: "instagram_disabled", note: "Set INSTAGRAM_ENABLED=true plus credentials" });
  }

  const supabase = adminClient();
  const { data: candidates } = await supabase
    .from("articles")
    .select("id, slug, headline, dek, social_caption_instagram")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(5);
  if (!candidates || candidates.length === 0) return NextResponse.json({ ok: false, reason: "no_articles" });

  let target = null;
  for (const c of candidates) {
    const { data: existing } = await supabase
      .from("social_posts")
      .select("id").eq("article_id", c.id).eq("platform", "instagram").eq("status", "posted").maybeSingle();
    if (!existing) { target = c; break; }
  }
  if (!target) return NextResponse.json({ ok: false, reason: "all_posted" });

  const imageUrl = `${SITE}/api/og/${target.slug}`;
  const caption = (target.social_caption_instagram ||
    `${target.headline}\n\n${target.dek || ""}\n\nRead the full brief at atlasspy.com/intelligence`).slice(0, 2200);

  try {
    const result = await postToInstagram({ imageUrl, caption });
    await supabase.from("social_posts").insert({
      article_id: target.id,
      platform: "instagram",
      status: "posted",
      external_id: result.id,
    });
    return NextResponse.json({ ok: true, slug: target.slug, ig_id: result.id });
  } catch (e) {
    await supabase.from("social_posts").insert({
      article_id: target.id,
      platform: "instagram",
      status: "failed",
      error_message: String(e?.message || e),
    });
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
