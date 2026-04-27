"use client";
// components/AtlasTicker.js
// The Bloomberg-style ribbon. Lives at the top of every public page.
// Fetches Atlas Index, latest article, and a few status signals.
// The first thing a stranger sees — sets tone, signals authority.

import { useEffect, useState } from "react";

const C = { gold: "#c4a265", text: "#e4e0d9", textDim: "#5c5854", textSec: "#9d9890", border: "#1f1f25", bg: "#0c0c0f", crit: "#c45c5c", high: "#c49a5c", low: "#6b9e7a" };
const mono = "'IBM Plex Mono',monospace";

function labelColor(label) {
  if (label === "ELEVATED") return C.crit;
  if (label === "HEIGHTENED") return C.high;
  if (label === "STABLE") return C.low;
  return C.gold;
}

export default function AtlasTicker() {
  const [idx, setIdx] = useState(null);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/atlas-index").then((r) => r.json()).then((d) => {
      if (!alive) return;
      setIdx(d.latest); setDelta(d.delta);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const score = idx?.score ?? "—";
  const label = idx?.label || "—";
  const lc = labelColor(label);
  const dArrow = delta == null ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "■";
  const dColor = delta == null ? C.textDim : delta > 0 ? C.crit : delta < 0 ? C.low : C.textDim;

  const segments = [
    { label: "ATLAS INDEX", value: String(score), color: lc, accent: label },
    { label: "Δ 24H", value: delta == null ? "—" : `${dArrow} ${Math.abs(delta)}`, color: dColor },
    { label: "ACTIVE SOURCES", value: "20", color: C.gold },
    { label: "HOTSPOTS", value: "20", color: C.gold },
    { label: "TIME", value: new Date().toUTCString().slice(17, 25) + "Z", color: C.textSec },
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
      <div style={{ color: C.textDim, fontWeight: 500 }}>ATLAS · LIVE</div>
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
    </div>
  );
}
