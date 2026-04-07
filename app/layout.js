export const metadata = {
  title: "Spy by Atlas — Intelligence as a Service",
  description: "Private intelligence platform for individuals and organizations requiring continuous awareness of their digital exposure, competitive landscape, and global threat environment.",
  metadataBase: new URL("https://atlasspy.com"),
  openGraph: {
    title: "Spy by Atlas — Intelligence as a Service",
    description: "Know everything. Before everyone.",
    url: "https://atlasspy.com",
    siteName: "Spy by Atlas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spy by Atlas",
    description: "Intelligence as a Service",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Raleway:wght@200;300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#09090b", color: "#e4e0d9", fontFamily: "'Raleway', sans-serif", WebkitFontSmoothing: "antialiased" }}>
        {children}
      </body>
    </html>
  );
}
