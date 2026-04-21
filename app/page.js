"use client";
import { useState } from "react";
import Link from "next/link";

const C={bg:"#09090b",bgCard:"#131316",border:"#1f1f25",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const FORMSPREE=process.env.NEXT_PUBLIC_FORMSPREE_ID||"mvzvdjrq";

function GB({children,href,small,outline}){const s={display:"inline-block",padding:small?"10px 20px":"15px 30px",border:`1px solid ${outline?C.border:C.gold}`,borderRadius:3,background:"transparent",color:outline?C.textSec:C.gold,fontSize:small?10:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",textDecoration:"none",transition:"all 0.3s",textAlign:"center"};return href?<Link href={href} style={s}>{children}</Link>:<span style={s}>{children}</span>;}

export default function LandingPage(){
  const[cf,setCf]=useState({name:"",email:"",message:""});const[cs,setCs]=useState(false);const[cl,setCl]=useState(false);
  const sendC=async()=>{if(!cf.email.trim()||!cf.message.trim())return;setCl(true);try{await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"[Spy] Contact",name:cf.name,email:cf.email,message:cf.message,timestamp:new Date().toISOString()})});setCs(true);}catch(e){}setCl(false);};
  const inp={width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:3,color:C.text,fontSize:14,fontFamily:sans,outline:"none",fontWeight:200,boxSizing:"border-box"};
  const features=[{t:"OSINT Search",d:"Analyst-grade intelligence across social platforms, breach databases, and the open web."},{t:"War Room",d:"A senior intelligence analyst on call at any hour. Brief them on a situation, receive a professional assessment in return."},{t:"Breach Console",d:"Cross-reference credentials against breach databases with formal impact assessments."},{t:"Social Monitoring",d:"Continuous security monitoring of your social media presence."},{t:"Threat Prediction",d:"Pattern-of-life analysis to preempt security risks before they materialize."},{t:"Executive Protection",d:"Canary tokens, data poisoning, digital decoys for high-value individuals."},{t:"Daily Briefs",d:"Personalized intelligence briefs calibrated to your exposure, sector, and threat environment."},{t:"Make Me Invisible",d:"One button. Fifteen data brokers. Your presence begins to recede the moment you click it."}];
  const tiers=[{id:"obs",n:"Observer",p:"Free",f:["Situation map","Intel feed (limited)","Platform preview"]},{id:"a",n:"Personal Pro",p:"$49",r:true,f:["7-day free trial","Unlimited OSINT","Daily briefs","War Room","Data broker removal","Social monitoring","Travel security","Reports archive"]},{id:"d",n:"Business Premium",p:"$149",desc:"+$15/seat",f:["Everything in Personal Pro","Supply chain intel","Dark web monitoring","Deception technology","Team seats ($15/ea)","Identity verification","Fraud detection","Case management"]},{id:"e",n:"Executive",p:"Custom",f:["Everything in Business","Dedicated analyst team","Deepfake poisoning","Custom integrations","SLA guarantee"]}];

  return <div style={{minHeight:"100vh",background:C.bg,overflow:"hidden"}}>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}
