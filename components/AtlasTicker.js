"use client";
// components/AtlasTicker.js — REVISION 2
//
// Fixes:
//   • Live clock — ticks every second instead of being captured at render
//   • Replaces "Z" suffix with " UTC" (clearer for non-technical readers)
//   • Adds "fresh brief" indicator when latest article is < 6 hours old (porcelain accent)
//   • Index value now color-shifts based on label

import { useEffect, useState } from "react";

const C = {
  gold: "#c4a265", text: "#e4e0d9", textDim: "#5c5854", textSec: "#9d9890",
  border: "#1f1f25", bg: "#0c0c0f",
  crit: "#c45c5c", high: "#c49a5c", low: "#6b9e7a",
  porcelain: "#c8d4e0",
};
const mono = "'IBM Plex Mono', monospace";

function labelColor(label) {
  if (label === "ELEVATED") return C.crit;
  if (label === "HEIGHTENED") return C.high;
  if (label === "STABLE") return C.low;
  return C.gold;
}

function fmtClock(d) {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function AtlasTicker() {
  const [idx, setIdx] = useState(null);
  const [delta, setDelta] = useState(null);
  const [latestAge, setLatestAge] = useState(null); // hours since latest article
  const [now, setNow] = useState(() => new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch index once on mount; refresh every 5 min while page is open
  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/atlas-index").then((r) => r.json()).then((d) => {
        if (!alive) return;
        setIdx(d.latest); setDelta(d.delta);
      }).catch(() => {});
      fetch("/api/articles?limit=1").then((r) => r.json()).then((d) => {
        if (!alive) return;
        const a = d?.articles?.[0];
        if (a?.published_at) {
          const hours = (Date.now() - new Date(a.published_at).getTime()) / 3600000;
          setLatestAge(hours);
        }
      }).catch(() => {});
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const score = idx?.score ?? "—";
  const label = idx?.label || "—";
  const lc = labelColor(label);
  const dArrow = delta == null ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "■";
  const dColor = delta == null ? C.textDim : delta > 0 ? C.crit : delta < 0 ? C.low : C.textDim;
  const isFresh = latestAge != null && latestAge < 6;

  const segments = [
    { label: "ATLAS INDEX",    value: String(score),                          color: lc,        accent: label },
    { label: "Δ 24H",          value: delta == null ? "—" : `${dArrow} ${Math.abs(delta)}`, color: dColor },
    { label: "ACTIVE SOURCES", value: "20",                                    color: C.gold },
    { label: "HOTSPOTS",       value: "20",                                    color: C.gold },
    ...(isFresh ? [{ label: "LATEST BRIEF", value: "FRESH",                    color: C.porcelain }] : []),
    { label: "TIME",           value: `${fmtClock(now)} UTC`,                  color: C.textSec },
  ];

  return (
    <div
      style={{
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        gap: 28,
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
      }}
    >
      <div style={{ color: C.textDim, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: "pulse 2s infinite" }} />
        ATLAS · LIVE
      </div>
      <div style={{ width: 1, height: 12, background: C.border }} />
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ color: C.textDim }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: 500 }}>{s.value}</span>
            {s.accent && <span style={{ color: s.color, opacity: 0.7, fontSize: 9 }}>{s.accent}</span>}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
