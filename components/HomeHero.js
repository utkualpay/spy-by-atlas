"use client";
// components/HomeHero.js — REVISION 3
//
// CHANGES:
//   • Globe ≥ 60% visible — globe sits in a 50/50 grid, never cropped beyond
//     visual sense. Atmospheric backdrop carries the cinematic feel that the
//     yellow halo used to provide.
//   • F-pattern typography — eye lands on a powerful first line (top-left),
//     scans right, then drops to second line, then descends to body. The
//     hero copy deliberately follows the "promise → mechanism → CTA" order
//     that high-converting landing pages use.
//   • "Open Free Account" CTA goes to /signup (item 7).
//   • Trust strip below the fold — small chips signaling capabilities, with
//     gold dividers — gives a hint of platform depth before they scroll.

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

const TRUST_CHIPS = [
  "OSINT Search",
  "Breach Console",
  "War Room",
  "Executive Protection",
  "Dark Web Watch",
  "Supply-Chain Intel",
  "Daily Briefs",
];

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      }}
    >
      {/* Atmospheric backdrop — replaces what the globe halo used to do */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize: "44px 44px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -200, right: -200, width: 800, height: 800, background: "radial-gradient(circle, rgba(196,162,101,0.05) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -300, left: -200, width: 700, height: 700, background: "radial-gradient(circle, rgba(124,141,181,0.03) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: isMobile ? "60px 28px 80px" : "90px 48px 100px",
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
          gap: isMobile ? 40 : 60,
          alignItems: "center",
        }}
      >
        {/* COPY COLUMN — F-pattern: top-left eyepath */}
        <div>
          {/* Top-left chip — the first thing the eye notices */}
          {visitor && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 14px", border: `1px solid ${C.champagneDim}`,
              borderRadius: 999, marginBottom: 22,
              background: C.champagneDim,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.champagne, boxShadow: `0 0 10px ${C.champagne}`, animation: "atlasPulse 2.4s infinite" }} />
              <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.champagne, textTransform: "uppercase" }}>
                Connected · {visitor.city || visitor.country || "Worldwide"}
              </span>
            </div>
          )}

          {/* Eyebrow — establishes brand authority before headline */}
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>
            Atlas Intelligence — Private Intelligence Platform
          </div>

          {/* HEADLINE — top-left → scan-right F-pattern. The accent line
              ("on what's actually happening") is positioned where the eye
              naturally stops second. */}
          <h1 style={{
            fontFamily: serif,
            fontSize: "clamp(42px, 6.4vw, 88px)",
            fontWeight: 300,
            lineHeight: 1.0,
            letterSpacing: -1.6,
            margin: "0 0 24px",
          }}>
            See first.<br />
            <em style={{ color: C.gold, fontWeight: 400 }}>Act ahead.</em>
          </h1>

          {/* DEK — the mechanism. Explains what the platform IS before they scroll. */}
          <p style={{
            fontSize: 18, color: C.textSec, fontWeight: 300,
            lineHeight: 1.6, maxWidth: 560, margin: "0 0 14px",
          }}>
            <strong style={{ color: C.text, fontWeight: 400 }}>An intelligence platform built by intelligence professionals.</strong> Daily briefs are the floor. The platform is the ceiling — OSINT search, continuous breach monitoring, executive protection, dark-web watch, and a senior analyst on call.
          </p>

          {/* Sub-dek — pricing reassurance. Removes the "is this expensive?" friction. */}
          <p style={{
            fontSize: 14, color: C.textDim, fontWeight: 300,
            lineHeight: 1.55, maxWidth: 540, margin: "0 0 32px",
          }}>
            Free to read. Free to start. From $39/mo when you need the full platform.
          </p>

          {/* CTAs — primary action is the platform. Secondary is the brief. */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/signup" style={{
              padding: "15px 30px", background: C.gold, color: C.bg, border: `1px solid ${C.gold}`,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
              textDecoration: "none", borderRadius: 3, fontWeight: 500,
            }}>
              Open free account
            </Link>
            <Link href={lead ? `/intelligence/${lead.slug}` : "/intelligence"} style={{
              padding: "15px 30px", background: "transparent", color: C.gold, border: `1px solid ${C.gold}`,
              fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
              textDecoration: "none", borderRadius: 3,
            }}>
              Read today's brief →
            </Link>
          </div>

          {/* Trust strip — quietly hints that this is more than a brief site */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", maxWidth: 600 }}>
            <span style={{ fontSize: 10, fontFamily: mono, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginRight: 4 }}>
              Inside:
            </span>
            {TRUST_CHIPS.map((chip, i) => (
              <span key={i} style={{
                fontSize: 10, fontFamily: mono, color: C.textSec,
                padding: "4px 10px", border: `1px solid ${C.border}`,
                borderRadius: 999, letterSpacing: 1, textTransform: "uppercase",
                background: "rgba(196,162,101,0.03)",
              }}>
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* GLOBE COLUMN — sits right, ≥ 60% visible */}
        <div style={{ position: "relative" }}>
          <AtlasGlobe
            userLocation={visitor}
            crop={isMobile ? "none" : "right"}
            height={isMobile ? 380 : 560}
            scale={isMobile ? 1.0 : 1.4}
          />
        </div>
      </div>

      {/* Tiny stat strip below the hero — quiet, informational */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        background: "rgba(0,0,0,0.3)",
        padding: "14px 48px",
        display: "flex", justifyContent: "center", alignItems: "center", gap: 32,
        flexWrap: "wrap",
        fontSize: 10, fontFamily: mono, letterSpacing: 1.8, textTransform: "uppercase", color: C.textDim,
      }}>
        <span>20 conflict zones tracked</span>
        <span style={{ color: C.border }}>•</span>
        <span>20 source feeds</span>
        <span style={{ color: C.border }}>•</span>
        <span>Daily briefs at 06:00 UTC</span>
        <span style={{ color: C.border }}>•</span>
        <span style={{ color: C.sage }}>● ALL SYSTEMS OPERATIONAL</span>
      </div>

      <style>{`
        @keyframes atlasPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </section>
  );
}
