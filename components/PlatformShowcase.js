"use client";
// components/PlatformShowcase.js
//
// The "no one sees the work in the background" fix.
// A prominent, visual section on the homepage that demonstrates the platform's
// depth — module cards, mock dashboard preview, trust signals.
//
// Pattern derived from: Linear's product feature scroll, Stripe's "Used by",
// Vercel's "What's possible" section. The goal is to make new visitors think
// "wait — there's a real platform here, not just a newsletter."

import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  bg: "#09090b", bgCard: "#131316", bgHover: "#1a1a1f",
  border: "#1f1f25", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  champagne: "#e8d5a8", sage: "#b8d0a8", porcelain: "#c8d4e0", ivory: "#f5ede0",
  critical: "#c45c5c", high: "#c49a5c",
};
const serif = "'Cormorant Garamond', serif";
const mono  = "'IBM Plex Mono', monospace";

// 8 modules grouped into 4 themes — represents the actual platform breadth
const MODULES = [
  {
    theme: "Investigation",
    accent: C.gold,
    items: [
      { name: "OSINT Search", desc: "Analyst-grade research on emails, domains, individuals, companies." },
      { name: "Link Analysis", desc: "Map relationships across people, organisations, and digital identities." },
      { name: "Identity Verification", desc: "KYC, board diligence, fraud detection at the individual level." },
      { name: "Document Intel", desc: "Forensic document analysis, metadata extraction, authenticity." },
    ],
  },
  {
    theme: "Defence",
    accent: C.critical,
    items: [
      { name: "Breach Console", desc: "Continuous credential exposure monitoring with formal impact assessments." },
      { name: "Dark Web Watch", desc: "Forums, marketplaces, and leak sites — under your name and your company's." },
      { name: "Executive Protection", desc: "Family security, travel briefings, threat trajectory modelling." },
      { name: "Make Me Invisible", desc: "Data broker suppression and digital footprint reduction." },
    ],
  },
  {
    theme: "Deception",
    accent: C.champagne,
    items: [
      { name: "Decoy Deployment", desc: "LSB steganographic tracking — leak a decoy, trace the source." },
      { name: "Honeytokens", desc: "Generate canary credentials. Get alerts the moment they're touched." },
      { name: "Fraud Detection", desc: "BEC, payment fraud, impersonation — risk-graded with reasoning." },
      { name: "Insider Threat (CPIR)", desc: "Psychometric employee assessment, anonymous response collection." },
    ],
  },
  {
    theme: "Awareness",
    accent: C.porcelain,
    items: [
      { name: "Daily Briefs", desc: "Morning intelligence on what changed across cyber, geopolitical, financial." },
      { name: "Geospatial Intel", desc: "Location-based threat assessment for cities, facilities, regions." },
      { name: "Predictive Forecast", desc: "30 / 60 / 90-day threat horizon analysis by sector." },
      { name: "Travel Security", desc: "Pre-trip risk assessments and live route monitoring." },
    ],
  },
];

export default function PlatformShowcase() {
  const [activeTheme, setActiveTheme] = useState(0);
  const [stats, setStats] = useState(null);

  // Pull live numbers from the Atlas Index for credibility
  useEffect(() => {
    fetch("/api/atlas-index").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <section style={{ position: "relative", padding: "100px 0", borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
      {/* Subtle backdrop */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.018, backgroundImage: `radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize: "44px 44px", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px", position: "relative" }}>
        {/* Section heading — establishes the subject */}
        <div style={{ textAlign: "center", marginBottom: 60, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>
            The Atlas Platform
          </div>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(36px, 4.6vw, 56px)", fontWeight: 300, margin: "0 0 18px", letterSpacing: -0.8, lineHeight: 1.05 }}>
            Reading the briefs is the floor.<br />
            <em style={{ color: C.gold, fontWeight: 400 }}>The platform is the ceiling.</em>
          </h2>
          <p style={{ fontSize: 16, color: C.textSec, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            Twenty-three intelligence modules, designed and operated by intelligence professionals. Every module produces formal, classified-style reports — saved to your private archive, never shared.
          </p>
        </div>

        {/* Theme tabs — clicking one swaps the four module cards below */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
          {MODULES.map((m, i) => {
            const active = i === activeTheme;
            return (
              <button
                key={m.theme}
                onClick={() => setActiveTheme(i)}
                style={{
                  padding: "10px 22px",
                  background: active ? m.accent : "transparent",
                  border: `1px solid ${active ? m.accent : C.border}`,
                  color: active ? C.bg : C.textSec,
                  fontSize: 11,
                  fontFamily: mono,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {m.theme}
              </button>
            );
          })}
        </div>

        {/* Module cards — 4 visible at a time, themed by the active tab */}
        <div className="ps-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 60,
        }}>
          {MODULES[activeTheme].items.map((item, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: 24,
                position: "relative",
                animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
                minHeight: 160,
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: MODULES[activeTheme].accent,
                marginBottom: 14,
              }} />
              <div style={{
                fontSize: 14, fontFamily: serif, fontWeight: 400,
                color: C.text, marginBottom: 8,
              }}>
                {item.name}
              </div>
              <div style={{
                fontSize: 12, color: C.textDim, fontWeight: 300,
                lineHeight: 1.55,
              }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Stat strip — establishes scale */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          padding: "30px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 30,
          marginBottom: 50,
          textAlign: "center",
        }} className="ps-stats">
          <div>
            <div style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, color: C.gold, lineHeight: 1 }}>23</div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginTop: 6 }}>
              Intelligence Modules
            </div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, color: C.gold, lineHeight: 1 }}>20</div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginTop: 6 }}>
              Conflict Zones Tracked
            </div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, color: C.gold, lineHeight: 1 }}>20</div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginTop: 6 }}>
              Intelligence Sources
            </div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, color: C.gold, lineHeight: 1 }}>
              {stats?.latest?.score ?? "—"}
            </div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginTop: 6 }}>
              Live Atlas Index
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            padding: "15px 32px",
            background: C.gold, color: C.bg, border: `1px solid ${C.gold}`,
            fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
            textDecoration: "none", borderRadius: 3, fontWeight: 500,
          }}>
            Open free account
          </Link>
          <Link href="/pricing" style={{
            padding: "15px 32px",
            background: "transparent", color: C.textSec, border: `1px solid ${C.border}`,
            fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
            textDecoration: "none", borderRadius: 3,
          }}>
            See subscription tiers
          </Link>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .ps-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .ps-stats { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 600px) {
            .ps-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
