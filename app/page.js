// app/page.js — REVISION 3
//
// Restructured homepage to address item 1 (showcase platform capabilities).
// New section order:
//   1. Hero (atmospheric, brand-establishing)
//   2. Platform Showcase (the new section — 23 modules visible)
//   3. Today's Lead Brief (the daily content hook)
//   4. Recent briefs grid (continuity)
//   5. Newsletter signup (the conversion ladder)
//
// The platform showcase is now the SECOND thing visitors see, immediately
// after the hero, so no one can miss the depth of capability.

import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";
import ArticleCard from "@/components/ArticleCard";
import HomeHero from "@/components/HomeHero";
import PlatformShowcase from "@/components/PlatformShowcase";
import SocialProof from "@/components/SocialProof";
import FooterSubscribe from "@/components/FooterSubscribe";

export const dynamic = "force-dynamic";

const C = {
  gold: "#c4a265", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  border: "#1f1f25", bg: "#09090b", bgCard: "#131316",
};
const serif = "'Cormorant Garamond', serif";
const mono = "'IBM Plex Mono', monospace";

export const metadata = {
  title: "Atlas Intelligence — Private Intelligence Platform & Daily Briefs",
  description: "Atlas Intelligence is a private intelligence-as-a-service platform. Daily briefs and 23 intelligence modules: OSINT, breach monitoring, executive protection, dark web watch. Spy by Atlas — where intelligence professionals work.",
  alternates: { canonical: "https://atlasspy.com", types: { "application/rss+xml": "https://atlasspy.com/api/feed.xml" } },
};

function readVisitorLocation(h) {
  const lat = parseFloat(h.get("x-vercel-ip-latitude") || "");
  const lng = parseFloat(h.get("x-vercel-ip-longitude") || "");
  const city = h.get("x-vercel-ip-city") || "";
  const country = (h.get("x-vercel-ip-country") || "").toUpperCase();
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return { lat, lng, city: decodeURIComponent(city), country };
}

export default async function HomePage() {
  const h = await headers();
  const visitor = readVisitorLocation(h);

  let articles = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const result = await supabase
      .from("articles")
      .select("id, slug, headline, dek, category, sectors, severity, source_name, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(7);
    articles = result.data || [];
  } catch {}

  const lead = articles[0];
  const rest = articles.slice(1, 7);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, overflowX: "hidden" }}>
      <AtlasTicker />
      <PublicNav />

      {/* 1. Hero with cropped globe (≥60% visible) */}
      <HomeHero visitor={visitor} lead={lead} />

      {/* 2. Social proof — three subscriber quotes + momentum strip */}
      <SocialProof />

      {/* 3. Platform Showcase — depth of capability, immediately visible */}
      <PlatformShowcase />

      {/* 3. Lead brief — the daily content hook */}
      {lead && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="atlas-spotlight">
            <div>
              <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>
                Today's Lead Brief
              </div>
              <h2 style={{ fontFamily: serif, fontSize: 44, fontWeight: 400, lineHeight: 1.1, letterSpacing: -0.5, margin: "0 0 18px" }}>
                {lead.headline}
              </h2>
              {lead.dek && <p style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", color: C.textSec, fontWeight: 300, lineHeight: 1.55, margin: "0 0 28px" }}>{lead.dek}</p>}
              <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <Link href={`/intelligence/${lead.slug}`} style={{ padding: "13px 28px", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>
                  Read full brief
                </Link>
                <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
                  Source · {lead.source_name}
                </span>
              </div>
            </div>
            <div>
              <ArticleCard article={lead} />
            </div>
          </div>
        </section>
      )}

      {/* 4. Recent briefs */}
      {rest.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
            <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 300, margin: 0 }}>Recent briefs</h2>
            <Link href="/intelligence" style={{ fontSize: 11, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase", textDecoration: "none" }}>
              See all →
            </Link>
          </div>
          <div className="atlas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {rest.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}

      {/* 5. Newsletter (when there are no articles, this becomes the primary CTA) */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "120px 48px 60px", textAlign: "center" }}>
        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>The Daily Atlas</div>
        <h2 style={{ fontFamily: serif, fontSize: 38, fontWeight: 300, margin: "0 0 14px", letterSpacing: -0.5 }}>One brief, every morning at 06:00 UTC.</h2>
        <p style={{ fontSize: 14, color: C.textSec, fontWeight: 300, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
          The day's most consequential intelligence story. Free, no marketing emails.
        </p>
        <FooterSubscribe />
      </section>

      <PublicFooter />

      <style>{`
        @media (max-width: 1024px) {
          .atlas-spotlight { grid-template-columns: 1fr !important; }
          .atlas-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 640px) {
          .atlas-grid { grid-template-columns: 1fr !important; }
          h2 { font-size: 30px !important; }
        }
      `}</style>
    </div>
  );
}
