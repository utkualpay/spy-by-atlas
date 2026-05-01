// app/layout.js — REVISION 3
//
// SEO improvements for item 6 — making "Atlas", "Atlas Intelligence",
// "Atlas Spy", "Spy by Atlas" findable on Google.
//
// Key changes:
//   • Title leads with "Atlas Intelligence" — Google matches the first
//     50-60 characters most strongly. Brand goes first.
//   • Description explicitly mentions all the search variants.
//   • Comprehensive Organization JSON-LD with alternateName covering every
//     way someone might search for us.
//   • Manifest linked (PWA-ready, also a search ranking signal).
//   • OpenGraph image points to a generated branded card.
//   • Twitter card with all variants in the metadata.

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Atlas Intelligence | Spy by Atlas — Private Intelligence Platform & Daily Briefs",
    template: "%s | Atlas Intelligence",
  },
  description: "Atlas Intelligence is a private intelligence platform — also known as Spy by Atlas. Daily intelligence briefs, OSINT search, breach monitoring, executive protection, and dark web watch. Designed and operated by intelligence professionals.",
  applicationName: "Atlas Intelligence",
  keywords: [
    // Brand + variants — get these to rank
    "Atlas Intelligence", "Atlas", "Atlas Spy", "Spy by Atlas", "atlasspy",
    "Atlas Design Institute", "Atlas IaaS",
    // Core product terms
    "intelligence platform", "private intelligence", "intelligence as a service",
    "OSINT platform", "OSINT search", "open source intelligence",
    "threat intelligence", "cybersecurity intelligence", "geopolitical intelligence",
    "executive protection", "digital footprint", "breach monitoring",
    "dark web monitoring", "supply chain intelligence", "deception technology",
    "honeytokens", "canary tokens", "decoy deployment", "steganography",
    "insider threat", "CPIR", "fraud detection", "identity verification",
    "geospatial intelligence", "GEOINT", "HUMINT", "SIGINT", "counterintelligence",
    "predictive threat forecasting", "data suppression", "make me invisible",
    "privacy protection", "reputation management", "digital security",
    "intelligence brief", "daily intelligence brief", "geopolitical analysis",
    "cyber threat brief", "travel security", "war room AI analyst",
  ],
  authors: [{ name: "Atlas Design Institute", url: SITE }],
  creator: "Atlas Design Institute",
  publisher: "Atlas Design Institute",
  category: "Security & Intelligence",
  classification: "Intelligence Platform",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    siteName: "Atlas Intelligence",
    title: "Atlas Intelligence — Spy by Atlas | Private Intelligence Platform",
    description: "Daily intelligence briefs and a private platform. OSINT, breach monitoring, executive protection. Bearing the world so you don't have to.",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: "Atlas Intelligence" },
      { url: "/favicon.svg", width: 512, height: 512, alt: "Atlas mark" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Intelligence — Daily Briefs",
    description: "Private intelligence platform. Daily briefs. OSINT, breach monitoring, executive protection.",
    images: ["/og-default.png"],
    site: "@atlasintel",
    creator: "@atlasintel",
  },
  robots: {
    index: true, follow: true, nocache: false,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: SITE,
    types: {
      "application/rss+xml": [{ url: "/api/feed.xml", title: "Atlas Intelligence — Daily Briefs" }],
    },
  },
  verification: {
    // Add Google Search Console verification token when registered.
    // google: "your-verification-token",
  },
};

// JSON-LD Organization schema — boosts brand SERP appearance with name, logo,
// alternate names, and sameAs social profiles.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Atlas Intelligence",
  alternateName: ["Atlas", "Atlas Spy", "Spy by Atlas", "Atlas Design Institute", "atlasspy"],
  url: SITE,
  logo: `${SITE}/favicon.svg`,
  description: "Private intelligence-as-a-service platform. Daily briefs and 23 intelligence modules — OSINT, breach monitoring, executive protection, dark web watch.",
  foundingDate: "2026",
  sameAs: [
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
  ].filter(Boolean),
  knowsAbout: [
    "Open-source intelligence",
    "Threat intelligence",
    "Cybersecurity",
    "Geopolitical intelligence",
    "Executive protection",
    "Breach monitoring",
    "Dark web monitoring",
    "Supply chain risk",
    "Deception technology",
    "Insider threat detection",
  ],
};

// Website schema with SearchAction — enables sitelinks search box on Google.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Atlas Intelligence",
  alternateName: ["Spy by Atlas", "atlasspy"],
  url: SITE,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/intelligence?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Raleway:wght@200;300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="alternate" type="application/rss+xml" title="Atlas Intelligence — Daily Briefs" href="/api/feed.xml" />
        <meta name="theme-color" content="#09090b" />
        <meta name="format-detection" content="telephone=no" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#09090b", color: "#e4e0d9", fontFamily: "'Raleway', sans-serif", WebkitFontSmoothing: "antialiased" }}>
        {children}
      </body>
    </html>
  );
}
