"use client";
// app/app/guide/page.js
//
// REVISION 3 — A dedicated beginner's guide for new subscribers (item 10).
// This is a standalone walkthrough page, accessible from anywhere in the
// platform. Different from the existing one-time onboarding flow — this
// one stays available so users can return to it whenever they need to.
//
// Structure: 6 visual sections, each explaining one core area of the platform.

import { useState } from "react";
import Link from "next/link";

const C = {
  bg: "#09090b", bgCard: "#131316", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  champagne: "#e8d5a8", sage: "#b8d0a8", sageDim: "rgba(184,208,168,0.10)",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

const SECTIONS = [
  {
    n: "01", title: "Your Command Center",
    desc: "When you sign in, you land on the Command Center. The left sidebar has every module organised by category. Critical metrics are at the top. Click any section to navigate.",
    do: "Sign in. Look at the left sidebar — that's your map.",
    next: "Generate a brief →",
    target: "/app",
  },
  {
    n: "02", title: "Generate Your First Brief",
    desc: "The Daily Brief is your morning briefing. It pulls from 20 intelligence sources, scored against your interest profile. Generate one each morning.",
    do: "Click 'Daily Brief' in the sidebar. Hit 'Generate Brief'. Wait ~10 seconds.",
    next: "Try OSINT search →",
    target: "/app?page=brief",
  },
  {
    n: "03", title: "Run an OSINT Search",
    desc: "OSINT (Open-Source Intelligence) lets you investigate any email, domain, person, company, or IP address. Every search produces a formal classified-style report saved to your archive.",
    do: "Click 'OSINT Search'. Type an email, domain, or company name. Pick the type. Click Search.",
    next: "Open the War Room →",
    target: "/app?page=osint",
  },
  {
    n: "04", title: "The War Room",
    desc: "When you have a question that doesn't fit a module — a security incident, a strategic question, a complex assessment — go to the War Room. A senior AI analyst will walk through it with you.",
    do: "Click 'War Room'. Describe the situation in plain language. The analyst responds in seconds.",
    next: "Set up breach monitoring →",
    target: "/app?page=warroom",
  },
  {
    n: "05", title: "Breach Monitoring",
    desc: "Continuously check whether your credentials, or those of people you protect, have been exposed in known breaches. Add multiple emails — get alerts when new breaches appear.",
    do: "Click 'Breach Console'. Add the emails you want monitored. Run an initial scan.",
    next: "Try Decoy Deployment →",
    target: "/app?page=breaches",
  },
  {
    n: "06", title: "Decoy Deployment",
    desc: "Embed steganographic tracking inside any image. If the image is leaked, you can extract the tracking payload to identify the source. Real working LSB cryptography.",
    do: "Click 'Decoy Deployment'. Upload any image. Type a payload (e.g., your case ID). Embed and download. The decoy is now traceable.",
    next: "All done →",
    target: "/app?page=decoy",
  },
];

export default function BeginnersGuide() {
  const [done, setDone] = useState(new Set());

  const toggle = (n) => {
    const next = new Set(done);
    if (next.has(n)) next.delete(n); else next.add(n);
    setDone(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "40px 24px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link href="/app" style={{ fontSize: 11, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            ← Back to platform
          </Link>
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>
            Beginner's Guide
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 48, fontWeight: 300, lineHeight: 1.05, letterSpacing: -0.6, margin: "0 0 14px" }}>
            Welcome to the platform.
          </h1>
          <p style={{ fontSize: 16, color: C.textSec, fontWeight: 300, lineHeight: 1.65, maxWidth: 620, margin: 0 }}>
            Six steps to find your way around. Walk through them in order, or jump to whichever module interests you. You can return here any time.
          </p>
        </div>

        {/* Progress strip */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          padding: "14px 20px",
          marginBottom: 30,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
            Progress
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {SECTIONS.map((s) => (
              <div key={s.n} style={{
                width: 24, height: 4, borderRadius: 2,
                background: done.has(s.n) ? C.sage : C.border,
                transition: "background 0.3s",
              }} />
            ))}
            <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.gold, marginLeft: 10 }}>
              {done.size}/{SECTIONS.length}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SECTIONS.map((s, i) => {
            const isDone = done.has(s.n);
            return (
              <div
                key={s.n}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${isDone ? "rgba(184,208,168,0.30)" : C.border}`,
                  borderRadius: 4,
                  padding: 28,
                  position: "relative",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <div style={{
                    flexShrink: 0, width: 52, height: 52,
                    border: `1px solid ${isDone ? C.sage : C.gold}`,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: serif, fontSize: 18,
                    color: isDone ? C.sage : C.gold,
                    background: isDone ? C.sageDim : "transparent",
                  }}>
                    {isDone ? "✓" : s.n}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 400, margin: "0 0 8px", color: C.text }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: 14, color: C.textSec, fontWeight: 300, lineHeight: 1.65, margin: "0 0 16px" }}>
                      {s.desc}
                    </p>
                    <div style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                      padding: "12px 16px",
                      marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>
                        Do this
                      </div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 300, lineHeight: 1.5 }}>
                        {s.do}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Link href={s.target} style={{
                        padding: "10px 20px",
                        background: C.gold, color: C.bg, border: `1px solid ${C.gold}`,
                        fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                        textDecoration: "none", borderRadius: 3, fontWeight: 500,
                      }}>
                        {s.next}
                      </Link>
                      <button
                        onClick={() => toggle(s.n)}
                        style={{
                          padding: "10px 20px",
                          background: isDone ? C.sageDim : "transparent",
                          color: isDone ? C.sage : C.textSec,
                          border: `1px solid ${isDone ? C.sage : C.border}`,
                          fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                          borderRadius: 3, cursor: "pointer",
                        }}
                      >
                        {isDone ? "✓ Marked done" : "Mark as done"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div style={{
          marginTop: 30,
          padding: 24,
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>
            Stuck?
          </div>
          <p style={{ fontSize: 13, color: C.textSec, fontWeight: 300, lineHeight: 1.6, margin: "0 0 14px" }}>
            Every module has its own help text. The War Room is the most flexible tool — describe what you're trying to figure out and the analyst will guide you.
          </p>
          <Link href="/app?page=warroom" style={{
            fontSize: 11, fontFamily: mono, letterSpacing: 2, color: C.gold,
            textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: 4,
          }}>
            Ask the War Room →
          </Link>
        </div>
      </div>
    </div>
  );
}
