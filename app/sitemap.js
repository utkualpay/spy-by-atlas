export default function sitemap() {
  const base = "https://atlasspy.com";
  const pages = ["", "/pricing", "/demo", "/terms", "/privacy", "/refund", "/cookies", "/acceptable-use", "/disclaimer", "/eula", "/explicit-content", "/login", "/signup"];
  return pages.map(p => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1.0 : p === "/pricing" ? 0.9 : 0.7,
  }));
}
