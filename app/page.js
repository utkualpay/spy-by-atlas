"use client";
import { useState } from "react";
import Link from "next/link";

const C={bg:"#09090b",bgCard:"#131316",border:"#1f1f25",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)",low:"#6b9e7a"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const FORMSPREE=process.env.NEXT_PUBLIC_FORMSPREE_ID||"mvzvdjrq";

function GoldBtn({children,href,small,outline}){const s={display:"inline-block",padding:small?"10px 22px":"16px 32px",border:`1px solid ${outline?C.border:C.gold}`,borderRadius:3,background:"transparent",color:outline?C.textSec:C.gold,fontSize:small?10:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",textDecoration:"none",transition:"all 0.3s",textAlign:"center"};if(href)return <Link href={href} style={s}>{children}</Link>;return <span style={s}>{children}</span>;}

export default function LandingPage(){
  const[contactForm,setContactForm]=useState({name:"",email:"",message:""});
  const[contactSent,setContactSent]=useState(false);const[contactSending,setContactSending]=useState(false);
  const sendContact=async()=>{if(!contactForm.email.trim()||!contactForm.message.trim())return;setContactSending(true);
    try{await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"[Spy by Atlas] Contact Form",name:contactForm.name,email:contactForm.email,message:contactForm.message,timestamp:new Date().toISOString()})});setContactSent(true);}catch(e){}setContactSending(false);};

  const features=[
    {title:"OSINT Search",desc:"Analyst-grade intelligence gathering across social platforms, breach databases, and the open web."},
    {title:"Threat Prediction",desc:"Pattern-of-life analysis combined with global threat intelligence to preempt security risks."},
    {title:"Document Intelligence",desc:"Fuzzy-hash leak detection finds edited, translated, or obfuscated versions of proprietary files."},
    {title:"Data Suppression",desc:"Automated DMCA/GDPR takedowns. SEO burial networks for offshore content resistant to removal."},
    {title:"Decoy Deployment",desc:"LSB steganographic tracking payloads trace unauthorized file sharing with instant alerts."},
    {title:"Insider Threat Analysis",desc:"Psychological modeling, sentiment analysis, and radius-of-influence mapping for organizations."},
    {title:"War Room",desc:"Real-time situational monitoring with command controls and direct analyst access."},
    {title:"Executive Protection",desc:"Canary tokens, data poisoning, digital decoys, and continuous monitoring for high-value individuals."},
  ];

  const tiers=[
    {id:"obs",n:"Observer",p:"Free",f:["5 OSINT searches/month","Weekly digest","Breach alerts","Threat map"]},
    {id:"analyst",n:"Analyst",p:"$49",r:true,f:["Unlimited OSINT","Real-time monitoring","NLP feed","Sector filtering","Footprint analysis","Reports","War Room","Call center"]},
    {id:"director",n:"Director",p:"$149",f:["Everything in Analyst","Data poisoning","Document intelligence","Decoy deployment","Threat prediction","Assigned analyst","Legal consultancy"]},
    {id:"ent",n:"Enterprise",p:"Custom",f:["Everything in Director","Employee monitoring","CPIR module","Radius of influence","Dedicated team","SLA guarantee"]},
  ];

  const inp={width:"100%",padding:"14px 18px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:3,color:C.text,fontSize:14,fontFamily:sans,outline:"none",fontWeight:200,boxSizing:"border-box",maxWidth:"100%"};

  return <div style={{minHeight:"100vh",background:C.bg,position:"relative",overflow:"hidden"}}>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}
      @media(max-width:768px){.lp-grid-4{grid-template-columns:repeat(2,1fr)!important}.lp-nav-links{display:none!important}.lp-hero h1{font-size:36px!important}.lp-stats{gap:24px!important}.lp-stat-val{font-size:24px!important}.lp-hero-p{font-size:14px!important}.lp-section{padding:0 20px!important}.lp-nav{padding:16px 20px!important}.lp-contact-grid{grid-template-columns:1fr!important}}`}</style>

    <div style={{position:"absolute",inset:0,opacity:.01,backgroundImage:`radial-gradient(${C.gold} 1px, transparent 1px)`,backgroundSize:"40px 40px"}}/>
    <div style={{position:"absolute",top:"10%",left:"15%",width:500,height:500,background:`radial-gradient(circle,rgba(196,162,101,0.04) 0%,transparent 70%)`,borderRadius:"50%",filter:"blur(80px)"}}/>

    {/* Nav */}
    <nav className="lp-nav" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"28px 60px",position:"relative",zIndex:1}}>
      <div style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></div>
      <div className="lp-nav-links" style={{display:"flex",gap:32,alignItems:"center"}}>
        <a href="#features" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Features</a>
        <a href="#pricing" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Pricing</a>
        <a href="#contact" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Contact</a>
        <Link href="/demo" style={{fontSize:12,color:C.textSec,fontWeight:300,textDecoration:"none"}}>Demo</Link>
        <GoldBtn small href="/login">Sign In</GoldBtn>
      </div>
    </nav>

    {/* Hero */}
    <div className="lp-section" style={{maxWidth:900,margin:"0 auto",padding:"80px 60px 60px",textAlign:"center",position:"relative",zIndex:1,animation:"fadeIn 1s ease"}}>
      <div style={{fontSize:11,fontFamily:mono,letterSpacing:"4px",color:C.gold,textTransform:"uppercase",marginBottom:24}}>Designed & Operated by Intelligence Experts</div>
      <div className="lp-hero"><h1 style={{fontSize:64,fontFamily:serif,fontWeight:300,lineHeight:1.1,letterSpacing:"-1px",marginBottom:24}}>Know everything.<br/>Before everyone.</h1></div>
      <p className="lp-hero-p" style={{fontSize:16,color:C.textSec,fontWeight:200,lineHeight:1.7,maxWidth:560,margin:"0 auto 40px"}}>
        Spy by Atlas is a private intelligence platform built by intelligence professionals for individuals and organizations who require continuous awareness of their digital exposure, competitive landscape, and global threat environment.
      </p>
      <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}><GoldBtn href="/signup">Get Started</GoldBtn><GoldBtn href="/demo" outline>View Demo</GoldBtn></div>
    </div>

    {/* Stats */}
    <div className="lp-stats" style={{display:"flex",justifyContent:"center",gap:60,padding:"40px 20px",position:"relative",zIndex:1,flexWrap:"wrap"}}>
      {[["46+","Active conflicts"],["24","Intel sources"],["28","Zones monitored"],["24/7","Analyst support"]].map(([v,l],i)=>
        <div key={i} style={{textAlign:"center",animation:`fadeIn 0.6s ease ${.3+i*.1}s both`}}>
          <div className="lp-stat-val" style={{fontSize:36,fontFamily:serif,fontWeight:300,color:C.gold,marginBottom:4}}>{v}</div>
          <div style={{fontSize:11,color:C.textDim,fontFamily:mono,letterSpacing:".8px"}}>{l}</div>
        </div>)}
    </div>

    {/* Credibility bar */}
    <div className="lp-section" style={{maxWidth:800,margin:"40px auto",padding:"0 60px",textAlign:"center",position:"relative",zIndex:1}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"24px 32px"}}>
        <div style={{fontSize:11,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Every feature is built on methodologies used by professional intelligence teams. Our analysts hold backgrounds in national security, counterintelligence, and corporate investigation. Data sourced from <span style={{color:C.gold}}>CFR</span>, <span style={{color:C.gold}}>ACLED</span>, and <span style={{color:C.gold}}>International Crisis Group</span>.</div>
      </div>
    </div>

    {/* Features */}
    <div id="features" className="lp-section" style={{maxWidth:1100,margin:"60px auto 0",padding:"0 60px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"3px",color:C.textDim,textTransform:"uppercase",marginBottom:12}}>Capabilities</div>
        <h2 style={{fontSize:32,fontFamily:serif,fontWeight:300}}>Full-Spectrum Intelligence</h2>
      </div>
      <div className="lp-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {features.map((f,i)=><div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:24,animation:`fadeIn 0.5s ease ${.4+i*.08}s both`}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>{f.title}</div>
          <p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{f.desc}</p>
        </div>)}
      </div>
    </div>

    {/* Pricing */}
    <div id="pricing" className="lp-section" style={{maxWidth:1100,margin:"80px auto 0",padding:"0 60px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"3px",color:C.textDim,textTransform:"uppercase",marginBottom:12}}>Pricing</div>
        <h2 style={{fontSize:32,fontFamily:serif,fontWeight:300}}>Intelligence as a Service</h2>
      </div>
      <div className="lp-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {tiers.map((p,i)=><div key={p.id} style={{background:C.bgCard,border:`1px solid ${p.r?"rgba(196,162,101,0.25)":C.border}`,borderRadius:4,padding:24,position:"relative",animation:`fadeIn 0.4s ease ${i*.08}s both`}}>
          {p.r&&<div style={{position:"absolute",top:-1,left:20,padding:"3px 12px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 3px 3px"}}>Recommended</div>}
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:10}}>{p.n}</div>
          <div style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:20}}>{p.p}<span style={{fontSize:13,color:C.textDim}}>{p.p!=="Free"&&p.p!=="Custom"?"/mo":""}</span></div>
          {p.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:C.textSec,fontWeight:200,marginBottom:6}}><span style={{color:C.gold,fontSize:9}}>&#10022;</span>{f}</div>)}
          <div style={{marginTop:16}}><GoldBtn small href="/signup">{p.p==="Custom"?"Contact Us":"Get Started"}</GoldBtn></div>
        </div>)}
      </div>
    </div>

    {/* Contact Form (#9) */}
    <div id="contact" className="lp-section" style={{maxWidth:900,margin:"80px auto 0",padding:"0 60px",position:"relative",zIndex:1}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"3px",color:C.textDim,textTransform:"uppercase",marginBottom:12}}>Contact</div>
        <h2 style={{fontSize:32,fontFamily:serif,fontWeight:300}}>Speak With Our Intelligence Team</h2>
      </div>
      <div className="lp-contact-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
        <div>
          <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:24}}>Have questions about our capabilities? Need a custom intelligence solution? Our team of intelligence professionals is ready to discuss your specific requirements.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[["Response Time","Within 24 hours"],["Languages","EN, TR, DE, FR, ES, AR, RU, ZH"],["Secure Channels","Encrypted communication available"],["Consultations","Free initial assessment"]].map(([k,v])=><div key={k} style={{display:"flex",gap:12}}><span style={{color:C.gold,fontSize:10}}>&#10022;</span><div><div style={{fontSize:12,fontWeight:400,marginBottom:2}}>{k}</div><div style={{fontSize:11,color:C.textDim,fontWeight:200}}>{v}</div></div></div>)}
          </div>
        </div>
        {contactSent?<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:32,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div><div style={{fontSize:20,fontFamily:serif,color:C.gold,marginBottom:12}}>Message Received</div><p style={{fontSize:13,color:C.textSec,fontWeight:200}}>Our team will respond within 24 hours.</p></div>
        </div>
        :<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:28}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <input style={inp} placeholder="Full name" value={contactForm.name} onChange={e=>setContactForm({...contactForm,name:e.target.value})}/>
            <input style={inp} type="email" placeholder="Email *" value={contactForm.email} onChange={e=>setContactForm({...contactForm,email:e.target.value})}/>
            <textarea style={{...inp,minHeight:120,resize:"vertical"}} placeholder="How can our intelligence team help you? *" value={contactForm.message} onChange={e=>setContactForm({...contactForm,message:e.target.value})}/>
            <button onClick={sendContact} disabled={contactSending} style={{padding:"14px 28px",border:`1px solid ${C.gold}`,borderRadius:3,background:"transparent",color:C.gold,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:contactSending?"default":"pointer",width:"100%",opacity:contactSending?.5:1}}>{contactSending?"Sending...":"Send Message"}</button>
          </div>
        </div>}
      </div>
    </div>

    {/* Footer */}
    <div style={{textAlign:"center",padding:"80px 20px 40px",position:"relative",zIndex:1}}>
      <div style={{width:40,height:1,background:C.gold,margin:"0 auto 24px",opacity:.3}}/>
      <div style={{fontSize:9,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — atlasspy.com — DESIGNED BY INTELLIGENCE PROFESSIONALS</div>
      <div style={{fontSize:9,fontFamily:mono,letterSpacing:"1px",color:C.textDim,marginTop:8}}>2026 Atlas Design Institute. All rights reserved.</div>
    </div>
  </div>;
}
