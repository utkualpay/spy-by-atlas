"use client";
// components/ArticleCard.js
import Link from "next/link";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bgCard: "#131316",
  crit: "#c45c5c", high: "#c49a5c", med: "#7c8db5", low: "#6b9e7a", info: "#8b8db5" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

const SEV = {
  critical: { color: C.crit, label: "CRITICAL" },
  high: { color: C.high, label: "HIGH" },
  medium: { color: C.med, label: "MODERATE" },
  low: { color: C.low, label: "LOW" },
  info: { color: C.info, label: "INFO" },
};

const CAT = {
  cyber: "Cyber",
  geopolitics: "Geopolitics",
  policy: "Policy",
  ics: "Infrastructure",
  finance: "Financial",
  health: "Healthcare",
};

function relativeTime(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ArticleCard({ article, size = "default" }) {
  const sev = SEV[article.severity] || SEV.medium;
  const isLead = size === "lead";
  return (
    <Link
      href={`/intelligence/${article.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: isLead ? 36 : 26,
        transition: "border-color .25s, transform .25s",
        position: "relative",
        height: "100%",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(196,162,101,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isLead ? 22 : 16, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: sev.color,
          padding: "3px 10px", border: `1px solid ${sev.color}40`, borderRadius: 2,
          textTransform: "uppercase", fontWeight: 500,
        }}>{sev.label}</span>
        <span style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
          {CAT[article.category] || article.category}
        </span>
        <span style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1, color: C.textDim, marginLeft: "auto" }}>
          {relativeTime(article.published_at)}
        </span>
      </div>
      <h3 style={{
        fontFamily: serif, fontSize: isLead ? 34 : 22, fontWeight: 400,
        lineHeight: 1.18, letterSpacing: -0.3, color: C.text, marginBottom: 12, marginTop: 0,
      }}>{article.headline}</h3>
      {article.dek && <p style={{
        fontSize: isLead ? 15 : 13, color: C.textSec, fontWeight: 300, lineHeight: 1.65,
        marginBottom: 18, margin: "0 0 18px 0",
      }}>{article.dek}</p>}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 14, borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.2, color: C.textDim, textTransform: "uppercase" }}>
          Source · {article.source_name}
        </span>
        <span style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase" }}>Read →</span>
      </div>
    </Link>
  );
}
