// app/robots.js
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/intelligence", "/intelligence/", "/about", "/pricing", "/demo", "/api/og/", "/api/feed.xml"],
        disallow: ["/app/", "/admin/", "/api/admin/", "/auth/", "/api/cron/"],
      },
      // Explicit allow for major search engines so we don't get throttled
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
