"use client";
// components/ConversionWall.js
// The TradingView pattern: free signup unlocks the rest of the brief
// + the platform's analyst tools. Premium upgrade always one click away.

import Link from "next/link";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bgCard: "#131316", bg: "#09090b" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

export default function ConversionWall() {
  return (
    <div style={{ position: "relative", marginTop: -60, paddingTop: 60 }}>
      {/* Fade overlay — the gradient is what sells the wall */}
      <div style={{
        position: "absolute", top: -80, left: 0, right: 0, height: 140,
        background: `linear-gradient(to bottom, transparent 0%, ${C.bg}aa 50%, ${C.bg} 100%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        background: C.bgCard,
        border: `1px solid rgba(196,162,101,0.25)`,
        borderRadius: 4,
        padding: "44px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle warm glow */}
        <div style={{ position: "absolute", top: -100, left: "50%", width: 400, height: 200, background: "radial-gradient(circle, rgba(196,162,101,0.10) 0%, transparent 70%)", filter: "blur(30px)", transform: "translateX(-50%)", pointerEvents: "none" }} />

        <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14, position: "relative" }}>
          The rest of this brief is inside the platform
        </div>
        <h3 style={{ fontFamily: serif, fontSize: 32, fontWeight: 400, color: C.text, margin: "0 0 14px", lineHeight: 1.2, position: "relative" }}>
          Continue reading. Free.
        </h3>
        <p style={{ fontSize: 14, color: C.textSec, fontWeight: 300, lineHeight: 1.7, maxWidth: 540, margin: "0 auto 26px", position: "relative" }}>
          A free Atlas account unlocks the full briefing, the co-analyst, daily delivery to your inbox, and a sector-personalised feed.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 26, position: "relative" }}>
          <Link href="/signup" style={{
            padding: "13px 28px", border: `1px solid ${C.gold}`, background: C.gold, color: C.bg,
            fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3, fontWeight: 500,
          }}>
            Open free account
          </Link>
          <Link href="/login" style={{
            padding: "13px 28px", border: `1px solid ${C.border}`, background: "transparent", color: C.textSec,
            fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3,
          }}>
            Sign in
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 720, margin: "0 auto", position: "relative" }} className="conversion-grid">
          {[
            ["Full brief", "Implications, sources, methodology"],
            ["Co-Analyst", "Ask follow-ups on every brief"],
            ["Sector feed", "Briefs filtered to what matters to you"],
          ].map(([t, d], i) => (
            <div key={i} style={{ textAlign: "left", padding: "0 14px", borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>✦ {t}</div>
              <div style={{ fontSize: 12, color: C.textDim, fontWeight: 300, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, paddingTop: 22, borderTop: `1px solid ${C.border}`, position: "relative" }}>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 8 }}>
            For continuous monitoring
          </div>
          <Link href="/pricing" style={{
            fontSize: 13, color: C.gold, fontFamily: serif, fontStyle: "italic", textDecoration: "underline",
            textDecorationColor: "rgba(196,162,101,0.4)", textUnderlineOffset: 4,
          }}>
            See subscription tiers — from $49/mo →
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .conversion-grid { grid-template-columns: 1fr !important; }
          .conversion-grid > div { border-left: none !important; }
        }
      `}</style>
    </div>
  );
}
