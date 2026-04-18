"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",bgCard:"#131316",border:"#1f1f25",goldDim:"rgba(196,162,101,0.10)"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

export default function PricingPage(){
  const tiers=[
    {id:"obs",n:"Observer",p:"Free",desc:"Platform preview",f:["Situation map access","Limited intelligence feed","Platform UI preview","No active intelligence"],cta:"Sign Up Free",href:"/signup"},
    {id:"pp",n:"Personal Pro",p:"$49",desc:"7-day free trial",r:true,f:["Unlimited OSINT searches","Daily intelligence briefs","War Room AI analyst","Social media monitoring","Data broker removal (Make Me Invisible)","Digital footprint analysis","Breach monitoring","Travel security briefings","Full reports archive","Identity verification","24/7 multilingual support"],cta:"Start Free Trial",href:"/signup"},
    {id:"bp",n:"Business Premium",p:"$149",desc:"+$15 per additional seat",f:["Everything in Personal Pro","Supply chain threat mapping","Dark web intelligence","Deception technology (honeytokens)","Corporate exposure alerts","Team seat management","Fraud detection","Case management","Evidence chain documentation","Geospatial intelligence","Predictive threat forecasting","CPIR insider threat module"],cta:"Start Free Trial",href:"/signup"},
    {id:"ex",n:"Executive",p:"Custom",desc:"White-glove service",f:["Everything in Business Premium","Dedicated analyst team","Active deepfake poisoning","Custom intelligence integrations","SLA guarantee","Priority response","Bespoke reporting","Direct analyst hotline"],cta:"Request Demo",href:"/signup"},
  ];
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}a{color:${C.gold};text-decoration:none}
@media(max-width:768px){.pg4{grid-template-columns:1fr 1fr!important}.pnav{padding:16px 20px!important}.psec{padding:0 20px!important}}`}</style>

    <nav className="pnav" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <div style={{display:"flex",gap:20,alignItems:"center"}}><Link href="/" style={{fontSize:12,color:C.textSec,fontWeight:300}}>Home</Link><Link href="/login" style={{fontSize:12,color:C.gold,fontWeight:300,padding:"8px 18px",border:`1px solid ${C.gold}`,borderRadius:3,letterSpacing:"1px",fontFamily:mono,fontSize:10,textTransform:"uppercase"}}>Sign In</Link></div>
    </nav>

    <div className="psec" style={{maxWidth:1100,margin:"40px auto 0",padding:"0 60px",textAlign:"center"}}>
      <div style={{fontSize:11,fontFamily:mono,letterSpacing:"4px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Pricing</div>
      <h1 style={{fontSize:42,fontFamily:serif,fontWeight:300,marginBottom:12}}>Intelligence as a Service</h1>
      <p style={{fontSize:15,color:C.textSec,fontWeight:200,maxWidth:540,margin:"0 auto 16px",lineHeight:1.6}}>Enterprise-grade intelligence capabilities at a fraction of the cost. Start with a 7-day free trial.</p>
      <div style={{display:"inline-block",background:C.goldDim,border:`1px solid ${C.gold}30`,borderRadius:20,padding:"6px 20px",fontSize:11,color:C.gold,fontFamily:mono,marginBottom:40}}>7-DAY FREE TRIAL — FULL ACCESS — CANCEL ANYTIME</div>
    </div>

    <div className="psec" style={{maxWidth:1100,margin:"0 auto",padding:"0 60px"}}>
      <div className="pg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {tiers.map((t,i)=><div key={t.id} style={{background:C.bgCard,border:`1px solid ${t.r?"rgba(196,162,101,0.3)":C.border}`,borderRadius:4,padding:28,position:"relative",animation:`fadeIn 0.4s ease ${i*.08}s both`}}>
          {t.r&&<div style={{position:"absolute",top:-1,left:20,padding:"3px 14px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 4px 4px"}}>Most Popular</div>}
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>{t.n}</div>
          <div style={{fontSize:36,fontFamily:serif,fontWeight:300,marginBottom:4}}>{t.p}<span style={{fontSize:13,color:C.textDim}}>{t.p!=="Free"&&t.p!=="Custom"?"/mo":""}</span></div>
          <div style={{fontSize:10,color:C.textDim,fontFamily:mono,marginBottom:20}}>{t.desc}</div>
          {t.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:C.textSec,fontWeight:200,marginBottom:6,lineHeight:1.4}}><span style={{color:C.gold,fontSize:9,marginTop:3,flexShrink:0}}>✦</span>{f}</div>)}
          <div style={{marginTop:20}}><Link href={t.href} style={{display:"block",padding:"14px 20px",border:`1px solid ${C.gold}`,borderRadius:3,background:"transparent",color:C.gold,fontSize:10,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",textAlign:"center"}}>{t.cta}</Link></div>
        </div>)}
      </div>
    </div>

    <div className="psec" style={{maxWidth:700,margin:"60px auto 0",padding:"0 60px",textAlign:"center"}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"24px 32px"}}>
        <div style={{fontSize:14,fontWeight:400,marginBottom:8}}>Business accounts: add team members for $15/seat/month</div>
        <div style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>The Master Account holder manages all seats. Each team member gets their own isolated dashboard with full module access. Billing is consolidated on the Master Account.</div>
      </div>
    </div>

    <div style={{textAlign:"center",padding:"60px 20px 30px"}}>
      <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap",marginBottom:16}}>
        <Link href="/terms" style={{fontSize:10,color:C.textDim,fontFamily:mono}}>Terms</Link>
        <Link href="/privacy" style={{fontSize:10,color:C.textDim,fontFamily:mono}}>Privacy</Link>
        <Link href="/refund" style={{fontSize:10,color:C.textDim,fontFamily:mono}}>Refunds</Link>
        <Link href="/cookies" style={{fontSize:10,color:C.textDim,fontFamily:mono}}>Cookies</Link>
        <Link href="/acceptable-use" style={{fontSize:10,color:C.textDim,fontFamily:mono}}>Acceptable Use</Link>
        <Link href="/disclaimer" style={{fontSize:10,color:C.textDim,fontFamily:mono}}>Disclaimer</Link>
      </div>
      <div style={{fontSize:9,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — 2026 Atlas Design Institute</div>
    </div>
  </div>;
}
