"use client";
// components/PublicFooter.js
// Brand-grade footer with social, legal, and brand statement.
// Social URLs come from env vars so you can swap them without code changes:
//   NEXT_PUBLIC_TWITTER_URL  (e.g., https://x.com/atlasintel)
//   NEXT_PUBLIC_INSTAGRAM_URL
//   NEXT_PUBLIC_LINKEDIN_URL

import Link from "next/link";

const C = { gold: "#c4a265", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854", border: "#1f1f25", bg: "#06060a" };
const serif = "'Cormorant Garamond',serif";
const mono = "'IBM Plex Mono',monospace";

const X_URL = process.env.NEXT_PUBLIC_TWITTER_URL || "#";
const IG_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
const LI_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL || "#";

const SocialLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
     style={{ fontSize: 11, color: C.textSec, textDecoration: "none", fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 3 }}>
    {children}
  </a>
);

const FooterLink = ({ href, children }) => (
  <Link href={href} style={{ fontSize: 11, color: C.textDim, fontFamily: mono, textDecoration: "none", letterSpacing: 0.5 }}>{children}</Link>
);

export default function PublicFooter() {
  return (
    <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, marginTop: 80, padding: "60px 48px 36px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
        {/* Brand column */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 26, fontFamily: serif, fontWeight: 300, color: C.gold, letterSpacing: 3 }}>Spy</span>
            <span style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: 2 }}>by Atlas</span>
          </div>
          <p style={{ fontSize: 12, color: C.textSec, fontWeight: 300, lineHeight: 1.7, maxWidth: 360, marginBottom: 18 }}>
            A private intelligence service. Daily briefs, continuous monitoring, and analyst-grade tools for principals, executives, and the people they protect.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SocialLink href={X_URL}>X · @AtlasIntel</SocialLink>
            <SocialLink href={IG_URL}>Instagram</SocialLink>
            <SocialLink href={LI_URL}>LinkedIn</SocialLink>
            <a href="/api/feed.xml" style={{ fontSize: 11, color: C.textSec, textDecoration: "none", fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 3 }}>RSS</a>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 14 }}>Intelligence</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FooterLink href="/intelligence">All briefs</FooterLink>
            <FooterLink href="/intelligence?cat=cyber">Cyber</FooterLink>
            <FooterLink href="/intelligence?cat=geopolitics">Geopolitics</FooterLink>
            <FooterLink href="/intelligence?cat=ics">Critical Infrastructure</FooterLink>
            <FooterLink href="/intelligence?cat=finance">Financial</FooterLink>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 14 }}>Platform</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FooterLink href="/about">About Atlas</FooterLink>
            <FooterLink href="/pricing">Subscribe</FooterLink>
            <FooterLink href="/demo">Live Demo</FooterLink>
            <FooterLink href="/login">Sign in</FooterLink>
            <FooterLink href="/signup">Open account</FooterLink>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 14 }}>Legal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/eula">EULA</FooterLink>
            <FooterLink href="/refund">Refunds</FooterLink>
            <FooterLink href="/cookies">Cookies</FooterLink>
            <FooterLink href="/acceptable-use">Acceptable Use</FooterLink>
            <FooterLink href="/disclaimer">Disclaimer</FooterLink>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: `1px solid ${C.border}`, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
          © 2026 Atlas Design Institute · Designed by intelligence professionals
        </div>
        <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim }}>
          Briefs are editorial commentary, not actionable intelligence. Always verify primary sources.
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 800px) {
          footer > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          footer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
