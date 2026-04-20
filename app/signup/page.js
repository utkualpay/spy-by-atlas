"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

const C = { bg:"#09090b", border:"#1f1f25", text:"#e4e0d9", textSec:"#9d9890", textDim:"#5c5854", gold:"#c4a265", goldDim:"rgba(196,162,101,0.10)", criticalDim:"rgba(196,92,92,0.10)", critical:"#c45c5c" };
const mono = "'IBM Plex Mono', monospace", serif = "'Cormorant Garamond', serif", sans = "'Raleway', sans-serif";

export default function SignupPage() {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); const [showP, setShowP] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeEula, setAgreeEula] = useState(false);
  const [agreeContent, setAgreeContent] = useState(false);
  const [over18, setOver18] = useState(false);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const go = async () => {
    if (!name.trim()) { setError("Full name is required."); return; }
    if (!email.trim() || !pass.trim()) { setError("Email and password are required."); return; }
    if (pass.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!over18) { setError("You must confirm you are 18 years or older."); return; }
    if (!agreeTerms) { setError("You must accept the Terms of Service and Privacy Policy."); return; }
    if (!agreeEula) { setError("You must accept the End User License Agreement."); return; }
    if (!agreeContent) { setError("You must acknowledge the Explicit Content & Conduct Statement."); return; }
    setLoading(true); setError("");
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(), password: pass,
      options: {
        data: {
          full_name: name.trim(),
          eula_accepted_at: new Date().toISOString(),
          explicit_content_accepted_at: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  };

  const inp = { width:"100%", padding:"14px 18px", background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:3, color:C.text, fontSize:14, fontFamily:sans, outline:"none", fontWeight:200, transition:"border-color 0.3s", boxSizing:"border-box" };
  const cb = (checked, onChange, label) => <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", fontSize:12, color:C.textSec, fontWeight:200, lineHeight:1.6, padding:"6px 0" }}>
    <span onClick={e=>{e.preventDefault();onChange(!checked);}} style={{ flexShrink:0, width:18, height:18, border:`1.5px solid ${checked?C.gold:C.border}`, borderRadius:3, background:checked?C.gold:"transparent", display:"flex", alignItems:"center", justifyContent:"center", marginTop:2, transition:"all 0.15s" }}>
      {checked && <span style={{ color:C.bg, fontSize:12, fontWeight:700, lineHeight:1 }}>✓</span>}
    </span>
    <span>{label}</span>
  </label>;

  return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, position:"relative", overflow:"hidden", padding:"40px 20px" }}>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{ position:"absolute", inset:0, opacity:.012, backgroundImage:`radial-gradient(${C.gold} 1px, transparent 1px)`, backgroundSize:"40px 40px" }} />
    <div style={{ width:"100%", maxWidth:440, padding:"40px 20px", position:"relative", animation:"fadeIn 0.8s ease" }}>
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:11, fontFamily:mono, letterSpacing:"6px", color:C.textDim, textTransform:"uppercase", marginBottom:16 }}>Atlas presents</div>
        <div style={{ fontSize:56, fontFamily:serif, fontWeight:300, letterSpacing:"6px", color:C.gold }}>Spy</div>
        <div style={{ width:40, height:1, background:C.gold, margin:"16px auto 0", opacity:.5 }} />
        <div style={{ fontSize:10, fontFamily:mono, letterSpacing:"2px", color:C.textDim, marginTop:12 }}>INTELLIGENCE AS A SERVICE</div>
      </div>

      {success ? (
        <div style={{ textAlign:"center", animation:"fadeIn 0.5s ease" }}>
          <div style={{ fontSize:18, fontFamily:serif, color:C.gold, marginBottom:12 }}>Account Created</div>
          <div style={{ fontSize:13, color:C.textSec, fontWeight:200, lineHeight:1.7, marginBottom:24 }}>
            Check your email for a confirmation link. Once confirmed, you can sign in and begin your 7-day trial.
          </div>
          <Link href="/login" style={{ padding:"14px 28px", border:`1px solid ${C.gold}`, borderRadius:3, color:C.gold, fontSize:11, fontFamily:mono, letterSpacing:"2px", textTransform:"uppercase", textDecoration:"none" }}>
            Go to Sign In
          </Link>
        </div>
      ) : (
        <>
          <div style={{ fontSize:14, fontWeight:200, color:C.textSec, textAlign:"center", marginBottom:28, lineHeight:1.6 }}>
            Begin monitoring. Begin knowing.
          </div>
          {error && <div style={{ background:C.criticalDim, border:"1px solid rgba(196,92,92,0.25)", borderRadius:3, padding:"10px 16px", marginBottom:16, fontSize:12, color:C.critical, fontWeight:300 }}>{error}</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <input style={inp} placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border} />
            <input style={inp} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border} />
            <div style={{ position:"relative" }}>
              <input style={inp} type={showP?"text":"password"} placeholder="Password (min 8 characters)" value={pass} onChange={e=>setPass(e.target.value)} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border} />
              <button onClick={()=>setShowP(!showP)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.textDim, fontSize:10, cursor:"pointer", fontFamily:mono }}>{showP?"HIDE":"SHOW"}</button>
            </div>

            <div style={{ marginTop:8, padding:"14px 16px", background:"rgba(196,162,101,0.04)", border:`1px solid ${C.border}`, borderRadius:4 }}>
              <div style={{ fontSize:10, fontFamily:mono, letterSpacing:"1.5px", color:C.gold, textTransform:"uppercase", marginBottom:10 }}>Required Agreements</div>
              {cb(over18, setOver18, <span>I confirm I am <strong style={{color:C.text}}>18 years or older</strong> and have legal capacity to enter agreements.</span>)}
              {cb(agreeTerms, setAgreeTerms, <span>I have read and accept the <Link href="/terms" target="_blank" style={{color:C.gold,textDecoration:"underline"}}>Terms of Service</Link> and <Link href="/privacy" target="_blank" style={{color:C.gold,textDecoration:"underline"}}>Privacy Policy</Link>.</span>)}
              {cb(agreeEula, setAgreeEula, <span>I have read and accept the <Link href="/eula" target="_blank" style={{color:C.gold,textDecoration:"underline"}}>End User License Agreement</Link>.</span>)}
              {cb(agreeContent, setAgreeContent, <span>I have read and acknowledge the <Link href="/explicit-content" target="_blank" style={{color:C.gold,textDecoration:"underline"}}>Explicit Content & Conduct Statement</Link>.</span>)}
            </div>

            <button onClick={go} disabled={loading} style={{ padding:"14px 28px", border:`1px solid ${C.gold}`, borderRadius:3, background:"transparent", color:C.gold, fontSize:11, fontFamily:mono, letterSpacing:"2px", textTransform:"uppercase", cursor:loading?"default":"pointer", width:"100%", opacity:loading?.5:1, marginTop:8 }}>
              {loading?"Creating Account...":"Create Account"}
            </button>
          </div>
          <div style={{ textAlign:"center", marginTop:24, fontSize:13, color:C.textDim, fontWeight:200 }}>
            Already a member? <Link href="/login" style={{ color:C.gold, textDecoration:"none" }}>Sign in</Link>
          </div>
        </>
      )}
      <div style={{ textAlign:"center", marginTop:16 }}>
        <Link href="/" style={{ fontSize:11, color:C.textDim, textDecoration:"none", fontFamily:mono, letterSpacing:"1px" }}>← Back to atlasspy.com</Link>
      </div>
    </div>
  </div>;
}