@media(max-width:768px){.lg4{grid-template-columns:repeat(2,1fr)!important}.lg2{grid-template-columns:1fr!important}.lnav{display:none!important}.lsec{padding:0 20px!important}.lnp{padding:16px 20px!important}.lh1{font-size:36px!important}.lst{gap:20px!important}.lstv{font-size:22px!important}}`}</style>
    <div style={{position:"absolute",inset:0,opacity:.01,backgroundImage:`radial-gradient(${C.gold} 1px, transparent 1px)`,backgroundSize:"40px 40px"}}/>
    <div style={{position:"absolute",top:"10%",left:"15%",width:500,height:500,background:"radial-gradient(circle,rgba(196,162,101,0.04) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(80px)"}}/>

    <nav className="lnp" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px",position:"relative",zIndex:1}}>
      <div style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></div>
      <div className="lnav" style={{display:"flex",gap:28,alignItems:"center"}}><a href="#features" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Features</a><a href="#pricing" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Pricing</a><a href="#contact" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Contact</a><Link href="/demo" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Demo</Link><GB small href="/login">Sign In</GB></div>
    </nav>

    <div className="lsec" style={{maxWidth:900,margin:"0 auto",padding:"70px 60px 50px",textAlign:"center",position:"relative",zIndex:1,animation:"fadeIn 1s ease"}}>
      <div style={{fontSize:11,fontFamily:mono,letterSpacing:"4px",color:C.gold,textTransform:"uppercase",marginBottom:20}}>Designed & Operated by Intelligence Experts</div>
      <h1 className="lh1" style={{fontSize:62,fontFamily:serif,fontWeight:300,lineHeight:1.1,letterSpacing:"-1px",marginBottom:20}}>Know everything.<br/>Before everyone.</h1>
      <p style={{fontSize:15,color:C.textSec,fontWeight:200,lineHeight:1.75,maxWidth:540,margin:"0 auto 36px"}}>A private intelligence platform built by intelligence professionals. Continuous awareness of your digital exposure, competitive landscape, and global threat environment.</p>
      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}><GB href="/signup">Get Started</GB><GB href="/demo" outline>View Demo</GB></div>
      <div style={{marginTop:28,fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase"}}>7-day free trial — full access — cancel anytime</div>
    </div>

    <div className="lst" style={{display:"flex",justifyContent:"center",gap:50,padding:"30px 20px",position:"relative",zIndex:1,flexWrap:"wrap"}}>
      {[["3.2B","Records monitored"],["24","Intel sources"],["46+","Active conflicts tracked"],["24/7","Analyst support"]].map(([v,l],i)=><div key={i} style={{textAlign:"center"}}><div className="lstv" style={{fontSize:34,fontFamily:serif,fontWeight:300,color:C.gold,marginBottom:2}}>{v}</div><div style={{fontSize:10,color:C.textDim,fontFamily:mono,letterSpacing:".8px"}}>{l}</div></div>)}
    </div>

    <div className="lsec" style={{maxWidth:820,margin:"30px auto",padding:"0 60px",textAlign:"center",position:"relative",zIndex:1}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"24px 30px"}}>
        <div style={{fontSize:11,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Every module reflects methodology used by professional intelligence teams. Analysts with backgrounds in national security, counterintelligence, and corporate investigation. Data sourced from <span style={{color:C.gold}}>CFR</span>, <span style={{color:C.gold}}>ACLED</span>, <span style={{color:C.gold}}>ICG</span>, <span style={{color:C.gold}}>ISW</span>, <span style={{color:C.gold}}>IISS</span>, and <span style={{color:C.gold}}>SIPRI</span>.</div>
      </div>
    </div>

    <div id="features" className="lsec" style={{maxWidth:1100,margin:"50px auto 0",padding:"0 60px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:40}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"3px",color:C.textDim,textTransform:"uppercase",marginBottom:10}}>Capabilities</div><h2 style={{fontSize:30,fontFamily:serif,fontWeight:300}}>Full-Spectrum Intelligence</h2></div>
      <div className="lg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>{features.map((f,i)=><div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:22,animation:`fadeIn 0.5s ease ${.3+i*.06}s both`}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>{f.t}</div><p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{f.d}</p></div>)}</div>
    </div>

    <div id="pricing" className="lsec" style={{maxWidth:1100,margin:"70px auto 0",padding:"0 60px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:40}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"3px",color:C.textDim,textTransform:"uppercase",marginBottom:10}}>Pricing</div><h2 style={{fontSize:30,fontFamily:serif,fontWeight:300}}>Intelligence as a Service</h2></div>
      <div className="lg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>{tiers.map((p,i)=><div key={p.id} style={{background:C.bgCard,border:`1px solid ${p.r?"rgba(196,162,101,0.25)":C.border}`,borderRadius:4,padding:22,position:"relative"}}>{p.r&&<div style={{position:"absolute",top:-1,left:16,padding:"2px 10px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 3px 3px"}}>Recommended</div>}<div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>{p.n}</div><div style={{fontSize:30,fontFamily:serif,fontWeight:300,marginBottom:16}}>{p.p}<span style={{fontSize:12,color:C.textDim}}>{p.p!=="Free"&&p.p!=="Custom"?"/mo":""}</span></div>{p.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSec,fontWeight:200,marginBottom:4}}><span style={{color:C.gold,fontSize:9}}>✦</span>{f}</div>)}<div style={{marginTop:14}}><GB small href="/signup">{p.p==="Custom"?"Contact":"Get Started"}</GB></div></div>)}</div>
    </div>

    <div id="contact" className="lsec" style={{maxWidth:800,margin:"70px auto 0",padding:"0 60px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:36}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"3px",color:C.textDim,textTransform:"uppercase",marginBottom:10}}>Contact</div><h2 style={{fontSize:30,fontFamily:serif,fontWeight:300}}>Speak With Our Intelligence Team</h2></div>
      <div className="lg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
        <div><p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:20}}>Questions about capabilities? Need a custom solution? Our intelligence professionals are ready.</p>
          {[["Response","Within 24 hours"],["Languages","EN, TR, DE, FR, ES, AR, RU, ZH"],["Channels","Encrypted communication available"],["Assessment","Free initial consultation"]].map(([k,v])=><div key={k} style={{display:"flex",gap:10,marginBottom:12}}><span style={{color:C.gold,fontSize:10}}>✦</span><div><div style={{fontSize:12,fontWeight:400}}>{k}</div><div style={{fontSize:11,color:C.textDim,fontWeight:200}}>{v}</div></div></div>)}</div>
        {cs?<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:28,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:18,fontFamily:serif,color:C.gold,marginBottom:8}}>Message Received</div><p style={{fontSize:12,color:C.textSec,fontWeight:200}}>Response within 24 hours.</p></div></div>
        :<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:24}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={inp} placeholder="Full name" value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})}/>
            <input style={inp} type="email" placeholder="Email *" value={cf.email} onChange={e=>setCf({...cf,email:e.target.value})}/>
            <textarea style={{...inp,minHeight:100,resize:"vertical"}} placeholder="How can we help? *" value={cf.message} onChange={e=>setCf({...cf,message:e.target.value})}/>
            <button onClick={sendC} disabled={cl} style={{padding:"13px 24px",border:`1px solid ${C.gold}`,borderRadius:3,background:"transparent",color:C.gold,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:cl?"default":"pointer",width:"100%",opacity:cl?.5:1}}>{cl?"Sending...":"Send Message"}</button>
          </div></div>}
      </div>
    </div>

    <div style={{textAlign:"center",padding:"70px 20px 36px",position:"relative",zIndex:1}}>
      <div style={{width:40,height:1,background:C.gold,margin:"0 auto 20px",opacity:.3}}/>
      <div style={{fontSize:9,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — DESIGNED BY INTELLIGENCE PROFESSIONALS</div>
      <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",marginBottom:14}}>
        <Link href="/pricing" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Pricing</Link>
        <Link href="/terms" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Terms</Link>
        <Link href="/privacy" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Privacy</Link>
        <Link href="/eula" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>EULA</Link>
        <Link href="/explicit-content" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Conduct</Link>
        <Link href="/refund" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Refunds</Link>
        <Link href="/cookies" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Cookies</Link>
        <Link href="/acceptable-use" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Acceptable Use</Link>
        <Link href="/disclaimer" style={{fontSize:10,color:C.textDim,fontFamily:mono,textDecoration:"none"}}>Disclaimer</Link>
      </div>
      <div style={{fontSize:9,fontFamily:mono,letterSpacing:"1px",color:C.textDim,marginTop:6}}>2026 Atlas Design Institute. All rights reserved.</div>
    </div>
  </div>;
}
