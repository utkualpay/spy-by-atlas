// app/page.js
// The new home. Plaza-feel: ticker, atrium, globe, brief feed, conversion.
// Server component fetches latest articles + visitor location from Vercel headers.

import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";
import ArticleCard from "@/components/ArticleCard";
import HomeHero from "@/components/HomeHero";
import FooterSubscribe from "@/components/FooterSubscribe";

export const dynamic = "force-dynamic";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bg: "#09090b", bgCard: "#131316" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

export const metadata = {
  title: "Atlas Intelligence — Daily Briefs & Private Intelligence Platform",
  description: "Daily intelligence briefs and a private platform for executives. Cyber, geopolitical, and risk analysis written by intelligence professionals.",
  alternates: { canonical: "https://atlasspy.com", types: { "application/rss+xml": "https://atlasspy.com/api/feed.xml" } },
};

// Vercel injects geo headers for every request. Free, no API call needed.
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, headline, dek, category, sectors, severity, source_name, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(7);

  const lead = articles?.[0];
  const rest = (articles || []).slice(1, 7);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, overflowX: "hidden" }}>
      <AtlasTicker />
      <PublicNav />

      <HomeHero visitor={visitor} lead={lead} />

      {/* Today's brief / spotlight */}
      {lead && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 0", position: "relative" }}>
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

      {/* Recent briefs grid */}
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

      {/* Why Atlas / pitch — corporate, not salesy */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 48px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>
            The Atlas Platform
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 44, fontWeight: 300, margin: "0 0 16px", letterSpacing: -0.5 }}>
            <em style={{ color: C.gold }}>Reading</em> these briefs is the floor.
          </h2>
          <p style={{ fontSize: 16, color: C.textSec, fontWeight: 300, maxWidth: 660, margin: "0 auto", lineHeight: 1.6 }}>
            The platform is the ceiling. Continuous monitoring, OSINT search, breach detection, executive protection, and a senior analyst on call — for principals who need to know first.
          </p>
        </div>

        <div className="atlas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            ["OSINT Search", "Analyst-grade research across the open and closed web."],
            ["Breach Console", "Continuous credential exposure monitoring with formal impact assessments."],
            ["Executive Protection", "Canary tokens, decoy deployment, and data-broker suppression."],
            ["War Room", "Brief a senior analyst at any hour. Receive a written assessment."],
            ["Dark Web Watch", "Forums, marketplaces, and leak sites under your name."],
            ["Travel Security", "Pre-trip threat assessments and live-route monitoring."],
            ["Supply-Chain Intel", "Vendor risk scoring against breach and OFAC data."],
            ["Daily Briefs", "These — but personalised to your sector and exposure."],
          ].map(([t, d], i) => (
            <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 22 }}>
              <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>{t}</div>
              <p style={{ fontSize: 12, color: C.textDim, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 50, flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "14px 32px", border: `1px solid ${C.gold}`, background: C.gold, color: C.bg, fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3, fontWeight: 500 }}>
            Open free account
          </Link>
          <Link href="/pricing" style={{ padding: "14px 32px", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3 }}>
            Subscription tiers
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "120px 48px 0", textAlign: "center" }}>
        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>The Daily Atlas</div>
        <h2 style={{ fontFamily: serif, fontSize: 38, fontWeight: 300, margin: "0 0 14px", letterSpacing: -0.5 }}>One brief, every morning at 06:00 UTC.</h2>
        <p style={{ fontSize: 14, color: C.textSec, fontWeight: 300, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
          No marketing emails. No promotions. The day's most consequential intelligence story, written for principals.
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
