"use client";
// components/PublicFooter.js — REVISION 3
//
// Now features the Atlas Titan mark prominently — the figure carrying the
// globe on his shoulders, rendered as a quiet line-art SVG. This is the
// brand's mythological foundation made visible (item 2).

import Link from "next/link";
import AtlasTitan from "./AtlasTitan";

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
    <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: "60px 48px 30px", marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Top — brand statement with Atlas Titan mark */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 50,
          alignItems: "center",
          marginBottom: 40,
          paddingBottom: 36,
          borderBottom: `1px solid ${C.border}`,
        }} className="footer-top">
          {/* Atlas Titan mark */}
          <div style={{ flexShrink: 0 }}>
            <AtlasTitan size={120} color={C.gold} opacity={0.85} showRings />
          </div>

          {/* Brand statement */}
          <div>
            <div style={{ fontSize: 24, fontFamily: serif, fontWeight: 300, color: C.gold, letterSpacing: 3, marginBottom: 6 }}>
              Spy <span style={{ fontSize: 11, fontFamily: mono, letterSpacing: 2, color: C.textDim }}>by Atlas</span>
            </div>
            <p style={{ fontSize: 13, color: C.textSec, fontWeight: 300, lineHeight: 1.7, margin: "0 0 14px", maxWidth: 480 }}>
              Atlas carried the celestial sphere on his shoulders so others could see the heavens. We carry the threat surface so you can see what's coming. Private intelligence, designed and operated by intelligence professionals.
            </p>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
              Atlas Design Institute · Established 2026
            </div>
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: 8, flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
            <SocialLink href={X_URL}>X / Twitter</SocialLink>
            <SocialLink href={IG_URL}>Instagram</SocialLink>
            <SocialLink href={LI_URL}>LinkedIn</SocialLink>
          </div>
        </div>

        {/* Middle — link columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 30,
          marginBottom: 40,
          paddingBottom: 36,
          borderBottom: `1px solid ${C.border}`,
        }} className="footer-cols">
          <div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Platform</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FooterLink href="/signup">Open Account</FooterLink>
              <FooterLink href="/app">Sign In</FooterLink>
              <FooterLink href="/pricing">Subscription Tiers</FooterLink>
              <FooterLink href="/demo">Live Demo</FooterLink>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Intelligence</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FooterLink href="/intelligence">Daily Briefs</FooterLink>
              <FooterLink href="/intelligence/topics">Topics & Themes</FooterLink>
              <FooterLink href="/intelligence?cat=cyber">Cyber Intelligence</FooterLink>
              <FooterLink href="/intelligence?cat=geopolitics">Geopolitics</FooterLink>
              <FooterLink href="/api/feed.xml">RSS Feed</FooterLink>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Company</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FooterLink href="/about">About Atlas</FooterLink>
              <FooterLink href="/about-your-data">About Your Data</FooterLink>
              <FooterLink href="mailto:contact@atlasspy.com">Contact</FooterLink>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/eula">EULA</FooterLink>
              <FooterLink href="/refund">Refund Policy</FooterLink>
              <FooterLink href="/cookies">Cookies</FooterLink>
              <FooterLink href="/acceptable-use">Acceptable Use</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim }}>
            © {new Date().getFullYear()} Atlas Design Institute · All rights reserved
          </div>
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
            atlasspy.com · Bearing the world so you don't have to
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          :global(.footer-top) { grid-template-columns: auto 1fr !important; }
          :global(.footer-top > div:last-child) { grid-column: 1 / -1; flex-direction: row !important; align-items: center !important; }
          :global(.footer-cols) { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          :global(.footer-top) { grid-template-columns: 1fr !important; text-align: center; }
          :global(.footer-top > div:last-child) { justify-content: center !important; }
          :global(.footer-cols) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
