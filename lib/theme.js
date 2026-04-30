// lib/theme.js
// Atlas palette v2 — keeps the warm gold + dark base, adds restrained accent layer.
// Philosophy: dark is the canvas. Gold carries authority. The new accents
// (champagne + ivory + porcelain) are seasoning — used 5-10% of the surface,
// never more. Bright color is a privilege, not a default.

export const C = {
  // ── BASE (dark layer — the void) ────────────────────────────────
  bg:        "#09090b",
  bgCard:    "#131316",
  bgHover:   "#1a1a1f",
  bgSidebar: "#0c0c0f",
  bgInput:   "#18181c",
  border:    "#1f1f25",
  borderHover: "#2a2a32",

  // ── INK (text hierarchy) ────────────────────────────────────────
  text:    "#e4e0d9",
  textSec: "#9d9890",
  textDim: "#5c5854",

  // ── BRASS (the authority signal) ────────────────────────────────
  gold:     "#c4a265",
  goldDim:  "rgba(196,162,101,0.10)",
  goldMid:  "rgba(196,162,101,0.20)",
  goldHi:   "#d4b876",     // brighter brass — used for hover/active states only

  // ── ACCENTS (the new layer — used SPARINGLY: 1-2 places per page max) ──
  // Champagne — soft warm light. For positive states, success, gentle highlights.
  champagne:    "#e8d5a8",
  champagneDim: "rgba(232,213,168,0.12)",
  // Ivory — quiet white-warm. For premium tier badges, "members only" labels.
  ivory:        "#f5ede0",
  ivoryDim:     "rgba(245,237,224,0.08)",
  // Porcelain — pale cool blue-grey. For info notes, fresh-content tags.
  porcelain:    "#c8d4e0",
  porcelainDim: "rgba(200,212,224,0.08)",
  // Sage — pale muted green. For "verified", "stable", confirmation.
  sage:         "#b8d0a8",
  sageDim:      "rgba(184,208,168,0.10)",

  // ── SEVERITY (existing — keep for dashboard parity) ─────────────
  critical:    "#c45c5c",
  criticalDim: "rgba(196,92,92,0.10)",
  high:        "#c49a5c",
  highDim:     "rgba(196,154,92,0.10)",
  medium:      "#7c8db5",
  mediumDim:   "rgba(124,141,181,0.10)",
  low:         "#6b9e7a",
  lowDim:      "rgba(107,158,122,0.10)",
  info:        "#8b8db5",
  infoDim:     "rgba(139,141,181,0.10)",
};

// Accent usage rules (enforced by convention, not code):
//   1. champagne  → newsletter success states, "subscribed" confirmation, premium feature badges
//   2. ivory      → only on the highest-tier pricing card border + "Director's Edition" labels
//   3. porcelain  → "NEW" tags on fresh briefs (< 6 hours old), info callouts on article pages
//   4. sage       → "Verified analyst" badges, paid-subscriber indicator, signed-in welcome
// Never use more than ONE accent on the same screen at the same time outside of badges.

export const mono  = "'IBM Plex Mono', monospace";
export const serif = "'Cormorant Garamond', serif";
export const sans  = "'Raleway', sans-serif";

export const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Raleway:wght@200;300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Raleway', sans-serif; background: ${C.bg}; color: ${C.text}; -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
::selection { background: ${C.goldDim}; color: ${C.gold}; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes glow { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
@keyframes scanline { 0% { left: -100%; } 100% { left: 100%; } }
`;
