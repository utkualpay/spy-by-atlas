// app/api/social/instagram/route.js
import { NextResponse } from "next/server";
import { adminClient } from "@/lib/atlas-index";
import { instagramEnabled, postToInstagram } from "@/lib/instagram-client";

export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET || ""}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!instagramEnabled()) {
    return NextResponse.json({ error: "instagram_disabled" }, { status: 400 });
  }
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug_required" }, { status: 400 });

  const supabase = adminClient();
  const { data: a } = await supabase.from("articles").select("*").eq("slug", slug).single();
  if (!a) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const imageUrl = `${SITE}/api/og/${a.slug}`;
  const caption = (a.social_caption_instagram ||
    `${a.headline}\n\n${a.dek || ""}\n\nRead the full brief at atlasspy.com/intelligence`).slice(0, 2200);

  try {
    const result = await postToInstagram({ imageUrl, caption });
    await supabase.from("social_posts").insert({
      article_id: a.id, platform: "instagram", status: "posted", external_id: result.id,
    });
    return NextResponse.json({ ok: true, ig_id: result.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
