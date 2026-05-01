"use client";
// components/DashboardErrorBoundary.js
//
// Catches any rendering crash in the dashboard tree and shows a useful
// fallback instead of the generic "client-side exception" Next.js page.

import React from "react";
import Link from "next/link";

const C = {
  bg: "#09090b", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", border: "#1f1f25", bgCard: "#131316",
  critical: "#c45c5c",
};
const serif = "'Cormorant Garamond', serif";
const mono = "'IBM Plex Mono', monospace";

export default class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== "undefined") {
      console.error("Dashboard render error:", error, info);
    }
  }

  render() {
    if (this.state.error) {
      const message = String(this.state.error?.message || this.state.error || "Unknown error");
      return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ maxWidth: 580, width: "100%", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: 40 }}>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 3, color: C.critical, textTransform: "uppercase", marginBottom: 14 }}>
              Platform Render Error
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 300, margin: "0 0 14px", letterSpacing: -0.4 }}>
              Something didn't load correctly.
            </h1>
            <p style={{ fontSize: 14, color: C.textSec, fontWeight: 300, lineHeight: 1.6, margin: "0 0 22px" }}>
              The platform encountered a rendering issue. The error details are below — please share them when reporting.
            </p>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, marginBottom: 22, fontSize: 11, fontFamily: mono, color: C.textSec, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              {message}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: "12px 22px", border: `1px solid ${C.gold}`, background: C.gold, color: C.bg, fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3, cursor: "pointer", fontWeight: 500 }}
              >
                Try again
              </button>
              <Link href="/" style={{ padding: "12px 22px", border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3, textDecoration: "none" }}>
                Return home
              </Link>
            </div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, marginTop: 22 }}>
              If this persists, contact support — include the error message above.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
