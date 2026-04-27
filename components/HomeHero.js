"use client";
// components/HomeHero.js
// The atrium. The first 100% of the screen.
// Slow globe on the right, headline + dek + CTAs on the left.
// On mobile the globe sits below.

import { useState } from "react";
import Link from "next/link";
import AtlasGlobe from "./AtlasGlobe";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bg: "#09090b", bgInput: "#18181c" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

export default function HomeHero({ visitor, lead }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe(e) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home_hero" }),
      });
      setSubscribed(true);
    } catch {}
    setLoading(false);
  }

  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
      {/* Atmospheric backdrop */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize: "44px 44px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -200, right: -200, width: 700, height: 700, background: "radial-gradient(circle, rgba(196,162,101,0.06) 0%, transparent 60%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -200, left: -200, width: 600, height: 600, background: "radial-gradient(circle, rgba(124,141,181,0.04) 0%, transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "70px 48px 90px", display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 40, alignItems: "center", position: "relative", zIndex: 1 }} className="atlas-hero">
        {/* Left: copy */}
        <div>
          {visitor && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", border: `1px solid ${C.border}`, borderRadius: 999, marginBottom: 26, background: "rgba(196,162,101,0.04)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, boxShadow: `0 0 10px ${C.gold}`, animation: "atlasPulse 2.4s infinite" }} />
              <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textSec, textTransform: "uppercase" }}>
                Connected · {visitor.city || visitor.country || "Worldwide"}
              </span>
            </div>
          )}
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 22 }}>
            Atlas Intelligence — Est. 2026
          </div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(40px, 5.6vw, 76px)", fontWeight: 300, lineHeight: 1.02, letterSpacing: -1.4, margin: "0 0 26px" }}>
            Know everything.<br />
            <em style={{ color: C.gold, fontWeight: 400 }}>Before everyone.</em>
          </h1>
          <p style={{ fontSize: 18, color: C.textSec, fontWeight: 300, lineHeight: 1.65, maxWidth: 560, margin: "0 0 32px" }}>
            A private intelligence service for principals, executives, and the people they protect. Read the daily brief — or open the platform.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
            <Link href={lead ? `/intelligence/${lead.slug}` : "/intelligence"} style={{
              padding: "14px 28px", background: C.gold, color: C.bg, border: `1px solid ${C.gold}`,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3, fontWeight: 500,
            }}>
              Read today's brief
            </Link>
            <Link href="/signup" style={{
              padding: "14px 28px", background: "transparent", color: C.gold, border: `1px solid ${C.gold}`,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", borderRadius: 3,
            }}>
              Open the platform
            </Link>
          </div>

          {/* Inline newsletter strip */}
          <div style={{ paddingTop: 26, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 12 }}>
              The Daily Atlas — one brief, every morning at 06:00 UTC
            </div>
            {subscribed ? (
              <div style={{ fontSize: 13, color: C.gold, fontFamily: serif, fontStyle: "italic" }}>
                Subscribed. Tomorrow's brief is on its way.
              </div>
            ) : (
              <form onSubmit={subscribe} style={{ display: "flex", gap: 8, maxWidth: 480 }}>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ flex: 1, background: C.bgInput, border: `1px solid ${C.border}`, color: C.text, padding: "11px 14px", fontSize: 13, fontFamily: serif, borderRadius: 3, outline: "none" }}
                />
                <button type="submit" disabled={loading} style={{
                  padding: "11px 20px", border: `1px solid ${C.gold}`, background: "transparent", color: C.gold,
                  fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3, cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1,
                }}>
                  {loading ? "..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: globe */}
        <div style={{ position: "relative" }}>
          <AtlasGlobe userLocation={visitor} height={580} />
          <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 3, color: C.textDim, textTransform: "uppercase" }}>
              Active monitoring · 20 conflict zones · 20 source feeds
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes atlasPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        @media (max-width: 980px) {
          .atlas-hero { grid-template-columns: 1fr !important; }
          .atlas-hero > div:last-child { order: -1; }
        }
      `}</style>
    </section>
  );
}
