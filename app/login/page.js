"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";

const C = {
  bg: "#09090b", border: "#1f1f25", text: "#e4e0d9", textSec: "#9d9890",
  textDim: "#5c5854", gold: "#c4a265", goldDim: "rgba(196,162,101,0.10)",
  criticalDim: "rgba(196,92,92,0.10)", critical: "#c45c5c",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";
const sans = "'Raleway', sans-serif";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [showP, setShowP] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const go = async () => {
    if (!email.trim() || !pass.trim()) { setError("Email and password are required."); return; }
    setLoading(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (authError) { setError(authError.message); setLoading(false); return; }
    router.push("/app");
    router.refresh();
  };

  const inp = {
    width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.03)",
    border: `1px solid ${C.border}`, borderRadius: 3, color: C.text, fontSize: 14,
    fontFamily: sans, outline: "none", fontWeight: 200, transition: "border-color 0.3s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ position: "absolute", inset: 0, opacity: .012, backgroundImage: `radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div style={{ width: "100%", maxWidth: 400, padding: 40, position: "relative", animation: "fadeIn 0.8s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontFamily: mono, letterSpacing: "6px", color: C.textDim, textTransform: "uppercase", marginBottom: 16 }}>Atlas presents</div>
          <div style={{ fontSize: 56, fontFamily: serif, fontWeight: 300, letterSpacing: "6px", color: C.gold }}>Spy</div>
          <div style={{ width: 40, height: 1, background: C.gold, margin: "16px auto 0", opacity: .5 }} />
          <div style={{ fontSize: 10, fontFamily: mono, letterSpacing: "2px", color: C.textDim, marginTop: 12 }}>INTELLIGENCE AS A SERVICE</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 200, color: C.textSec, textAlign: "center", marginBottom: 36, lineHeight: 1.6 }}>
          Welcome back. Your intelligence awaits.
        </div>
        {error && <div style={{ background: C.criticalDim, border: "1px solid rgba(196,92,92,0.25)", borderRadius: 3, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: C.critical, fontWeight: 300 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ position: "relative" }}>
            <input style={inp} type={showP ? "text" : "password"} placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
            <button onClick={() => setShowP(!showP)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textDim, fontSize: 10, cursor: "pointer", fontFamily: mono }}>{showP ? "HIDE" : "SHOW"}</button>
          </div>
          <button onClick={go} disabled={loading} style={{ padding: "14px 28px", border: `1px solid ${C.gold}`, borderRadius: 3, background: "transparent", color: C.gold, fontSize: 11, fontFamily: mono, letterSpacing: "2px", textTransform: "uppercase", cursor: loading ? "default" : "pointer", width: "100%", opacity: loading ? .5 : 1 }}>
            {loading ? "Authenticating..." : "Enter"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: C.textDim, fontWeight: 200 }}>
          No account?{" "}
          <Link href="/signup" style={{ color: C.gold, textDecoration: "none" }}>Apply</Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link href="/" style={{ fontSize: 11, color: C.textDim, textDecoration: "none", fontFamily: mono, letterSpacing: "1px" }}>← Back to atlasspy.com</Link>
        </div>
      </div>
    </div>
  );
}
