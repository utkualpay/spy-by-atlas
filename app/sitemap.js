// app/sitemap.js
import { createClient } from "@supabase/supabase-js";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export default async function sitemap() {
  const now = new Date().toISOString();
  const staticRoutes = [
    "", "/intelligence", "/about", "/pricing", "/demo",
    "/login", "/signup",
    "/terms", "/privacy", "/eula", "/refund", "/cookies", "/acceptable-use", "/disclaimer", "/explicit-content",
  ].map((p) => ({ url: `${SITE}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1.0 : p === "/intelligence" ? 0.95 : 0.7 }));

  let articles = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(2000);
    articles = (data || []).map((a) => ({
      url: `${SITE}/intelligence/${a.slug}`,
      lastModified: a.updated_at || a.published_at,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch {}

  const categories = ["cyber", "geopolitics", "policy", "ics", "finance", "health"].map((c) => ({
    url: `${SITE}/intelligence?cat=${c}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categories, ...articles];
}
