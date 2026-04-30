"use client";
// components/ArticleAddons.js
// Three differentiator add-ons sourced from peer platforms:
//
//   1. ReadingProgress  — Bloomberg-Terminal-style top progress bar.
//                         Subtle, fixed, fills as user scrolls.
//   2. ReadingTime      — Foreign Affairs / Stratfor pattern. Shown next
//                         to the byline.
//   3. SaveButton       — Stratfor "My Collections" pattern. Logged-in
//                         users can save briefs to a personal library.
//
// All three are small, additive, and never block the reading experience.

import { useEffect, useState } from "react";

const C = {
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  border: "#1f1f25", bg: "#09090b", bgCard: "#131316",
  champagne: "#e8d5a8", sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
};
const mono = "'IBM Plex Mono', monospace";

// ── 1. Reading progress bar (top of screen) ──────────────────────
export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
      setPct(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 2,
      background: "transparent", zIndex: 100, pointerEvents: "none",
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: C.gold,
        boxShadow: `0 0 8px ${C.gold}`,
        transition: "width 0.05s linear",
      }} />
    </div>
  );
}

// ── 2. Reading-time badge (calculated on the server but rendered here) ──
export function ReadingTime({ minutes }) {
  if (!minutes || minutes < 1) return null;
  return (
    <span style={{
      fontSize: 10, fontFamily: mono, letterSpacing: 1.2, color: C.textDim,
      textTransform: "uppercase",
    }}>
      {minutes} min read
    </span>
  );
}

// ── 3. Save button — adds article to user's collection ──────────────
export function SaveButton({ articleId, slug }) {
  const [saved, setSaved] = useState(false);
  const [authed, setAuthed] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      setAuthed(d.authenticated === true);
      if (d.authenticated && articleId) {
        fetch(`/api/saved?article_id=${articleId}`).then((r) => r.json()).then((s) => setSaved(!!s.saved)).catch(() => {});
      }
    }).catch(() => setAuthed(false));
  }, [articleId]);

  async function toggle() {
    if (!authed) { window.location.href = `/signup?next=/intelligence/${slug}`; return; }
    setLoading(true);
    try {
      const r = await fetch("/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: articleId }),
      });
      if (r.ok) setSaved(!saved);
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 12px",
        background: saved ? C.sageDim : "transparent",
        border: `1px solid ${saved ? C.sage : C.border}`,
        color: saved ? C.sage : C.textSec,
        fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
        borderRadius: 3, cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.5 : 1,
      }}
      title={authed ? (saved ? "Remove from your library" : "Save to your library") : "Sign in to save"}
    >
      <span style={{ fontSize: 11 }}>{saved ? "✓" : "+"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
