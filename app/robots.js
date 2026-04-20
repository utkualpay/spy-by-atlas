export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/app/", "/api/", "/auth/"] },
    ],
    sitemap: "https://atlasspy.com/sitemap.xml",
  };
}
