"use client";
// components/PublicNav.js — REVISION 2

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

const C = {
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  border: "#1f1f25", bg: "#09090b", bgCard: "#131316",
  champagne: "#e8d5a8", sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
};
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

function GB({ children, href, small, outline, onClick, accent }) {
  const c = accent === "champagne" ? C.champagne : C.gold;
  const s = {
    display: "inline-block",
    padding: small ? "8px 16px" : "11px 22px",
    border: `1px solid ${outline ? C.border : c}`,
    borderRadius: 3,
    background: "transparent",
    color: outline ? C.textSec : c,
    fontSize: small ? 10 : 11,
    fontFamily: mono,
    letterSpacing: "2px",
    textTransform: "uppercase",
    cursor: "pointer",
    textDecoration: "none",
  };
  return href ? <Link href={href} style={s}>{children}</Link> : <button onClick={onClick} style={s}>{children}</button>;
}

export default function PublicNav({ transparent = false }) {
  const [me, setMe] = useState({ authenticated: false });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setMe(d || { authenticated: false })).catch(() => {});
    const sb = createClient();
    const { data: sub } = sb.auth.onAuthStateChange(() => {
      fetch("/api/me").then((r) => r.json()).then((d) => setMe(d || { authenticated: false })).catch(() => {});
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const navLink = { fontSize: 12, color: C.textSec, fontWeight: 300, textDecoration: "none", letterSpacing: "0.3px" };

  const navItems = (
    <>
      <Link href="/intelligence" style={navLink}>Intelligence</Link>
      <Link href="/intelligence/topics" style={navLink}>Topics</Link>
      <Link href="/intelligence?cat=cyber" style={navLink}>Cyber</Link>
      <Link href="/intelligence?cat=geopolitics" style={navLink}>Geopolitics</Link>
      {me.authenticated && <Link href="/library" style={{ ...navLink, color: C.champagne }}>Your Library</Link>}
      <Link href="/about" style={navLink}>About</Link>
      <Link href="/pricing" style={navLink}>Subscribe</Link>
    </>
  );

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 48px",
        background: transparent ? "transparent" : C.bg,
        borderBottom: transparent ? "none" : `1px solid ${C.border}`,
        position: "relative",
        zIndex: 20,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 6, textDecoration: "none" }}>
        <span style={{ fontSize: 24, fontFamily: serif, fontWeight: 300, color: C.gold, letterSpacing: 3 }}>Spy</span>
        <span style={{ fontSize: 8, color: C.textDim, fontFamily: mono, letterSpacing: "2px" }}>by Atlas</span>
      </Link>

      <div className="atlas-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {navItems}
        {me.authenticated ? (
          <>
            {me.is_paying && (
              <span style={{
                fontSize: 9, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                color: C.sage, padding: "3px 8px", borderRadius: 2,
                background: C.sageDim, border: `1px solid rgba(184,208,168,0.20)`,
              }}>
                {me.tier === "business" ? "Business" : me.tier === "executive" ? "Executive" : "Pro"} · Active
              </span>
            )}
            <GB small href="/app">Open Platform</GB>
          </>
        ) : (
          <>
            <GB small outline href="/login">Sign In</GB>
            <GB small href="/signup">Get Started</GB>
          </>
        )}
      </div>

      <button
        className="atlas-nav-mobile"
        onClick={() => setOpen(!open)}
        style={{ display: "none", background: "transparent", border: `1px solid ${C.border}`, color: C.gold, padding: "8px 12px", fontFamily: mono, fontSize: 10, letterSpacing: 2, cursor: "pointer", borderRadius: 3 }}
      >
        Menu
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.bg, borderTop: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 16, zIndex: 30 }}>
          {navItems}
          {me.authenticated ? <GB small href="/app">Open Platform</GB>
            : <><GB small outline href="/login">Sign In</GB><GB small href="/signup">Get Started</GB></>}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 1100px) {
          .atlas-nav-desktop { display: none !important; }
          .atlas-nav-mobile { display: inline-block !important; }
        }
      `}</style>
    </nav>
  );
}
