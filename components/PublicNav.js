"use client";
// components/PublicNav.js
// The public site nav. Aware of auth state — shows Sign in / Open platform.
// Designed to feel like a building lobby reception desk: quiet, deliberate.

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

const C = { gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bg: "#09090b" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

function GB({ children, href, small, outline, onClick }) {
  const s = {
    display: "inline-block",
    padding: small ? "8px 16px" : "11px 22px",
    border: `1px solid ${outline ? C.border : C.gold}`,
    borderRadius: 3,
    background: "transparent",
    color: outline ? C.textSec : C.gold,
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
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => sub.subscription.unsubscribe();
  }, []);

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

      <div className="atlas-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link href="/intelligence" style={navLink}>Intelligence</Link>
        <Link href="/intelligence?cat=cyber" style={navLink}>Cyber</Link>
        <Link href="/intelligence?cat=geopolitics" style={navLink}>Geopolitics</Link>
        <Link href="/about" style={navLink}>About</Link>
        <Link href="/pricing" style={navLink}>Subscribe</Link>
        {user ? <GB small href="/app">Open Platform</GB>
              : <><GB small outline href="/login">Sign In</GB><GB small href="/signup">Get Started</GB></>}
      </div>

      <button
        className="atlas-nav-mobile"
        onClick={() => setOpen(!open)}
        style={{ display: "none", background: "transparent", border: `1px solid ${C.border}`, color: C.gold, padding: "8px 12px", fontFamily: mono, fontSize: 10, letterSpacing: 2, cursor: "pointer" }}
      >
        Menu
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.bg, borderTop: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <Link href="/intelligence" style={navLink}>Intelligence</Link>
          <Link href="/intelligence?cat=cyber" style={navLink}>Cyber</Link>
          <Link href="/intelligence?cat=geopolitics" style={navLink}>Geopolitics</Link>
          <Link href="/about" style={navLink}>About</Link>
          <Link href="/pricing" style={navLink}>Subscribe</Link>
          {user ? <GB small href="/app">Open Platform</GB>
                : <><GB small outline href="/login">Sign In</GB><GB small href="/signup">Get Started</GB></>}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .atlas-nav-desktop { display: none !important; }
          .atlas-nav-mobile { display: inline-block !important; }
        }
      `}</style>
    </nav>
  );
}

const navLink = { fontSize: 12, color: "#9d9890", fontWeight: 300, textDecoration: "none", letterSpacing: "0.3px" };
