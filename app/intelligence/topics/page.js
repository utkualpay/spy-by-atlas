// app/intelligence/topics/page.js
//
// Inspired by Stratfor's "Themes" and Foreign Affairs's topic clusters.
// Aggregates briefs by tag, surfacing trending themes with article counts.
// Helps casual visitors discover content paths beyond chronological browsing.

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";

const C = {
  bg: "#09090b", bgCard: "#131316", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", champagne: "#e8d5a8", porcelain: "#c8d4e0",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Topics — Atlas Intelligence",
  description: "Browse Atlas Intelligence briefs by topic — ransomware, geopolitics, supply-chain, and more.",
};

export default async function TopicsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data } = await supabase
    .from("articles")
    .select("tags, sectors, category, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(500);

  // Aggregate tag counts (last 60 days)
  const cutoff = Date.now() - 60 * 86400000;
  const recent = (data || []).filter((a) => a.published_at && new Date(a.published_at).getTime() >= cutoff);
  const tagCounts = {};
  recent.forEach((a) => (a.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 32);

  // Sector grouping
  const sectorCounts = {};
  recent.forEach((a) => (a.sectors || []).forEach((s) => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; }));
  const sectorEntries = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <AtlasTicker />
      <PublicNav />

      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 48px 30px" }}>
        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>
          Discover
        </div>
        <h1 style={{ fontSize: 50, fontFamily: serif, fontWeight: 300, lineHeight: 1.05, margin: "0 0 14px", letterSpacing: -0.6 }}>
          Topics & Themes
        </h1>
        <p style={{ fontSize: 15, color: C.textSec, fontWeight: 300, maxWidth: 620, lineHeight: 1.65, margin: 0 }}>
          What we've been writing about. Tag size reflects coverage volume over the last 60 days.
        </p>
      </header>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 48px" }}>
        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.textDim, textTransform: "uppercase", marginBottom: 18 }}>
          Trending tags
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 60 }}>
          {topTags.length === 0 ? (
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono }}>No topics indexed yet — check back after the next briefs publish.</div>
          ) : (
            topTags.map(([tag, count]) => {
              // Tag-cloud sizing: top tag = 22px, lowest = 12px
              const max = topTags[0][1];
              const min = topTags[topTags.length - 1][1];
              const size = max === min ? 14 : 12 + Math.round(((count - min) / (max - min)) * 10);
              return (
                <Link
                  key={tag}
                  href={`/intelligence?tag=${encodeURIComponent(tag)}`}
                  style={{
                    fontSize: size, fontFamily: serif,
                    color: count >= 3 ? C.champagne : C.textSec,
                    textDecoration: "none",
                    padding: "6px 12px",
                    border: `1px solid ${count >= 3 ? "rgba(232,213,168,0.20)" : C.border}`,
                    borderRadius: 999,
                    fontStyle: "italic",
                  }}
                >
                  {tag} <span style={{ fontFamily: mono, fontSize: 10, color: C.textDim, fontStyle: "normal" }}>· {count}</span>
                </Link>
              );
            })
          )}
        </div>

        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.textDim, textTransform: "uppercase", marginBottom: 18 }}>
          By sector
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {sectorEntries.map(([sector, count]) => (
            <Link
              key={sector}
              href={`/intelligence?sector=${encodeURIComponent(sector)}`}
              style={{
                background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4,
                padding: 22, textDecoration: "none", color: "inherit",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ fontFamily: serif, fontSize: 22, color: C.text, marginBottom: 4 }}>{sector}</div>
              <div style={{ fontSize: 11, fontFamily: mono, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>
                {count} brief{count === 1 ? "" : "s"} · last 60 days
              </div>
            </Link>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
