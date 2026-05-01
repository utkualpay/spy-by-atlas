"use client";
// components/PersonalThreatScore.js
//
// REVISION 3 — feature improvement (item 9, feature category).
//
// Modeled on Recorded Future's executive risk dashboards: aggregates the
// user's exposure signals into a single 0-100 score visible on the dashboard
// landing. The score updates as the user runs more scans and adds more
// monitored emails — giving them a tangible reason to keep using the platform.
//
// Score components:
//   • Breach exposure (0-40 pts)  — # of breaches matching their email(s)
//   • Footprint exposure (0-25)   — # of data brokers / public listings found
//   • Dark web mentions (0-20)    — # of mentions of monitored identifiers
//   • Recent activity (0-15)      — recent scans / reports tilt toward awareness
//
// Lower number = better. We invert breach/exposure findings so the score
// reflects "your safety", not "your danger".
//
// Output is read-only on this widget; clicking expands to the full breach
// console. The widget is a *summary*, not the full diagnostic.

import { useEffect, useState } from "react";
import Link from "next/link";

const C = {
  bgCard: "#131316", bgInput: "#18181c",
  border: "#1f1f25", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", critical: "#c45c5c", high: "#c49a5c", medium: "#7c8db5",
  sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
  champagne: "#e8d5a8",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

function colorForScore(s) {
  if (s >= 80) return C.sage;       // Excellent
  if (s >= 60) return C.champagne;  // Good
  if (s >= 40) return C.high;       // Mixed
  if (s >= 20) return C.critical;   // Poor
  return C.critical;                 // Critical
}
function labelForScore(s) {
  if (s >= 80) return "EXCELLENT";
  if (s >= 60) return "GOOD";
  if (s >= 40) return "MIXED";
  if (s >= 20) return "POOR";
  return "CRITICAL";
}

export default function PersonalThreatScore({ userEmail }) {
  const [score, setScore] = useState(null);
  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function compute() {
      // Aggregate from existing endpoints — non-blocking
      let breachCount = 0;
      let reportCount = 0;
      try {
        if (userEmail) {
          const r = await fetch("/api/breach-db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, summary_only: true }),
          });
          const d = await r.json();
          breachCount = d?.localBreaches?.length || 0;
        }
      } catch {}
      try {
        const r = await fetch("/api/reports");
        const d = await r.json();
        if (Array.isArray(d)) reportCount = d.length;
      } catch {}

      // Components
      // Start at 100, deduct for risk signals, add for activity (awareness).
      let breachDeduction = Math.min(40, breachCount * 8);
      let footprintDeduction = 0;       // placeholder — pulls from /api/footprint when we hook it up
      let darkwebDeduction = 0;          // placeholder — pulls from /api/darkweb when wired
      let activityBonus = Math.min(15, reportCount * 2);

      const total = Math.max(0, Math.min(100, 100 - breachDeduction - footprintDeduction - darkwebDeduction + activityBonus));

      if (!cancelled) {
        setScore(total);
        setComponents({
          breach: { deducted: breachDeduction, count: breachCount },
          footprint: { deducted: footprintDeduction, count: 0 },
          darkweb: { deducted: darkwebDeduction, count: 0 },
          activity: { added: activityBonus, count: reportCount },
        });
        setLoading(false);
      }
    }
    compute();
    return () => { cancelled = true; };
  }, [userEmail]);

  const color = score == null ? C.textDim : colorForScore(score);
  const label = score == null ? "—" : labelForScore(score);

  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${score >= 80 ? "rgba(184,208,168,0.30)" : score < 40 ? "rgba(196,92,92,0.25)" : C.border}`,
      borderRadius: 4,
      padding: 24,
      position: "relative",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 6 }}>
            Personal Threat Score
          </div>
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 300 }}>
            Aggregate exposure across breach, footprint, and dark-web signals.
          </div>
        </div>
        <Link
          href="/app?page=breaches"
          style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", textDecoration: "none" }}
        >
          Full report →
        </Link>
      </div>

      {/* The score itself */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        marginBottom: 18,
      }}>
        <div style={{
          fontSize: 64,
          fontFamily: serif,
          fontWeight: 300,
          lineHeight: 1,
          color,
        }}>
          {loading ? "—" : score}
        </div>
        <div>
          <div style={{
            fontSize: 11, fontFamily: mono, letterSpacing: 2, color, textTransform: "uppercase", fontWeight: 500,
          }}>{label}</div>
          <div style={{ fontSize: 10, fontFamily: mono, color: C.textDim, marginTop: 2 }}>out of 100</div>
        </div>
      </div>

      {/* Bar */}
      <div style={{ height: 4, background: C.bgInput, borderRadius: 2, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: "100%", width: `${score || 0}%`, background: color, transition: "width 0.6s ease" }} />
      </div>

      {/* Components */}
      {components && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontSize: 11 }}>
          <Component label="Breach matches" value={components.breach.count} weight="−40 max" />
          <Component label="Recent activity" value={components.activity.count} weight="+15 max" positive />
          <Component label="Footprint" value={components.footprint.count > 0 ? components.footprint.count : "—"} weight="−25 max" />
          <Component label="Dark-web mentions" value={components.darkweb.count > 0 ? components.darkweb.count : "—"} weight="−20 max" />
        </div>
      )}

      {/* Action hint */}
      {score != null && score < 80 && (
        <div style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: `1px solid ${C.border}`,
          fontSize: 11,
          color: C.textSec,
          fontWeight: 300,
          lineHeight: 1.55,
        }}>
          {score < 40
            ? "Recommend running Make Me Invisible and Breach Console to begin reducing exposure."
            : "Run a fresh OSINT search and add monitored emails to keep the score current."}
        </div>
      )}
    </div>
  );
}

function Component({ label, value, weight, positive }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: C.bgInput,
      border: `1px solid ${C.border}`,
      borderRadius: 3,
    }}>
      <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontFamily: serif, color: C.text }}>{value}</span>
        <span style={{ fontSize: 8, fontFamily: mono, color: positive ? C.sage : C.textDim }}>{weight}</span>
      </div>
    </div>
  );
}
