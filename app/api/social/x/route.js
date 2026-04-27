// app/api/social/x/route.js
// Admin-triggered single-article X post. Useful for re-posting a failed cron
// or pushing a specific article on demand. Requires CRON_SECRET in header.

import { NextResponse } from "next/server";
import { adminClient } from "@/lib/atlas-index";
import { postTweet, uploadMedia } from "@/lib/x-client";

export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET || ""}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug_required" }, { status: 400 });

  const supabase = adminClient();
  const { data: a } = await supabase.from("articles").select("*").eq("slug", slug).single();
  if (!a) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const articleUrl = `${SITE}/intelligence/${a.slug}`;
  const text = (a.social_post_x || `${a.headline} {URL}`).replace("{URL}", articleUrl);
  const cleanText = text.length > 280 ? text.slice(0, 277) + "..." : text;

  try {
    let mediaIds = [];
    try {
      const ogRes = await fetch(`${SITE}/api/og/${a.slug}`);
      if (ogRes.ok) {
        const buf = Buffer.from(await ogRes.arrayBuffer());
        mediaIds = [await uploadMedia(buf, "image/png")];
      }
    } catch {}
    const result = await postTweet({ text: cleanText, mediaIds });
    await supabase.from("social_posts").insert({
      article_id: a.id, platform: "x", status: "posted", external_id: result.id, external_url: result.url,
    });
    return NextResponse.json({ ok: true, post_url: result.url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
