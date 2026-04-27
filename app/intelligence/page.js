// app/intelligence/page.js
// Public archive of all briefs. Filterable by category and sector.
// Server-rendered for SEO + speed; filters use server queries via search params.

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

const C = { gold: "#c4a265", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bg: "#09090b", bgCard: "#131316" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "cyber", label: "Cyber" },
  { key: "geopolitics", label: "Geopolitics" },
  { key: "policy", label: "Policy" },
  { key: "ics", label: "Infrastructure" },
  { key: "finance", label: "Financial" },
  { key: "health", label: "Healthcare" },
];

export const metadata = {
  title: "Intelligence Briefs — Atlas Intelligence",
  description: "Daily intelligence briefs on cyber, geopolitical, and infrastructure threats. Curated from open sources, written in the Atlas voice.",
  alternates: { canonical: "https://atlasspy.com/intelligence", types: { "application/rss+xml": "https://atlasspy.com/api/feed.xml" } },
  openGraph: { title: "Atlas Intelligence — Daily Briefs", description: "Cyber, geopolitical, and risk intelligence for executives." },
};

export default async function IntelligencePage({ searchParams }) {
  const params = await searchParams;
  const cat = params?.cat || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  let q = supabase
    .from("articles")
    .select("id, slug, headline, dek, category, sectors, severity, source_name, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(60);
  if (cat) q = q.eq("category", cat);
  const { data: articles } = await q;

  const lead = (articles || [])[0];
  const rest = (articles || []).slice(1);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <AtlasTicker />
      <PublicNav />

      {/* Header */}
      <header style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 36px" }}>
        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>
          The Atlas Intelligence Brief
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 56, fontWeight: 300, lineHeight: 1.05, letterSpacing: -1, margin: 0, marginBottom: 14 }}>
          Daily briefs from <em style={{ color: C.gold }}>across the threat surface</em>.
        </h1>
        <p style={{ fontSize: 16, color: C.textSec, fontWeight: 300, maxWidth: 680, lineHeight: 1.65, margin: 0 }}>
          Curated from twenty intelligence-grade sources. Rewritten in the Atlas voice. One brief published every morning at 06:00 UTC.
        </p>
      </header>

      {/* Filter bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 28px", display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, paddingBottom: 28 }}>
        {CATEGORIES.map((c) => {
          const active = c.key === cat;
          return (
            <Link key={c.key || "all"} href={c.key ? `/intelligence?cat=${c.key}` : "/intelligence"}
              style={{
                fontSize: 11, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "8px 16px", borderRadius: 3, textDecoration: "none",
                background: active ? C.gold : "transparent",
                color: active ? C.bg : C.textSec,
                border: `1px solid ${active ? C.gold : C.border}`,
                fontWeight: active ? 500 : 400,
              }}>
              {c.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px 60px" }}>
        {articles && articles.length > 0 ? (
          <>
            {lead && (
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 3, color: C.textDim, textTransform: "uppercase", marginBottom: 14 }}>
                  Today's Lead Brief
                </div>
                <ArticleCard article={lead} size="lead" />
              </div>
            )}
            {rest.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 3, color: C.textDim, textTransform: "uppercase", marginBottom: 18, marginTop: 10 }}>
                  Recent Briefs
                </div>
                <div className="atlas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                  {rest.map((a) => <ArticleCard key={a.id} article={a} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 60, textAlign: "center" }}>
            <div style={{ fontFamily: serif, fontSize: 22, color: C.textSec, marginBottom: 8 }}>The first brief publishes at 06:00 UTC tomorrow.</div>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono, letterSpacing: 1 }}>Check back shortly.</div>
          </div>
        )}
      </main>

      <PublicFooter />

      <style>{`
        @media (max-width: 1024px) { .atlas-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .atlas-grid { grid-template-columns: 1fr !important; } header h1 { font-size: 38px !important; } }
      `}</style>
    </div>
  );
}
