"use client";
// components/FooterSubscribe.js
// Centred newsletter form used at the bottom of the home page.

import { useState } from "react";

const C = { gold: "#c4a265", text: "#e4e0d9", border: "#1f1f25", bgInput: "#18181c" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

export default function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home_footer" }),
      });
      setDone(true);
    } catch {}
    setLoading(false);
  }

  if (done) {
    return <div style={{ fontFamily: serif, fontStyle: "italic", color: C.gold, fontSize: 16 }}>Subscribed. Tomorrow's brief is on its way.</div>;
  }
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 480, margin: "0 auto" }}>
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{ flex: "1 1 240px", background: C.bgInput, border: `1px solid ${C.border}`, color: C.text, padding: "13px 16px", fontSize: 13, fontFamily: serif, borderRadius: 3, outline: "none" }}
      />
      <button type="submit" disabled={loading} style={{
        padding: "13px 22px", border: `1px solid ${C.gold}`, background: "transparent", color: C.gold,
        fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3,
        cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1,
      }}>
        {loading ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
