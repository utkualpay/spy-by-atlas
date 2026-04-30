"use client";
// components/HomeHero.js — REVISION 2
//
// MAJOR CHANGES:
//   • Globe is now a partial sphere entering from the right side of the canvas
//     — much bigger, more atmospheric. Mobile shows centred but reduced.
//   • Messaging broadened: "for anyone who needs to know first" instead of
//     "for principals" — keeps the executive feel via aesthetic, not exclusion
//   • Accent: champagne for the connection chip + sage for the live indicator
//     when subscribed. Tasteful, sparing, never both at once.
//   • Mobile: globe sits behind the copy as ambient backdrop, never overflows.

import { useState, useEffect } from "react";
import Link from "next/link";
import AtlasGlobe from "./AtlasGlobe";

const C = {
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  border: "#1f1f25", bg: "#09090b", bgInput: "#18181c",
  champagne: "#e8d5a8", champagneDim: "rgba(232,213,168,0.12)",
  sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
};
const serif = "'Cormorant Garamond', serif";
const mono  = "'IBM Plex Mono', monospace";

export default function HomeHero({ visitor, lead }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 980);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${C.border}`,
        minHeight: isMobile ? "auto" : 720,
      }}
    >
      {/* Atmospheric backdrop */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize: "44px 44px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -200, right: -200, width: 800, height: 800, background: "radial-gradient(circle, rgba(196,162,101,0.08) 0%, transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -300, left: -200, width: 700, height: 700, background: "radial-gradient(circle, rgba(124,141,181,0.04) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* Globe — absolutely positioned on desktop, fills right half + spills off-canvas */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: -240,           // pushes globe off-screen so only ~60% visible
            width: "75vw",         // wide enough that the globe feels gigantic
            maxWidth: 1100,
            height: "100%",
            pointerEvents: "none",
            opacity: 0.95,
          }}
          aria-hidden
        >
          <AtlasGlobe userLocation={visitor} crop="right" height={720} scale={1.55} />
        </div>
      )}

      {/* Mobile globe — small, ambient, BEHIND the copy */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -80,
            width: 360,
            height: 360,
            opacity: 0.55,
            pointerEvents: "none",
            zIndex: 0,
          }}
          aria-hidden
        >
          <AtlasGlobe userLocation={visitor} crop="none" height={360} scale={1.0} />
        </div>
      )}

      {/* Copy column — sits on the LEFT, with breathing room from the globe */}
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: isMobile ? "60px 28px 80px" : "100px 48px 110px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: isMobile ? "100%" : 620 }}>
          {visitor && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 14px", border: `1px solid ${C.champagneDim}`,
              borderRadius: 999, marginBottom: 26,
              background: C.champagneDim,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.champagne, boxShadow: `0 0 10px ${C.champagne}`, animation: "atlasPulse 2.4s infinite" }} />
              <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.champagne, textTransform: "uppercase" }}>
                Connected · {visitor.city || visitor.country || "Worldwide"}
              </span>
            </div>
          )}

          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 22 }}>
            Atlas Intelligence
          </div>

          <h1 style={{
            fontFamily: serif,
            fontSize: "clamp(38px, 6vw, 84px)",
            fontWeight: 300,
            lineHeight: 1.02,
            letterSpacing: -1.4,
            margin: "0 0 26px",
          }}>
            Know what's<br />
            <em style={{ color: C.gold, fontWeight: 400 }}>actually happening.</em>
          </h1>

          <p style={{
            fontSize: 18, color: C.textSec, fontWeight: 300,
            lineHeight: 1.65, maxWidth: 540, margin: "0 0 32px",
          }}>
            A daily intelligence brief — and a private platform for the days you need more than reading. Cyber, geopolitical, and risk analysis. Free to read. Free to start.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
            <Link href={lead ? `/intelligence/${lead.slug}` : "/intelligence"} style={{
              padding: "14px 28px", background: C.gold, color: C.bg, border: `1px solid ${C.gold}`,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
              textDecoration: "none", borderRadius: 3, fontWeight: 500,
            }}>
              Read today's brief
            </Link>
            <Link href="/signup" style={{
              padding: "14px 28px", background: "transparent", color: C.gold, border: `1px solid ${C.gold}`,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
              textDecoration: "none", borderRadius: 3,
            }}>
              Open free account
            </Link>
          </div>

          {/* Inline newsletter */}
          <div style={{ paddingTop: 26, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 12 }}>
              The Daily Atlas — one brief, every morning at 06:00 UTC
            </div>
            {subscribed ? (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 13, color: C.sage, fontFamily: serif, fontStyle: "italic",
                padding: "8px 14px", background: C.sageDim, borderRadius: 3,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage }} />
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
                  fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
                  borderRadius: 3, cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1,
                }}>
                  {loading ? "..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer caption inside the hero — tiny, sits below the globe area */}
      {!isMobile && (
        <div style={{
          position: "absolute", bottom: 24, right: 48,
          fontSize: 9, fontFamily: mono, letterSpacing: 3, color: C.textDim,
          textTransform: "uppercase", pointerEvents: "none", zIndex: 1,
        }}>
          Active monitoring · 20 conflict zones · 20 source feeds
        </div>
      )}

      <style>{`
        @keyframes atlasPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </section>
  );
}
