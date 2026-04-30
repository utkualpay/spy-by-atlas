// app/admin/layout.js
//
// Gates the entire /admin subtree. If the visitor isn't an admin, they get
// a 404 (intentionally, to avoid exposing the existence of admin tools).
// Layout adds a discrete admin sidebar + header.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUserAndAdmin } from "@/lib/admin-auth";

const C = {
  bg: "#09090b", bgCard: "#131316", bgSidebar: "#0c0c0f",
  border: "#1f1f25", text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  critical: "#c45c5c",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

export const metadata = {
  title: "Admin · Atlas Intelligence",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/system", label: "System" },
];

export default async function AdminLayout({ children }) {
  const { isAdmin, user } = await getCurrentUserAndAdmin();
  if (!isAdmin) return notFound();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: C.bgSidebar, borderRight: `1px solid ${C.border}`,
        padding: 24, display: "flex", flexDirection: "column", gap: 6,
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ marginBottom: 30 }}>
          <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 6, textDecoration: "none" }}>
            <span style={{ fontSize: 22, fontFamily: serif, fontWeight: 300, color: C.gold, letterSpacing: 3 }}>Spy</span>
            <span style={{ fontSize: 8, color: C.textDim, fontFamily: mono, letterSpacing: 2 }}>by Atlas</span>
          </Link>
          <div style={{
            marginTop: 12, fontSize: 9, fontFamily: mono, letterSpacing: 2.5,
            color: C.critical, textTransform: "uppercase", padding: "3px 10px",
            border: `1px solid ${C.critical}40`, borderRadius: 2, display: "inline-block",
          }}>
            Admin · Restricted
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                padding: "10px 14px",
                borderRadius: 3,
                color: C.textSec,
                fontSize: 12, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontFamily: mono, color: C.textDim, marginBottom: 4 }}>SIGNED IN</div>
          <div style={{ fontSize: 11, color: C.textSec, wordBreak: "break-all" }}>{user.email}</div>
          <Link href="/app" style={{ marginTop: 14, display: "inline-block", fontSize: 10, fontFamily: mono, color: C.gold, textDecoration: "none", letterSpacing: 1.5, textTransform: "uppercase" }}>
            ← Exit to platform
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
