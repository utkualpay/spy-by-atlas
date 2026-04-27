"use client";
// components/CoAnalyst.js
// The "ask a follow-up" widget on every article page.
// Differentiator: every reader has a senior analyst on call.

import { useState } from "react";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.08)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bgCard: "#131316", bgInput: "#18181c" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";
const sans = "'Raleway',sans-serif";

const SUGGESTIONS = [
  "Who is most exposed?",
  "What should a CISO do this week?",
  "Counter-arguments?",
  "What do we still not know?",
];

export default function CoAnalyst({ slug }) {
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function ask(question) {
    if (!question.trim() || loading) return;
    setLoading(true); setErr(null);
    try {
      const r = await fetch("/api/coanalyst", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, question }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "request_failed");
      setTurns((t) => [...t, { question, answer: data.answer }]);
      setQ("");
    } catch (e) {
      setErr(e.message === "rate_limited" ? "Slow down — too many questions in a minute." : "The analyst is unavailable right now.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, boxShadow: `0 0 10px ${C.gold}` }} />
        <span style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>Co-Analyst · On Call</span>
      </div>
      <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, color: C.text, margin: "0 0 4px" }}>Ask a follow-up</h3>
      <p style={{ fontSize: 12, color: C.textDim, fontWeight: 300, lineHeight: 1.55, margin: "0 0 18px" }}>
        A senior Atlas analyst will answer in a paragraph. Grounded in this brief.
      </p>

      {turns.length === 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} disabled={loading}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 10, fontFamily: mono, letterSpacing: 1, padding: "5px 10px", borderRadius: 2, cursor: "pointer", textTransform: "uppercase" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: turns.length ? 18 : 0 }}>
        {turns.map((t, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${C.gold}40`, paddingLeft: 14 }}>
            <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 1, color: C.textDim, textTransform: "uppercase", marginBottom: 8 }}>You asked</div>
            <div style={{ fontSize: 14, color: C.textSec, fontWeight: 300, marginBottom: 12, fontStyle: "italic" }}>{t.question}</div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 300, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{t.answer}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder="Type a question..."
          maxLength={400}
          style={{ flex: 1, background: C.bgInput, border: `1px solid ${C.border}`, color: C.text, padding: "11px 14px", fontSize: 13, fontFamily: sans, fontWeight: 300, borderRadius: 3, outline: "none" }}
        />
        <button onClick={() => ask(q)} disabled={loading || !q.trim()}
          style={{ background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, padding: "11px 18px", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", cursor: loading ? "default" : "pointer", borderRadius: 3, opacity: loading || !q.trim() ? 0.5 : 1 }}>
          {loading ? "..." : "Ask"}
        </button>
      </div>
      {err && <div style={{ marginTop: 10, fontSize: 11, color: "#c45c5c", fontFamily: mono }}>{err}</div>}
    </div>
  );
}
