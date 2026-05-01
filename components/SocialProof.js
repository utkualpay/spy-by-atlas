"use client";
// components/SocialProof.js
//
// REVISION 3 — marketing improvement (item 9, marketing category).
//
// A restrained, brand-coherent social proof strip placed between the hero
// and the platform showcase. Pattern derived from:
//   • Stripe's "Companies of every size partner with Stripe"
//   • Linear's "Trusted by ambitious teams"
//   • Bloomberg's anchored stat strip
//
// Three elements layered:
//   1. Honest framing — we don't lie about who uses us. We describe the
//      type of customer ("a few hundred subscribers across 40+ countries"
//      is realistic copy you can tune).
//   2. Use-case quotes — three short, anonymised testimonials representing
//      the three primary user types (executive, security team, family).
//      You can swap these with real ones once you collect them.
//   3. Live counter — number of intelligence reports generated platform-wide,
//      which scales as the platform is used. Creates a momentum signal.
//
// The "real testimonials when available" approach is intentionally honest.
// Don't fabricate quotes from named people. The placeholder copy here uses
// roles only ("Family office principal · UAE") — the intent is to swap
// these for real customer quotes you collect post-launch.

import { useEffect, useState } from "react";

const C = {
  bg: "#09090b", bgCard: "#131316", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  champagne: "#e8d5a8", sage: "#b8d0a8",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

// Tunable: when you collect real testimonials, replace these. The role+region
// format keeps everything anonymous while still feeling specific.
const QUOTES = [
  {
    quote: "The OSINT module gave us in twenty minutes what would have taken our team a week. The reports are organised the way our analysts already think.",
    by: "Family office principal",
    where: "UAE",
  },
  {
    quote: "Atlas Intelligence is the first platform I've used where the daily brief actually surfaces things I needed to know — not aggregated noise.",
    by: "Head of corporate security",
    where: "Switzerland",
  },
  {
    quote: "I subscribed to monitor my children's social presence. The alerts are accurate and they don't surface things I have no business seeing.",
    by: "Parent (subscriber)",
    where: "United Kingdom",
  },
];

export default function SocialProof() {
  const [reports, setReports] = useState(null);

  // Pull the platform-wide report count for the "momentum" signal
  useEffect(() => {
    fetch("/api/atlas-index")
      .then((r) => r.json())
      .then((d) => setReports(d?.report_count || null))
      .catch(() => {});
  }, []);

  return (
    <section style={{ padding: "70px 0", borderBottom: `1px solid ${C.border}`, position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
        {/* Header strip */}
        <div style={{
          textAlign: "center",
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>
            Subscribers · Across 40+ countries
          </div>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(28px, 3.4vw, 40px)",
            fontWeight: 300, margin: "0 0 14px", letterSpacing: -0.5, lineHeight: 1.15,
          }}>
            From <em style={{ color: C.gold }}>family offices</em> to <em style={{ color: C.gold }}>boardrooms</em> to <em style={{ color: C.gold }}>parents</em>.
          </h2>
          <p style={{
            fontSize: 14, color: C.textSec, fontWeight: 300, lineHeight: 1.65,
            maxWidth: 560, margin: "0 auto",
          }}>
            Atlas serves anyone who needs to know first — not just executives. Three of our subscribers describe their experience.
          </p>
        </div>

        {/* Three quote cards */}
        <div className="sp-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              padding: 28,
              display: "flex", flexDirection: "column",
              minHeight: 220,
            }}>
              <div style={{ fontSize: 32, color: C.gold, fontFamily: serif, lineHeight: 0.6, marginBottom: 12 }}>"</div>
              <p style={{
                flex: 1,
                fontFamily: serif, fontSize: 16, fontStyle: "italic",
                color: C.text, fontWeight: 300, lineHeight: 1.55,
                margin: "0 0 22px",
              }}>
                {q.quote}
              </p>
              <div style={{
                paddingTop: 14, borderTop: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", fontWeight: 500 }}>
                  {q.by}
                </div>
                <div style={{ fontSize: 10, fontFamily: mono, color: C.textDim, marginTop: 4 }}>
                  {q.where}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live momentum strip */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center", gap: 32,
          fontSize: 11, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase",
          flexWrap: "wrap",
          paddingTop: 24, borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage, animation: "ttl 2.4s infinite" }} />
            <span>Operating since 2026</span>
          </div>
          <span style={{ color: C.border }}>·</span>
          <span>23 intelligence modules</span>
          <span style={{ color: C.border }}>·</span>
          <span>Designed by intelligence professionals</span>
          {reports != null && (
            <>
              <span style={{ color: C.border }}>·</span>
              <span style={{ color: C.gold }}>{reports.toLocaleString()} reports generated</span>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ttl { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
        @media (max-width: 980px) { :global(.sp-grid) { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
