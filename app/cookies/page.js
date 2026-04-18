"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const H=({children})=><h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>{children}</h2>;

export default function CookiePage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>Cookie Policy</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Last updated: April 2026</p>
      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <H>1. What Are Cookies</H>
        <p>Cookies are small text files stored on your device when you visit a website. They are used to make websites function properly, provide security features, and improve user experience.</p>
        <H>2. Cookies We Use</H>
        <p>We use only essential cookies required for the Service to function. We do NOT use advertising, marketing, or third-party tracking cookies.</p>
        <p><strong style={{color:C.text,fontWeight:400}}>Authentication cookies:</strong> Managed by Supabase to maintain your login session. These are strictly necessary and cannot be disabled while using the Service. They expire when you sign out or after the session timeout period.</p>
        <p><strong style={{color:C.text,fontWeight:400}}>Preference cookies:</strong> Store your interface preferences (e.g., sidebar state). These are stored locally and do not transmit data to our servers.</p>
        <H>3. Third-Party Cookies</H>
        <p>Our payment processor (Paddle) may set cookies during the checkout process. These are governed by Paddle's own cookie policy. We have no control over third-party cookies.</p>
        <H>4. Managing Cookies</H>
        <p>You can delete or block cookies through your browser settings. Note that disabling essential cookies will prevent you from using the Service. Most browsers allow you to: view cookies stored on your device, delete all or specific cookies, block cookies from specific or all websites, set preferences for first-party vs. third-party cookies.</p>
        <H>5. Contact</H>
        <p>Questions about our cookie usage: atlasalpaytr@gmail.com</p>
      </div>
    </div>
  </div>;
}
