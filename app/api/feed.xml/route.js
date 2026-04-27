// app/api/feed.xml/route.js
// Outbound RSS 2.0 feed of our own articles. Atlas becomes a citable source.

import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

function escape(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data } = await supabase
    .from("articles")
    .select("slug, headline, dek, published_at, category, sectors")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (data || []).map((a) => `
    <item>
      <title>${escape(a.headline)}</title>
      <link>${SITE}/intelligence/${a.slug}</link>
      <guid isPermaLink="true">${SITE}/intelligence/${a.slug}</guid>
      <description>${escape(a.dek || "")}</description>
      <category>${escape(a.category)}</category>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Atlas Intelligence</title>
    <link>${SITE}/intelligence</link>
    <atom:link href="${SITE}/api/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Daily intelligence briefs from Atlas Intelligence — cyber, geopolitical, and risk analysis for executives.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
