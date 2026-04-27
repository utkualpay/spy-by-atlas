export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://atlasspy.com"),
  title: {
    default: "Atlas Intelligence — Daily Briefs & Private Intelligence Platform",
    template: "%s | Atlas Intelligence",
  },
  description: "Daily intelligence briefs and a private platform. Cyber, geopolitical, and risk analysis for executives, principals, and the people they protect.",
  keywords: [
    "intelligence platform", "private intelligence", "OSINT", "open source intelligence",
    "threat intelligence", "cybersecurity intelligence", "digital footprint", "breach monitoring",
    "executive protection", "dark web monitoring", "atlas intelligence", "spy platform",
    "corporate intelligence", "business intelligence security", "insider threat", "CPIR",
    "geospatial intelligence", "GEOINT", "HUMINT", "SIGINT", "counterintelligence",
    "threat prediction", "deception technology", "honeytokens", "data suppression",
    "privacy protection", "identity verification", "fraud detection", "supply chain intelligence",
    "travel security", "intelligence as a service", "IaaS", "atlas", "atlasspy",
    "social media monitoring", "reputation management", "digital security platform",
    "intelligence brief", "geopolitical analysis", "cyber threat brief",
  ],
  authors: [{ name: "Atlas Design Institute" }],
  creator: "Atlas Design Institute",
  publisher: "Atlas Design Institute",
  category: "Security & Intelligence",
  classification: "Intelligence Platform",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atlasspy.com",
    siteName: "Atlas Intelligence",
    title: "Atlas Intelligence — Daily Briefs & Private Platform",
    description: "Know everything. Before everyone. Daily briefs and a private intelligence platform for principals.",
    images: [{ url: "/favicon.svg", width: 512, height: 512, alt: "Atlas Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Intelligence — Daily Briefs",
    description: "Know everything. Before everyone.",
    images: ["/favicon.svg"],
  },
  robots: {
    index: true, follow: true, nocache: false,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: "https://atlasspy.com",
    types: {
      "application/rss+xml": [{ url: "/api/feed.xml", title: "Atlas Intelligence — Daily Briefs" }],
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Atlas Intelligence",
  alternateName: ["Atlas Design Institute", "Spy by Atlas", "Atlas Spy"],
  url: "https://atlasspy.com",
  logo: "https://atlasspy.com/favicon.svg",
  description: "Private intelligence-as-a-service. Daily briefs, OSINT, threat monitoring, breach detection, executive protection.",
  sameAs: [
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
  ].filter(Boolean),
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#09090b", color: "#e4e0d9", fontFamily: "'Raleway', sans-serif", WebkitFontSmoothing: "antialiased" }}>
        {children}
      </body>
    </html>
  );
}
