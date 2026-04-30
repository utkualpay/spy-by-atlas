"use client";
// app/pricing/page.js — REVISION 2
//
// CHANGES vs v1:
//   • Billing-cycle toggle: Monthly · Quarterly (-5%) · Yearly (-20%)
//   • Subscribe CTAs go DIRECTLY to /api/checkout?tier=...&cycle=... (Paddle redirect),
//     NOT to /signup. (Item 8.)
//   • Ivory accent on the most-popular tier border (single restrained accent use).
//   • Sage "Free forever" tag on Observer.
//   • Mobile: stacks cleanly, all tiers reachable.

import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AtlasTicker from "@/components/AtlasTicker";

const C = {
  bg: "#09090b", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", goldHi: "#d4b876",
  bgCard: "#131316", border: "#1f1f25",
  champagne: "#e8d5a8", ivory: "#f5ede0", ivoryDim: "rgba(245,237,224,0.08)",
  sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
  porcelain: "#c8d4e0",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";
const sans = "'Raleway', sans-serif";

// Base monthly prices. Discounts applied at display time.
const TIERS = [
  {
    id: "observer", n: "Observer", basePrice: 0, alwaysFree: true,
    desc: "Free forever — read & explore",
    f: [
      "Read all daily intelligence briefs",
      "Co-Analyst Q&A on every brief",
      "Live situation map",
      "Atlas Index access",
      "Newsletter delivery",
    ],
    cta: "Open free account", checkoutHref: "/signup",
  },
  {
    id: "personal_pro", n: "Personal Pro", basePrice: 49,
    desc: "7-day free trial",
    recommended: true,
    f: [
      "Everything in Observer",
      "Unlimited OSINT search",
      "Personalised daily briefs",
      "War Room senior analyst",
      "Breach monitoring & alerts",
      "Digital footprint analysis",
      "Data broker removal",
      "Travel security briefings",
      "Reports archive",
    ],
    cta: "Start free trial", paddleTier: "personal_pro",
  },
  {
    id: "business", n: "Business Premium", basePrice: 149,
    desc: "+$15 per additional seat",
    f: [
      "Everything in Personal Pro",
      "Supply-chain threat mapping",
      "Dark web monitoring",
      "Deception technology (canary tokens)",
      "Team seat management",
      "Fraud detection",
      "Case management",
      "Geospatial intelligence",
      "Predictive threat forecasting",
      "CPIR insider-threat module",
    ],
    cta: "Start free trial", paddleTier: "business",
  },
  {
    id: "executive", n: "Director's Edition", basePrice: null,
    desc: "White-glove · custom",
    premium: true,
    f: [
      "Everything in Business Premium",
      "Dedicated analyst team",
      "Active deepfake poisoning",
      "Custom intelligence integrations",
      "SLA guarantee",
      "Direct analyst hotline",
      "Bespoke quarterly reporting",
    ],
    cta: "Request consultation", checkoutHref: "/app?page=consult",
  },
];

const CYCLES = [
  { id: "monthly",   label: "Monthly",   discount: 0,    suffix: "/mo", note: null },
  { id: "quarterly", label: "Quarterly", discount: 0.05, suffix: "/mo", note: "Billed every 3 months · save 5%" },
  { id: "yearly",    label: "Yearly",    discount: 0.20, suffix: "/mo", note: "Billed annually · save 20%" },
];

function applyDiscount(base, discount) {
  if (base == null) return null;
  return Math.round(base * (1 - discount));
}

export default function PricingPage() {
  const [cycle, setCycle] = useState("monthly");
  const cur = CYCLES.find((c) => c.id === cycle);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: sans }}>
      <AtlasTicker />
      <PublicNav />

      <header style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 48px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>
          Subscription
        </div>
        <h1 style={{ fontSize: 48, fontFamily: serif, fontWeight: 300, marginBottom: 12, letterSpacing: -0.6 }}>
          Pick your tier. Pay as it suits.
        </h1>
        <p style={{ fontSize: 15, color: C.textSec, fontWeight: 300, maxWidth: 580, margin: "0 auto 28px", lineHeight: 1.65 }}>
          Reading is free, always. Upgrade only when you need the platform's analyst tools — billed monthly, quarterly, or yearly with corresponding discounts.
        </p>
      </header>

      {/* Billing cycle toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{
          display: "inline-flex", gap: 4,
          background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 999, padding: 4,
        }}>
          {CYCLES.map((c) => {
            const active = c.id === cycle;
            return (
              <button
                key={c.id}
                onClick={() => setCycle(c.id)}
                style={{
                  padding: "9px 20px",
                  background: active ? C.gold : "transparent",
                  color: active ? C.bg : C.textSec,
                  border: "none",
                  borderRadius: 999,
                  fontSize: 11, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                  cursor: "pointer",
                  fontWeight: active ? 500 : 400,
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                {c.label}
                {c.discount > 0 && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 2,
                    background: active ? `${C.bg}40` : C.sageDim, color: active ? C.bg : C.sage,
                  }}>
                    −{Math.round(c.discount * 100)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {cur.note && (
        <div style={{ textAlign: "center", fontSize: 11, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, marginBottom: 36 }}>
          {cur.note}
        </div>
      )}
      {!cur.note && <div style={{ marginBottom: 36 }} />}

      {/* Tier grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 60px" }}>
        <div className="tg" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {TIERS.map((t, i) => {
            const price = t.basePrice == null ? null : applyDiscount(t.basePrice, cur.discount);
            const isRecommended = t.recommended;
            const isPremium = t.premium;
            const borderColor = isRecommended
              ? "rgba(196,162,101,0.45)"
              : isPremium
                ? "rgba(245,237,224,0.30)"
                : C.border;

            const checkoutHref =
              t.checkoutHref ||
              (t.paddleTier ? `/api/checkout?tier=${t.paddleTier}&cycle=${cycle}` : "/signup");

            return (
              <div key={t.id} style={{
                background: C.bgCard,
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                padding: 28,
                position: "relative",
                animation: `fadeIn 0.4s ease ${i * 0.06}s both`,
                display: "flex", flexDirection: "column",
              }}>
                {isRecommended && (
                  <div style={{
                    position: "absolute", top: -1, left: 20,
                    padding: "3px 14px",
                    background: C.gold, color: C.bg,
                    fontSize: 9, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                    borderRadius: "0 0 4px 4px",
                  }}>Most Popular</div>
                )}
                {isPremium && (
                  <div style={{
                    position: "absolute", top: -1, left: 20,
                    padding: "3px 14px",
                    background: C.ivory, color: C.bg,
                    fontSize: 9, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                    borderRadius: "0 0 4px 4px",
                  }}>Director's Edition</div>
                )}

                <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 8 }}>{t.n}</div>

                <div style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, marginBottom: 4, lineHeight: 1.1 }}>
                  {t.alwaysFree ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      Free
                      <span style={{ fontSize: 10, padding: "3px 10px", background: C.sageDim, color: C.sage, borderRadius: 999, fontFamily: mono, letterSpacing: 1.5, fontWeight: 500 }}>FOREVER</span>
                    </span>
                  ) : price == null ? (
                    "Custom"
                  ) : (
                    <>
                      ${price}
                      <span style={{ fontSize: 13, color: C.textDim }}>{cur.suffix}</span>
                      {cur.discount > 0 && (
                        <span style={{ fontSize: 13, color: C.textDim, textDecoration: "line-through", marginLeft: 10 }}>
                          ${t.basePrice}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, marginBottom: 22 }}>{t.desc}</div>

                <div style={{ flex: 1, marginBottom: 22 }}>
                  {t.f.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.textSec, fontWeight: 300, marginBottom: 7, lineHeight: 1.5 }}>
                      <span style={{ color: C.gold, fontSize: 9, marginTop: 4, flexShrink: 0 }}>✦</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Checkout CTA — direct to Paddle for paid tiers */}
                <Link
                  href={checkoutHref}
                  style={{
                    display: "block",
                    padding: "13px 20px",
                    border: `1px solid ${isRecommended ? C.gold : isPremium ? C.ivory : C.gold}`,
                    background: isRecommended ? C.gold : "transparent",
                    color: isRecommended ? C.bg : isPremium ? C.ivory : C.gold,
                    fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase",
                    textAlign: "center", textDecoration: "none", borderRadius: 3,
                    fontWeight: isRecommended ? 500 : 400,
                  }}
                >
                  {t.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison footer */}
      <div style={{ maxWidth: 700, margin: "20px auto 60px", padding: "0 48px", textAlign: "center" }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: "22px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 400, marginBottom: 6 }}>
            Business accounts: add team members for $15/seat/month
          </div>
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 300, lineHeight: 1.6 }}>
            Master account holder manages all seats. Each member gets an isolated dashboard. Billing consolidated.
          </div>
        </div>
      </div>

      <PublicFooter />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        @media (max-width: 1024px) { .tg { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px)  { .tg { grid-template-columns: 1fr !important; } header h1 { font-size: 36px !important; } }
      `}</style>
    </div>
  );
}
