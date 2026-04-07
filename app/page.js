"use client";
import { useState } from "react";
import Link from "next/link";

const C = {
  bg: "#09090b", bgCard: "#131316", border: "#1f1f25", text: "#e4e0d9",
  textSec: "#9d9890", textDim: "#5c5854", gold: "#c4a265",
  goldDim: "rgba(196,162,101,0.10)",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";
const sans = "'Raleway', sans-serif";

function GoldBtn({ children, href, small, outline }) {
  const base = {
    display: "inline-block", padding: small ? "10px 22px" : "16px 32px",
    border: `1px solid ${outline ? C.border : C.gold}`, borderRadius: 3,
    background: "transparent", color: outline ? C.textSec : C.gold,
    fontSize: small ? 10 : 11, fontFamily: mono, letterSpacing: "2px",
    textTransform: "uppercase", cursor: "pointer", textDecoration: "none",
    transition: "all 0.3s", textAlign: "center",
  };
  if (href) return <Link href={href} style={base}>{children}</Link>;
  return <span style={base}>{children}</span>;
}

export default function LandingPage() {
  const features = [
    { title: "OSINT Search", desc: "AI-powered intelligence gathering across social platforms, breach databases, and the open web." },
    { title: "Threat Prediction", desc: "Pattern-of-life analysis combined with global threat intelligence to preempt security risks." },
    { title: "Document Intelligence", desc: "Fuzzy-hash leak detection finds edited, translated, or obfuscated versions of your proprietary files." },
    { title: "Data Suppression", desc: "Autonomous AI agents fire DMCA/GDPR takedowns. SEO burial networks for offshore content." },
    { title: "Decoy Deployment", desc: "LSB steganographic tracking payloads trace unauthorized file sharing. Instant leak-source alerts." },
    { title: "Insider Threat Analysis", desc: "Psychological modeling, sentiment analysis, and radius-of-influence mapping for your organization." },
    { title: "War Room", desc: "Real-time situational monitoring with actionable command controls and expert analyst access." },
    { title: "Executive Protection", desc: "Canary tokens, data poisoning, digital decoys, and continuous monitoring for high-value individuals." },
  ];

  const tiers = [
    { id: "obs", n: "Observer", p: "Free", f: ["5 OSINT searches/month", "Weekly digest", "Breach alerts", "Threat map"] },
    { id: "pro", n: "Professional", p: "$9.99", r: true, f: ["Unlimited OSINT", "Real-time monitoring", "NLP feed", "Sector filtering", "Footprint analysis", "Daily/weekly reports", "War Room", "Call center"] },
    { id: "exec", n: "Executive", p: "$29.99", f: ["Everything in Professional", "Data poisoning", "Document intelligence", "Decoy deployment", "Threat prediction", "Assigned analyst", "Legal consultancy", "Data suppression"] },
    { id: "ent", n: "Enterprise", p: "Custom", f: ["Everything in Executive", "Employee monitoring", "CPIR module", "Radius of influence", "Unlimited capacity", "Dedicated team", "Custom integrations", "SLA guarantee"] },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
        .gold-btn:hover { background: ${C.goldDim} !important; }
      `}</style>

      {/* Background effects */}
      <div style={{ position: "absolute", inset: 0, opacity: .01, backgroundImage: `radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, background: `radial-gradient(circle,rgba(196,162,101,0.04) 0%,transparent 70%)`, borderRadius: "50%", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, background: `radial-gradient(circle,rgba(139,141,181,0.03) 0%,transparent 70%)`, borderRadius: "50%", filter: "blur(60px)" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontSize: 22, fontFamily: serif, fontWeight: 300, color: C.gold, letterSpacing: "3px", lineHeight: 1 }}>Spy</span>
          <span style={{ fontSize: 7, color: C.textDim, fontFamily: mono, letterSpacing: "1.5px" }}>by Atlas</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#features" style={{ fontSize: 12, color: C.textSec, fontWeight: 300, cursor: "pointer", letterSpacing: ".5px", textDecoration: "none" }}>Features</a>
          <a href="#pricing" style={{ fontSize: 12, color: C.textSec, fontWeight: 300, cursor: "pointer", letterSpacing: ".5px", textDecoration: "none" }}>Pricing</a>
          <Link href="/demo" style={{ fontSize: 12, color: C.textSec, fontWeight: 300, cursor: "pointer", letterSpacing: ".5px", textDecoration: "none" }}>Demo</Link>
          <GoldBtn small href="/login">Sign In</GoldBtn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 60px 80px", textAlign: "center", position: "relative", zIndex: 1, animation: "fadeIn 1s ease" }}>
        <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: "4px", color: C.gold, textTransform: "uppercase", marginBottom: 24 }}>Intelligence as a Service</div>
        <h1 style={{ fontSize: 64, fontFamily: serif, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 24 }}>Know everything.<br />Before everyone.</h1>
        <p style={{ fontSize: 16, color: C.textSec, fontWeight: 200, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px", letterSpacing: ".2px" }}>
          Spy by Atlas is a private intelligence platform for individuals and organizations who require continuous awareness of their digital exposure, competitive landscape, and global threat environment.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <GoldBtn href="/signup">Get Started</GoldBtn>
          <GoldBtn href="/demo" outline>View Demo</GoldBtn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 60, padding: "40px 60px", position: "relative", zIndex: 1 }}>
        {[["46+", "Active conflicts tracked"], ["24", "Intelligence RSS sources"], ["28", "Conflict zones monitored"], ["24/7", "Multilingual support"]].map(([v, l], i) =>
          <div key={i} style={{ textAlign: "center", animation: `fadeIn 0.6s ease ${.3 + i * .1}s both` }}>
            <div style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, color: C.gold, marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono, letterSpacing: ".8px" }}>{l}</div>
          </div>
        )}
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth: 1100, margin: "60px auto 0", padding: "0 60px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: "3px", color: C.textDim, textTransform: "uppercase", marginBottom: 12 }}>Capabilities</div>
          <h2 style={{ fontSize: 32, fontFamily: serif, fontWeight: 300 }}>Full-Spectrum Intelligence</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {features.map((f, i) =>
            <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 28, animation: `fadeIn 0.5s ease ${.4 + i * .08}s both` }}>
              <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: "1.5px", color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>{f.title}</div>
              <p style={{ fontSize: 12, color: C.textDim, fontWeight: 200, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ maxWidth: 1100, margin: "80px auto 0", padding: "0 60px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: "3px", color: C.textDim, textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontSize: 32, fontFamily: serif, fontWeight: 300 }}>Intelligence as a Service</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {tiers.map((p, i) =>
            <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${p.r ? "rgba(196,162,101,0.25)" : C.border}`, borderRadius: 4, padding: 28, position: "relative", animation: `fadeIn 0.4s ease ${i * .08}s both` }}>
              {p.r && <div style={{ position: "absolute", top: -1, left: 24, padding: "3px 12px", background: C.gold, color: C.bg, fontSize: 9, fontFamily: mono, letterSpacing: "1.5px", textTransform: "uppercase", borderRadius: "0 0 3px 3px" }}>Recommended</div>}
              <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: "2px", color: C.textDim, textTransform: "uppercase", marginBottom: 10 }}>{p.n}</div>
              <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 300, marginBottom: 20 }}>{p.p}<span style={{ fontSize: 13, color: C.textDim }}>{p.p !== "Free" && p.p !== "Custom" ? "/mo" : ""}</span></div>
              {p.f.map((f, j) =>
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textSec, fontWeight: 200, marginBottom: 6 }}>
                  <span style={{ color: C.gold, fontSize: 9 }}>&#10022;</span>{f}
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <GoldBtn small href="/signup">{p.p === "Custom" ? "Contact Us" : "Get Started"}</GoldBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "80px 60px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ width: 40, height: 1, background: C.gold, margin: "0 auto 24px", opacity: .3 }} />
        <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: "1.5px", color: C.textDim }}>SPY BY ATLAS — atlasspy.com — INTELLIGENCE AS A SERVICE</div>
        <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: "1px", color: C.textDim, marginTop: 8 }}>2026 Atlas Design Institute. All rights reserved.</div>
      </div>
    </div>
  );
}
