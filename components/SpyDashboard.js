"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// ── THEME ────────────────────────────────────────────────────────────
const C={bg:"#09090b",bgCard:"#131316",bgHover:"#1a1a1f",bgSidebar:"#0c0c0f",bgInput:"#18181c",border:"#1f1f25",borderHover:"#2a2a32",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)",goldMid:"rgba(196,162,101,0.20)",critical:"#c45c5c",criticalDim:"rgba(196,92,92,0.10)",high:"#c49a5c",highDim:"rgba(196,154,92,0.10)",medium:"#7c8db5",mediumDim:"rgba(124,141,181,0.10)",low:"#6b9e7a",lowDim:"rgba(107,158,122,0.10)",info:"#8b8db5",infoDim:"rgba(139,141,181,0.10)"};
const css=`
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes scanline{0%{left:-100%}100%{left:100%}}
@keyframes splashFade{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
@keyframes splashText{0%{opacity:0;letter-spacing:12px}30%{opacity:1;letter-spacing:8px}80%{opacity:1;letter-spacing:8px}100%{opacity:0;letter-spacing:4px}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}::selection{background:${C.goldDim};color:${C.gold}}
*{box-sizing:border-box}
input,textarea,select{box-sizing:border-box;max-width:100%}
@media(max-width:768px){
  .spy-grid-4{grid-template-columns:repeat(2,1fr)!important}
  .spy-grid-3{grid-template-columns:1fr!important}
  .spy-grid-2{grid-template-columns:1fr!important}
  .spy-main-pad{padding:16px 14px!important}
  .spy-header-pad{padding:0 14px!important}
  .spy-footer-wrap{flex-direction:column;gap:4px;align-items:flex-start!important}
  .spy-sidebar{display:none!important}
  .spy-sidebar-open{display:flex!important;position:fixed;top:0;left:0;bottom:0;z-index:100;width:260px!important}
  .spy-mobile-toggle{display:flex!important}
}`;
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const FORMSPREE=process.env.NEXT_PUBLIC_FORMSPREE_ID||"mvzvdjrq";

// ── API HELPERS ──────────────────────────────────────────────────────
async function apiOsint(q,t){const r=await fetch("/api/osint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,type:t})});return r.ok?r.json():null;}
async function apiIntel(){const r=await fetch("/api/intel");return r.ok?r.json():[];}
async function apiBreaches(e){const r=await fetch("/api/breaches",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})});return r.ok?r.json():{breaches:[]};}
async function apiFootprint(q,t){const r=await fetch("/api/footprint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,type:t})});return r.ok?r.json():null;}
async function apiExecprot(t){const r=await fetch("/api/execprot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target:t})});return r.ok?r.json():null;}

// ── DATA ─────────────────────────────────────────────────────────────
const SECTORS=["All Sectors","Cybersecurity","Finance & Banking","Energy & Infrastructure","Healthcare","Defense & Government","Technology","Legal","Maritime & Logistics","Telecommunications"];
const CONFLICTS=[
  {id:1,name:"Ukraine — Russia",lat:48.5,lng:35,type:"war",sev:"critical",desc:"Full-scale conventional war.",cas:"500,000+",start:"Feb 2022",src:"CFR, ACLED"},
  {id:2,name:"Sudan Civil War",lat:15.5,lng:32.5,type:"war",sev:"critical",desc:"SAF vs RSF. 150,000+ killed, 10M+ displaced.",cas:"150,000+",start:"Apr 2023",src:"Crisis Group"},
  {id:3,name:"Gaza — Israel",lat:31.4,lng:34.4,type:"war",sev:"critical",desc:"Active military operations. Severe humanitarian crisis.",cas:"45,000+",start:"Oct 2023",src:"CFR"},
  {id:4,name:"Myanmar Civil War",lat:19.7,lng:96.2,type:"war",sev:"critical",desc:"Resistance forces vs junta.",cas:"15,000+/yr",start:"Feb 2021",src:"ACLED"},
  {id:5,name:"Venezuela — US",lat:10.5,lng:-66.9,type:"war",sev:"critical",desc:"US Operation 'Absolute Resolve'.",cas:"Unknown",start:"Jan 2026",src:"CFR"},
  {id:6,name:"DR Congo — M23",lat:-1.5,lng:29,type:"war",sev:"high",desc:"M23 rebel advance in North Kivu.",cas:"10,000+",start:"2022",src:"Crisis Group"},
  {id:7,name:"Yemen — Houthi",lat:15.4,lng:44.2,type:"war",sev:"high",desc:"Red Sea shipping attacks.",cas:"Thousands",start:"2014",src:"CFR"},
  {id:8,name:"Sahel Insurgency",lat:14,lng:1,type:"insurgency",sev:"high",desc:"Jihadist insurgencies.",cas:"Thousands",start:"2012",src:"Crisis Group"},
  {id:9,name:"Syria — Post-Assad",lat:35,lng:38,type:"war",sev:"high",desc:"Post-Assad transition.",cas:"Unknown",start:"2011",src:"CFR"},
  {id:10,name:"Somalia — Al-Shabaab",lat:2,lng:45,type:"insurgency",sev:"high",desc:"60% of south controlled.",cas:"Thousands",start:"2006",src:"CFR"},
  {id:11,name:"Haiti Collapse",lat:18.9,lng:-72.3,type:"instability",sev:"high",desc:"Gang control.",cas:"Thousands",start:"2021",src:"CFR"},
  {id:12,name:"India — Pakistan",lat:34,lng:74,type:"tension",sev:"high",desc:"Kashmir tensions. Nuclear states.",cas:"Hundreds",start:"Ongoing",src:"CFR"},
  {id:13,name:"Iran — US / Israel",lat:32.4,lng:53.7,type:"tension",sev:"critical",desc:"Direct conflict 2025.",cas:"Unknown",start:"2025",src:"CFR"},
  {id:14,name:"Taiwan Strait",lat:24,lng:120,type:"tension",sev:"medium",desc:"PLA provocations.",cas:"N/A",start:"Ongoing",src:"CFR"},
  {id:15,name:"Lebanon — Israel",lat:33.3,lng:35.5,type:"tension",sev:"high",desc:"Hezbollah, Israeli strikes.",cas:"2,000+",start:"Oct 2023",src:"CFR"},
  {id:16,name:"Nigeria",lat:9.1,lng:7.5,type:"insurgency",sev:"high",desc:"Boko Haram, banditry.",cas:"Thousands",start:"2009",src:"ACLED"},
  {id:17,name:"Russia — NATO",lat:56,lng:26,type:"tension",sev:"high",desc:"Hybrid warfare.",cas:"N/A",start:"2022",src:"CFR"},
  {id:18,name:"Mexico Cartels",lat:23.6,lng:-102.5,type:"instability",sev:"high",desc:"Narco-trafficking.",cas:"30,000+/yr",start:"2006",src:"CFR"},
  {id:19,name:"South Sudan",lat:6.8,lng:31.6,type:"war",sev:"high",desc:"Government vs opposition.",cas:"Thousands",start:"2013",src:"Crisis Group"},
  {id:20,name:"Burkina Faso",lat:12.4,lng:-1.5,type:"war",sev:"high",desc:"JNIM and ISGS.",cas:"Thousands",start:"2015",src:"ACLED"},
];

const CPIR_QUESTIONS=[
  {q:"A project deadline is approaching and the team can't agree. What do you do?",opts:[{t:"Call a meeting, then decide yourself",s:2,d:"dominance"},{t:"Let the team vote",s:1,d:"dominance"},{t:"Defer to the most experienced",s:0,d:"dominance"},{t:"Present your approach with strong reasoning",s:3,d:"dominance"}]},
  {q:"You notice a colleague making recurring errors in reports. Nobody else caught it.",opts:[{t:"Report through proper channels",s:0,d:"integrity"},{t:"Speak privately and offer help",s:1,d:"integrity"},{t:"Keep watching, mention if it grows",s:2,d:"integrity"},{t:"Document for your own records",s:3,d:"integrity"}]},
  {q:"Your contribution was greater than acknowledged on a team project.",opts:[{t:"Let it go — team success matters",s:0,d:"resentment"},{t:"Mention it casually to your manager",s:1,d:"resentment"},{t:"Make sure colleagues know going forward",s:2,d:"resentment"},{t:"Feel frustrated, say nothing",s:3,d:"resentment"}]},
  {q:"You have temporary system access that wasn't revoked after your task.",opts:[{t:"Notify IT immediately",s:0,d:"access_seeking"},{t:"Note to mention next time",s:1,d:"access_seeking"},{t:"Leave it — might be useful later",s:2,d:"access_seeking"},{t:"Explore what's available",s:3,d:"access_seeking"}]},
  {q:"Your manager gives feedback you strongly disagree with.",opts:[{t:"Share perspective respectfully",s:0,d:"authority_response"},{t:"Accept outwardly, reflect later",s:1,d:"authority_response"},{t:"Push back firmly",s:2,d:"authority_response"},{t:"Nod along, disregard",s:3,d:"authority_response"}]},
  {q:"A colleague found a workaround to bypass a security feature.",opts:[{t:"Report to IT security",s:0,d:"security_awareness"},{t:"Tell them it's a risk",s:1,d:"security_awareness"},{t:"Ask them to show you",s:2,d:"security_awareness"},{t:"Use it yourself",s:3,d:"security_awareness"}]},
  {q:"Company announces email and web monitoring for security.",opts:[{t:"Reasonable, nothing to hide",s:0,d:"surveillance_tolerance"},{t:"Understand, be more careful",s:1,d:"surveillance_tolerance"},{t:"Overreaction, treats us as suspects",s:2,d:"surveillance_tolerance"},{t:"Use personal devices instead",s:3,d:"surveillance_tolerance"}]},
  {q:"Where do you see your career in 3-5 years?",opts:[{t:"Senior role here",s:0,d:"loyalty_trajectory"},{t:"Deep expertise, valuable anywhere",s:1,d:"loyalty_trajectory"},{t:"Exploring broadly, other companies",s:2,d:"loyalty_trajectory"},{t:"Not sure, all options open",s:3,d:"loyalty_trajectory"}]},
];

const REMEDIATION={general:"Full password audit. Enable 2FA. Set up credit monitoring. Review app permissions.",credential_leak:"Change password immediately. Enable 2FA. Use a password manager.",data_broker:"Submit opt-out requests. GDPR deletion in EU. Re-check quarterly."};

// ── UTILITY COMPONENTS ───────────────────────────────────────────────
function Badge({severity:s,label:l}){const m={critical:[C.critical,C.criticalDim],high:[C.high,C.highDim],medium:[C.medium,C.mediumDim],low:[C.low,C.lowDim],info:[C.info,C.infoDim]};const[f,b]=m[s]||[C.textSec,C.bgInput];
return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:3,fontSize:10,fontWeight:500,fontFamily:mono,textTransform:"uppercase",letterSpacing:".8px",color:f,background:b}}>{s==="critical"&&<span style={{width:4,height:4,borderRadius:"50%",background:f,animation:"pulse 2s infinite"}}/>}{l||s}</span>;}
function Metric({label:l,value:v,sub:s,severity:sv,delay:d=0}){return <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"20px 22px",animation:`fadeIn 0.5s ease ${d}s both`}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:10,color:C.textDim,fontFamily:mono,textTransform:"uppercase",letterSpacing:"1.2px"}}>{l}</span>{sv&&<Badge severity={sv}/>}</div>
<div style={{fontSize:28,fontWeight:200,fontFamily:serif,lineHeight:1,letterSpacing:"-0.5px"}}>{v}</div>{s&&<div style={{fontSize:10,color:C.textDim,marginTop:8,fontFamily:mono}}>{s}</div>}</div>;}
function SH({title:t,subtitle:s}){return <div style={{marginBottom:24}}><h2 style={{fontSize:24,fontWeight:300,fontFamily:serif,letterSpacing:"-0.3px"}}>{t}</h2>{s&&<p style={{color:C.textDim,fontSize:13,marginTop:6,fontWeight:200,lineHeight:1.5}}>{s}</p>}<div style={{width:32,height:1,background:C.gold,marginTop:14,opacity:.4}}/></div>;}
function Card({children,highlight,style,onClick}){const[h,setH]=useState(false);return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick} style={{background:C.bgCard,border:`1px solid ${highlight?"rgba(196,162,101,0.25)":h?C.borderHover:C.border}`,borderRadius:4,transition:"border-color 0.2s",cursor:onClick?"pointer":"default",...style}}>{children}</div>;}
function GoldBtn({children,onClick,full,small,disabled}){const[h,setH]=useState(false);return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:small?"8px 18px":"14px 28px",border:`1px solid ${disabled?C.border:C.gold}`,borderRadius:3,background:h&&!disabled?C.goldDim:"transparent",color:disabled?C.textDim:C.gold,fontSize:small?10:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:disabled?"default":"pointer",transition:"all 0.3s",width:full?"100%":"auto",opacity:disabled?.5:1}}>{children}</button>;}
function InputField({placeholder,value,onChange,mono:im,area,onKeyDown,label}){
const s={width:"100%",padding:area?"14px 16px":"12px 16px",background:C.bgInput,border:`1px solid ${C.border}`,borderRadius:3,color:C.text,fontSize:13,fontFamily:im?mono:sans,outline:"none",fontWeight:300,transition:"border-color 0.3s",resize:area?"vertical":"none",boxSizing:"border-box",maxWidth:"100%"};
return <div style={{width:"100%"}}>{label&&<div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>{label}</div>}
{area?<textarea style={{...s,minHeight:100}} placeholder={placeholder} value={value} onChange={onChange} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
:<input style={s} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>}</div>;}
function TabBar({tabs,active,onChange}){return <div style={{display:"flex",gap:1,marginBottom:24,background:C.bgCard,borderRadius:3,padding:3,border:`1px solid ${C.border}`,width:"fit-content",flexWrap:"wrap"}}>{tabs.map(([k,l])=><button key={k} onClick={()=>onChange(k)} style={{padding:"8px 16px",border:"none",borderRadius:2,fontSize:11,fontWeight:400,cursor:"pointer",fontFamily:sans,transition:"all 0.2s",background:active===k?C.gold:"transparent",color:active===k?C.bg:C.textSec,letterSpacing:".3px"}}>{l}</button>)}</div>;}
function RemediationBox({text}){const[open,setOpen]=useState(false);return <div style={{marginTop:10}}><button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer",fontFamily:mono,letterSpacing:"1px"}}>{open?"HIDE":"SHOW"} REMEDIATION</button>{open&&<div style={{marginTop:8,padding:"12px 16px",background:C.bgInput,borderRadius:3,border:`1px solid ${C.border}`,fontSize:12,color:C.textSec,lineHeight:1.7,fontWeight:200}}>{text}</div>}</div>;}
function SpyLogo({size="normal"}){const sz=size==="small"?{fs:18,sub:7}:size==="large"?{fs:56,sub:9}:{fs:22,sub:7};
return <div style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:sz.fs,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px",lineHeight:1}}>Spy</span>{size!=="small"&&<span style={{fontSize:sz.sub,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span>}</div>;}
function Loader({text}){return <Card style={{padding:40,textAlign:"center"}}><div style={{fontSize:12,color:C.gold,fontFamily:mono,letterSpacing:"2px",marginBottom:16,textTransform:"uppercase"}}>{text||"Processing..."}</div><div style={{width:200,height:2,background:C.border,margin:"0 auto",borderRadius:1,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",width:"40%",height:"100%",background:C.gold,animation:"scanline 1.5s ease infinite"}}/></div></Card>;}

// ── SPLASH SCREEN ────────────────────────────────────────────────────
function SplashScreen({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);
  return <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,animation:"splashFade 2.8s ease forwards"}}>
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:72,fontFamily:serif,fontWeight:200,color:C.gold,letterSpacing:"8px",animation:"splashText 2.8s ease forwards",opacity:0,textShadow:`0 0 60px rgba(196,162,101,0.15), 0 0 120px rgba(196,162,101,0.05)`}}>Spy</div>
      <div style={{fontSize:9,fontFamily:mono,letterSpacing:"3px",color:"rgba(196,162,101,0.3)",marginTop:8,animation:"splashFade 2.8s ease forwards",textTransform:"uppercase"}}>by Atlas</div>
    </div>
  </div>;
}

// ── WORLD MAP ────────────────────────────────────────────────────────
function WorldMap({zones,sel,onSelect}){
  const tx=l=>((l+180)/360)*800,ty=l=>((90-l)/180)*450;
  const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
  const cont=["M33,45 L55,55 L89,75 L116,100 L130,130 L155,158 L187,180 L218,200 L229,185 L222,150 L240,125 L256,108 L273,95 L260,78 L240,70 L200,68 L155,73 L110,70 L78,58 L60,48 Z","M218,200 L245,218 L295,228 L322,245 L316,263 L300,293 L262,328 L240,358 L235,348 L242,305 L242,260 L231,230 Z","M380,130 L392,112 L408,100 L396,78 L420,62 L450,52 L466,68 L462,85 L455,105 L465,118 L462,125 L442,133 L424,118 L406,115 L388,128 Z","M372,148 L400,136 L440,138 L465,148 L478,170 L498,196 L505,204 L488,225 L476,260 L458,285 L436,305 L448,310 L462,310 L448,318 L420,312 L395,296 L378,268 L372,232 L368,208 L368,175 Z","M465,118 L500,105 L545,88 L600,62 L660,48 L718,58 L748,68 L740,85 L710,105 L690,130 L665,148 L640,165 L618,185 L596,178 L576,165 L560,185 L545,195 L530,175 L510,158 L490,140 L472,122 Z","M642,238 L680,228 L718,242 L728,262 L720,280 L690,292 L656,278 L644,258 Z"];
  return <svg viewBox="0 0 800 450" style={{width:"100%",background:C.bgCard,borderRadius:4}}>
    <rect width="800" height="450" fill="rgba(196,162,101,0.02)"/>
    {Array.from({length:17},(_,i)=><line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2={450} stroke={C.border} strokeWidth={.3} opacity={.4}/>)}
    {Array.from({length:10},(_,i)=><line key={`h${i}`} x1={0} y1={i*50} x2={800} y2={i*50} stroke={C.border} strokeWidth={.3} opacity={.4}/>)}
    {cont.map((d,i)=><path key={i} d={d} fill="rgba(196,162,101,0.04)" stroke="rgba(196,162,101,0.12)" strokeWidth={.5}/>)}
    {zones.map(z=>{const cx=tx(z.lng),cy=ty(z.lat),c=tc[z.type]||C.medium,s=sel?.id===z.id;
      return <g key={z.id} onClick={()=>onSelect(z)} style={{cursor:"pointer"}}><circle cx={cx} cy={cy} r={s?20:14} fill={c} opacity={.06}><animate attributeName="r" values={`${s?20:14};${s?30:22};${s?20:14}`} dur="3s" repeatCount="indefinite"/></circle><circle cx={cx} cy={cy} r={s?4:2.5} fill={c} opacity={.9}/>{s&&<circle cx={cx} cy={cy} r={7} fill="none" stroke={c} strokeWidth={.8} opacity={.5}/>}</g>;})}
  </svg>;
}

// ── PAGE: OSINT ──────────────────────────────────────────────────────
function PgOsint({isDemo}){
  const[q,setQ]=useState("");const[t,setT]=useState("email");const[scanning,setScanning]=useState(false);const[results,setResults]=useState(null);const[error,setError]=useState("");
  const doSearch=async()=>{if(!q.trim())return;if(isDemo){setError("OSINT search requires an active subscription.");return;}setScanning(true);setResults(null);setError("");
    try{const data=await apiOsint(q,t);if(!data||data.error){setError(data?.error||"Search failed.");setScanning(false);return;}setResults({query:q,type:t,...data});}catch(e){setError("Connection error.");}setScanning(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="OSINT Search" subtitle="Analyst-grade intelligence gathering across public databases, social platforms, and breach repositories. Powered by our intelligence team's methodology."/>
    <TabBar tabs={[["email","Email"],["username","Username"],["domain","Domain"],["phone","Phone"],["ip","IP"],["company","Company"]]} active={t} onChange={k=>{setT(k);setResults(null)}}/>
    <div style={{display:"flex",gap:12,marginBottom:32,flexWrap:"wrap"}}><div style={{flex:1,minWidth:200}}><InputField mono placeholder={{email:"Enter email address",username:"Enter username",domain:"Enter domain",phone:"Enter phone",ip:"Enter IP address",company:"Enter company name"}[t]} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}/></div><GoldBtn onClick={doSearch} disabled={scanning}>{scanning?"Scanning...":"Search"}</GoldBtn></div>
    {scanning&&<Loader text="Conducting live intelligence search"/>}
    {error&&<Card style={{padding:20}}><div style={{color:C.critical,fontSize:13}}>{error}</div></Card>}
    {results&&<div style={{animation:"fadeIn 0.4s ease"}}><Card style={{padding:24,marginBottom:12}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase"}}>Intelligence Report</div><div style={{fontSize:12,color:C.textDim,fontFamily:mono,marginTop:6}}>Query: {results.query} ({results.type}) — {new Date(results.timestamp).toLocaleString()}</div></Card>
      <Card style={{padding:24}}><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{results.analysis}</div></Card>
      <Card style={{padding:16,marginTop:12}}><div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:6}}>GENERAL REMEDIATION</div><div style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{REMEDIATION.general}</div></Card></div>}
    {!scanning&&!results&&!error&&<Card style={{padding:48,textAlign:"center"}}><div style={{fontSize:28,fontFamily:serif,fontWeight:300,marginBottom:10,color:C.textSec}}>Ready</div><div style={{fontSize:13,color:C.textDim,fontWeight:200,maxWidth:420,margin:"0 auto",lineHeight:1.6}}>Enter a query to initiate a live intelligence search. Results are generated by our analysts' methodology in real time.</div></Card>}
  </div>;
}

// ── PAGE: INTEL FEED (#4 fixed — timeout + retry) ────────────────────
function PgIntel(){
  const[sector,setSector]=useState("All Sectors");const[news,setNews]=useState([]);const[loading,setLoading]=useState(false);const[loaded,setLoaded]=useState(false);const[error,setError]=useState("");
  const fetchNews=async()=>{setLoading(true);setError("");
    try{const data=await apiIntel();if(Array.isArray(data)&&data.length>0){setNews(data);}else{setError("No results. Try refreshing.");}}catch(e){setError("Connection failed. Please retry.");}
    setLoading(false);setLoaded(true);};
  useEffect(()=>{if(!loaded)fetchNews();},[]);
  const[filter,setFilter]=useState("all");
  const cats=["all","vulnerability","threat-actor","ransomware","nation-state","policy","data-breach","geopolitical"];
  const filtered=news.filter(n=>(sector==="All Sectors"||n.sector===sector)&&(filter==="all"||n.category===filter));
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Intelligence Feed" subtitle="Live intelligence curated by our analyst team from verified sources. Click headlines for full articles."/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:12}}>
      <div><div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>Sector Focus</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{SECTORS.map(s=><button key={s} onClick={()=>setSector(s)} style={{padding:"6px 14px",border:`1px solid ${sector===s?C.gold:C.border}`,borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:sans,background:sector===s?C.goldDim:"transparent",color:sector===s?C.gold:C.textDim,fontWeight:300}}>{s}</button>)}</div></div>
      <GoldBtn small onClick={fetchNews} disabled={loading}>{loading?"Fetching...":"Refresh Feed"}</GoldBtn>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>{cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 14px",border:`1px solid ${filter===c?C.gold:C.border}`,borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:sans,background:filter===c?C.goldDim:"transparent",color:filter===c?C.gold:C.textDim,textTransform:"capitalize",fontWeight:300}}>{c==="all"?"All":c.replace("-"," ")}</button>)}</div>
    {loading&&<Loader text="Fetching live intelligence — this may take up to 30 seconds"/>}
    {error&&!loading&&<Card style={{padding:24,textAlign:"center"}}><div style={{fontSize:13,color:C.high,marginBottom:12}}>{error}</div><GoldBtn small onClick={fetchNews}>Retry</GoldBtn></Card>}
    {!loading&&filtered.map((n,i)=><Card key={i} onClick={()=>n.url&&n.url!=="#"&&window.open(n.url,"_blank")} style={{padding:20,marginBottom:6,cursor:n.url&&n.url!=="#"?"pointer":"default",animation:`fadeIn 0.3s ease ${i*.03}s both`}}>
      <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}><Badge severity={n.severity||"info"}/><span style={{fontSize:10,fontFamily:mono,letterSpacing:"1px",color:C.textDim,textTransform:"uppercase"}}>{(n.category||"").replace("-"," ")}</span>{n.sector&&<span style={{fontSize:10,fontFamily:mono,color:C.gold,opacity:.6}}>— {n.sector}</span>}</div>
      <div style={{fontSize:14,fontWeight:500,marginBottom:5,lineHeight:1.4}}>{n.title}</div>
      <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.55}}>{n.summary}</div>
      <div style={{display:"flex",gap:10,marginTop:10,fontSize:10,color:C.textDim,fontFamily:mono,flexWrap:"wrap"}}><span>{n.source}</span><span>—</span><span>{n.time}</span></div>
    </Card>)}
  </div>;
}

// ── PAGE: BREACHES ───────────────────────────────────────────────────
function PgBreaches({user,isDemo}){
  const[email,setEmail]=useState(user?.email||"");const[breaches,setBreaches]=useState([]);const[scanning,setScanning]=useState(false);const[scanned,setScanned]=useState(false);
  const scan=async()=>{if(!email.trim()||isDemo)return;setScanning(true);setBreaches([]);const data=await apiBreaches(email);setBreaches(data?.breaches||[]);setScanning(false);setScanned(true);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Breach Monitor" subtitle="Search breach databases and paste sites for credential exposure."/>
    <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}><div style={{flex:1,minWidth:200}}><InputField mono placeholder="Enter email address" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}/></div><GoldBtn onClick={scan} disabled={scanning}>{scanning?"Scanning...":"Check Breaches"}</GoldBtn></div>
    {scanning&&<Loader text="Searching breach databases"/>}
    {scanned&&!scanning&&<><div className="spy-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
      <Metric label="Total Found" value={breaches.length} severity={breaches.length>3?"critical":"medium"} delay={.05}/><Metric label="Action Required" value={breaches.filter(b=>b.status==="action_required").length} severity="high" delay={.1}/><Metric label="Resolved" value={breaches.filter(b=>b.status==="resolved").length} delay={.15}/><Metric label="Monitoring" value={breaches.filter(b=>b.status==="monitoring").length} delay={.2}/></div>
      {breaches.map((b,i)=><Card key={i} highlight={b.status==="action_required"} style={{padding:20,marginBottom:6}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}><div style={{display:"flex",gap:14,alignItems:"center"}}><span style={{fontSize:15,fontWeight:500}}>{b.source}</span><Badge severity={b.severity||"medium"}/></div><span style={{fontSize:10,fontFamily:mono,textTransform:"uppercase",color:b.status==="action_required"?C.critical:b.status==="resolved"?C.low:C.high}}>{(b.status||"unknown").replace("_"," ")}</span></div>
        <div style={{display:"flex",gap:20,fontSize:12,color:C.textSec,fontWeight:200,flexWrap:"wrap"}}><span>Exposed: <span style={{color:C.text}}>{b.type||"Unknown"}</span></span>{b.records&&<span>Records: <span style={{fontFamily:mono}}>{b.records}</span></span>}<span>Date: <span style={{fontFamily:mono}}>{b.date||"Unknown"}</span></span></div>
        <RemediationBox text={b.remediation||REMEDIATION.credential_leak}/></Card>)}</>}
  </div>;
}

// ── PAGE: DECOY ──────────────────────────────────────────────────────
function PgDecoy(){
  const canvasRef=useRef(null);const[file,setFile]=useState(null);const[preview,setPreview]=useState(null);const[payload,setPayload]=useState("");const[encoded,setEncoded]=useState(null);const[status,setStatus]=useState("");const[extractedMsg,setExtractedMsg]=useState("");
  const handleFile=e=>{const f=e.target.files?.[0];if(!f)return;setFile(f);setEncoded(null);setStatus("");setExtractedMsg("");const r=new FileReader();r.onload=ev=>setPreview(ev.target.result);r.readAsDataURL(f);};
  const embedPayload=()=>{if(!preview||!payload.trim())return;const img=new Image();img.onload=()=>{const cv=canvasRef.current;cv.width=img.width;cv.height=img.height;const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);const idata=ctx.getImageData(0,0,cv.width,cv.height);const d=idata.data;const msg=payload+"\0";const bits=[];for(let i=0;i<32;i++)bits.push((msg.length>>i)&1);for(let i=0;i<msg.length;i++)for(let b=0;b<8;b++)bits.push((msg.charCodeAt(i)>>b)&1);for(let i=0;i<bits.length&&i*4<d.length;i++){d[i*4]=(d[i*4]&0xFE)|bits[i];}ctx.putImageData(idata,0,0);setEncoded(cv.toDataURL("image/png"));setStatus(`Embedded ${payload.length} chars into ${img.width}x${img.height} image.`);};img.src=preview;};
  const extractPayload=()=>{if(!encoded)return;const img=new Image();img.onload=()=>{const cv=document.createElement("canvas");cv.width=img.width;cv.height=img.height;const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,cv.width,cv.height).data;let len=0;for(let i=0;i<32;i++)len|=(d[i*4]&1)<<i;if(len<=0||len>10000){setExtractedMsg("No valid payload.");return;}let msg="";for(let i=0;i<len-1;i++){let ch=0;for(let b=0;b<8;b++)ch|=(d[(32+i*8+b)*4]&1)<<b;msg+=String.fromCharCode(ch);}setExtractedMsg(msg);};img.src=encoded;};
  const downloadEncoded=async()=>{if(!encoded)return;try{const blob=await(await fetch(encoded)).blob();const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="spy-watermarked-"+Date.now()+".png";document.body.appendChild(a);a.click();document.body.removeChild(a);}catch(e){}};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Decoy Deployment" subtitle="LSB steganographic tracking. Embed invisible payloads into images — developed by our intelligence engineering team."/>
    <div className="spy-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>1. Upload Image</div>
        <label style={{display:"block",padding:28,border:`1px dashed ${C.border}`,borderRadius:4,textAlign:"center",cursor:"pointer"}}><input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/><div style={{fontSize:13,color:C.textSec,fontWeight:200}}>{file?file.name:"Click to select"}</div></label>
        {preview&&<img src={preview} style={{width:"100%",maxHeight:180,objectFit:"contain",marginTop:12,borderRadius:4,border:`1px solid ${C.border}`}}/>}
        <div style={{marginTop:16}}><InputField mono placeholder="e.g. DOC-2026-CONFIDENTIAL-ACME" value={payload} onChange={e=>setPayload(e.target.value)} label="Tracking Payload"/></div>
        <div style={{marginTop:16}}><GoldBtn full onClick={embedPayload} disabled={!preview||!payload.trim()}>Embed Payload</GoldBtn></div></Card>
      <Card style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>2. Result</div>
        <canvas ref={canvasRef} style={{display:"none"}}/>
        {encoded?<><img src={encoded} style={{width:"100%",maxHeight:180,objectFit:"contain",borderRadius:4,border:`1px solid ${C.gold}`,marginBottom:12}}/><div style={{fontSize:12,color:C.low,fontFamily:mono,marginBottom:8}}>Payload embedded</div><div style={{fontSize:11,color:C.textDim,fontWeight:200,marginBottom:12}}>{status}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><GoldBtn onClick={downloadEncoded}>Download</GoldBtn><GoldBtn small onClick={extractPayload}>Verify</GoldBtn></div>
          {extractedMsg&&<div style={{marginTop:12,padding:"10px 14px",background:C.bgInput,borderRadius:3,border:`1px solid ${C.border}`}}><div style={{fontSize:10,fontFamily:mono,color:C.gold,marginBottom:4}}>EXTRACTED:</div><div style={{fontSize:12,fontFamily:mono,color:C.text,wordBreak:"break-all"}}>{extractedMsg}</div></div>}
        </>:<div style={{padding:40,textAlign:"center",border:`1px dashed ${C.border}`,borderRadius:4}}><div style={{fontSize:14,color:C.textSec,fontWeight:200}}>Watermarked image appears here</div></div>}</Card>
    </div></div>;
}

// ── PAGE: CPIR (hooks fix maintained) ────────────────────────────────
function PgCPIR(){
  const[mode,setMode]=useState("select");const[started,setStarted]=useState(false);const[qi,setQi]=useState(0);const[answers,setAnswers]=useState({});const[done,setDone]=useState(false);
  const[empName,setEmpName]=useState("");const[empDept,setEmpDept]=useState("");const[assessCode,setAssessCode]=useState("");
  const[mgrPin,setMgrPin]=useState("");const[mgrAuth,setMgrAuth]=useState(false);const[allResults,setAllResults]=useState([]);
  const[shuffledOpts,setShuffledOpts]=useState({});const[cpirResult,setCpirResult]=useState(null);
  const newCodeRef=useRef("CPIR-"+Math.random().toString(36).substring(2,8).toUpperCase());
  const startAssessment=()=>{const shuffled={};CPIR_QUESTIONS.forEach((cq,i)=>{const idx=[...Array(cq.opts.length).keys()];for(let j=idx.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[idx[j],idx[k]]=[idx[k],idx[j]];}shuffled[i]=idx;});setShuffledOpts(shuffled);setStarted(true);setQi(0);setAnswers({});setDone(false);setCpirResult(null);};
  const answer=(origIdx)=>{const na={...answers,[qi]:origIdx};setAnswers(na);if(qi<CPIR_QUESTIONS.length-1)setTimeout(()=>setQi(qi+1),300);else setDone(true);};
  const saveResult=useCallback(async()=>{const dims={};CPIR_QUESTIONS.forEach((cq,i)=>{const a=answers[i];if(a!==undefined){const opt=cq.opts[a];dims[opt.d]=(dims[opt.d]||0)+opt.s;}});const maxS=CPIR_QUESTIONS.length*3;const total=Object.values(dims).reduce((s,v)=>s+v,0);const risk=total/maxS;return{name:empName||"Anonymous",dept:empDept||"Unspecified",code:assessCode,dims,risk,riskLabel:risk<.25?"Low":risk<.45?"Moderate":risk<.65?"Elevated":"High",date:new Date().toISOString(),answers};},[answers,empName,empDept,assessCode]);
  useEffect(()=>{if(done&&!cpirResult){saveResult().then(r=>setCpirResult(r));}},[done,cpirResult,saveResult]);
  const loadMgr=async()=>{try{const r=await fetch("/api/cpir");if(r.ok){setAllResults(await r.json());}}catch(e){setAllResults([]);}setMgrAuth(true);};

  if(done){if(!cpirResult)return <Loader text="Processing"/>;const rc=cpirResult.risk<.25?C.low:cpirResult.risk<.45?C.medium:cpirResult.risk<.65?C.high:C.critical;
    return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Assessment Complete"/><Card style={{padding:32,marginBottom:24}}><div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,flexWrap:"wrap"}}><div style={{position:"relative",width:80,height:80}}><svg viewBox="0 0 100 100" style={{transform:"rotate(-90deg)"}}><circle cx={50} cy={50} r={42} fill="none" stroke={C.border} strokeWidth={4}/><circle cx={50} cy={50} r={42} fill="none" stroke={rc} strokeWidth={4} strokeDasharray={`${2*Math.PI*42*cpirResult.risk} ${2*Math.PI*42}`} strokeLinecap="round"/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontFamily:serif,color:rc}}>{Math.round(cpirResult.risk*100)}</div></div><div><div style={{fontSize:18,fontFamily:serif}}>Risk: <span style={{color:rc}}>{cpirResult.riskLabel}</span></div><div style={{fontSize:12,color:C.textDim,fontWeight:200,marginTop:4}}>Based on {CPIR_QUESTIONS.length} indicators</div></div></div>
      <div className="spy-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{Object.entries(cpirResult.dims).map(([k,v])=><div key={k} style={{background:C.bgInput,borderRadius:3,padding:"10px 14px",fontSize:11}}><div style={{color:C.textDim,fontFamily:mono,fontSize:9,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>{k.replace(/_/g," ")}</div><div style={{width:"100%",height:3,background:C.border,borderRadius:1}}><div style={{width:`${(v/3)*100}%`,height:"100%",background:v>2?C.critical:v>1?C.high:C.low,borderRadius:1}}/></div></div>)}</div></Card><GoldBtn onClick={()=>{setMode("select");setStarted(false);setDone(false);setCpirResult(null);}}>Return</GoldBtn></div>;}

  if(mode==="select")return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="CPIR Module" subtitle="Continuous Psychological Indicator Report — developed by our intelligence psychology team."/>
    <div className="spy-grid-3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>{[["employee","Employee Assessment","Workplace Engagement Survey","Begin"],["distribute","Distribute","Send via Email","Send"],["manager","Manager Panel","Assessment Analytics","Access"]].map(([m,title,desc,btn])=><Card key={m} style={{padding:28}} onClick={()=>setMode(m)}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>{title}</div><p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>{desc}</p><div style={{marginTop:16}}><GoldBtn small onClick={e=>{e.stopPropagation();setMode(m);}}>{btn}</GoldBtn></div></Card>)}</div></div>;

  if(mode==="manager"){if(!mgrAuth)return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Manager Panel"/><Card style={{padding:32,maxWidth:400}}><InputField mono placeholder="Manager PIN (4+ digits)" value={mgrPin} onChange={e=>setMgrPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgrPin.length>=4&&loadMgr()}/><div style={{marginTop:16}}><GoldBtn full onClick={loadMgr} disabled={mgrPin.length<4}>Access</GoldBtn></div><div style={{marginTop:12}}><GoldBtn full small onClick={()=>setMode("select")}>Back</GoldBtn></div></Card></div>;
    const avg=allResults.length?allResults.reduce((s,r)=>s+(r.risk_score||r.risk||0),0)/allResults.length:0;
    return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Manager Panel" subtitle={`${allResults.length} assessment(s)`}/><div style={{display:"flex",gap:8,marginBottom:24}}><GoldBtn small onClick={()=>setMode("select")}>Back</GoldBtn><GoldBtn small onClick={loadMgr}>Refresh</GoldBtn></div>
      <div className="spy-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}><Metric label="Total" value={allResults.length}/><Metric label="Avg Risk" value={Math.round(avg*100)}/><Metric label="Code" value={newCodeRef.current}/><Metric label="Status" value="Active" severity="low"/></div>
      {allResults.length>0&&<Card style={{padding:20}}>{allResults.map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}><div><div style={{fontSize:13,fontWeight:500}}>{r.employee_name||r.name}</div><div style={{fontSize:11,color:C.textDim}}>{r.department||r.dept}</div></div><Badge severity={(r.risk_score||r.risk||0)<.45?"low":"high"} label={r.risk_label||r.riskLabel||"?"}/></div>)}</Card>}</div>;}

  if(!started)return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Workplace Engagement Survey"/><Card style={{padding:32,maxWidth:600}}><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}><InputField placeholder="Your name (optional)" value={empName} onChange={e=>setEmpName(e.target.value)}/><InputField placeholder="Department (optional)" value={empDept} onChange={e=>setEmpDept(e.target.value)}/><InputField mono placeholder="Assessment code (if provided)" value={assessCode} onChange={e=>setAssessCode(e.target.value)}/></div><div style={{display:"flex",gap:8}}><GoldBtn onClick={startAssessment}>Begin</GoldBtn><GoldBtn small onClick={()=>setMode("select")}>Back</GoldBtn></div></Card></div>;

  const cq=CPIR_QUESTIONS[qi];const order=shuffledOpts[qi]||[0,1,2,3];
  return <div style={{animation:"fadeIn 0.3s ease"}}><SH title="Survey" subtitle={`Question ${qi+1} of ${CPIR_QUESTIONS.length}`}/><div style={{width:"100%",height:2,background:C.border,borderRadius:1,marginBottom:28}}><div style={{width:`${((qi+1)/CPIR_QUESTIONS.length)*100}%`,height:"100%",background:C.gold,borderRadius:1,transition:"width 0.3s"}}/></div>
    <Card style={{padding:28,maxWidth:600}}><div style={{fontSize:16,fontFamily:serif,fontWeight:400,marginBottom:24,lineHeight:1.5}}>{cq.q}</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{order.map((oi,di)=><button key={di} onClick={()=>answer(oi)} style={{padding:"14px 18px",background:answers[qi]===oi?C.goldDim:C.bgInput,border:`1px solid ${answers[qi]===oi?C.gold:C.border}`,borderRadius:4,color:answers[qi]===oi?C.gold:C.text,fontSize:13,fontWeight:200,cursor:"pointer",textAlign:"left",fontFamily:sans}}>{cq.opts[oi].t}</button>)}</div></Card></div>;
}

// ── PAGE: FOOTPRINT, RESEARCH, EXEC PROT ─────────────────────────────
function PgFootprint({isDemo}){const[q,setQ]=useState("");const[t,setT]=useState("email");const[scanning,setScanning]=useState(false);const[results,setResults]=useState(null);
  const scan=async()=>{if(!q.trim()||isDemo)return;setScanning(true);setResults(null);const data=await apiFootprint(q,t);if(data)setResults({query:q,type:t,...data});setScanning(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Digital Footprint" subtitle="Complete exposure analysis by our intelligence team."/>
    <TabBar tabs={[["email","Email"],["name","Name"],["username","Username"],["phone","Phone"]]} active={t} onChange={setT}/>
    <div style={{display:"flex",gap:12,marginBottom:32,flexWrap:"wrap"}}><div style={{flex:1,minWidth:200}}><InputField mono placeholder={{email:"Enter email",name:"Enter full name",username:"Enter username",phone:"Enter phone"}[t]} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}/></div><GoldBtn onClick={scan} disabled={scanning}>{scanning?"Scanning...":"Run Scan"}</GoldBtn></div>
    {scanning&&<Loader text="Scanning digital footprint"/>}
    {results&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{results.analysis}</div></Card>}</div>;}

function PgResearch(){const[form,setForm]=useState({name:"",email:"",type:"osint",subject:"",description:"",urgency:"standard"});const[sending,setSending]=useState(false);const[sent,setSent]=useState(false);const[error,setError]=useState("");
  const submit=async()=>{if(!form.email||!form.subject||!form.description){setError("Fill required fields.");return;}setSending(true);setError("");try{const r=await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,_subject:`[Spy] ${form.type.toUpperCase()} — ${form.subject}`,timestamp:new Date().toISOString()})});if(r.ok)setSent(true);else setError("Failed.");}catch(e){setError("Network error.");}setSending(false);};
  if(sent)return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Research Requests"/><Card style={{padding:32,textAlign:"center"}}><div style={{fontSize:24,fontFamily:serif,color:C.gold,marginBottom:12}}>Submitted</div><p style={{fontSize:13,color:C.textSec,fontWeight:200,marginBottom:20}}>Your request has been assigned to our analyst team. Response within 24-48 hours.</p><GoldBtn onClick={()=>{setSent(false);setForm({name:"",email:"",type:"osint",subject:"",description:"",urgency:"standard"});}}>New Request</GoldBtn></Card></div>;
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Research Requests" subtitle="Commission intelligence research from our analyst team."/>
    <Card style={{padding:28,maxWidth:600}}>{error&&<div style={{background:C.criticalDim,borderRadius:3,padding:"10px 16px",marginBottom:12,fontSize:12,color:C.critical}}>{error}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}><InputField label="Name" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><InputField label="Email *" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><InputField label="Subject *" placeholder="Brief title" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/><InputField label="Description *" placeholder="Describe in detail" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} area/><GoldBtn full onClick={submit} disabled={sending}>{sending?"Submitting...":"Submit Request"}</GoldBtn></div></Card></div>;}

function PgExecProt({isDemo}){const[tab,setTab]=useState("canary");const[canaryName,setCanaryName]=useState("");const[canaryRecipients,setCanaryRecipients]=useState("");const[canaryResults,setCanaryResults]=useState([]);const[monitorTarget,setMonitorTarget]=useState("");const[monitorResults,setMonitorResults]=useState(null);const[monitorLoading,setMonitorLoading]=useState(false);
  const genCanaries=()=>{if(!canaryName.trim()||!canaryRecipients.trim())return;setCanaryResults(canaryRecipients.split("\n").filter(r=>r.trim()).map((r,i)=>({recipient:r.trim(),token:`CTK-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}-${i}`.toUpperCase(),generated:new Date().toISOString()})));};
  const runExp=async()=>{if(!monitorTarget.trim()||isDemo)return;setMonitorLoading(true);const data=await apiExecprot(monitorTarget);if(data)setMonitorResults({target:monitorTarget,...data});setMonitorLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Executive Protection" subtitle="Developed by intelligence protection specialists."/>
    <TabBar tabs={[["canary","Canary Tokens"],["monitor","Exposure Monitor"]]} active={tab} onChange={setTab}/>
    {tab==="canary"&&<Card style={{padding:24}}><div style={{display:"flex",flexDirection:"column",gap:12}}><InputField label="Document Name" placeholder="e.g. Q1 Strategy Report" value={canaryName} onChange={e=>setCanaryName(e.target.value)}/><InputField label="Recipients (one per line)" placeholder={"John Smith — Board\nJane Doe — CFO"} value={canaryRecipients} onChange={e=>setCanaryRecipients(e.target.value)} area/><GoldBtn onClick={genCanaries} disabled={!canaryName.trim()||!canaryRecipients.trim()}>Generate Tokens</GoldBtn></div>
      {canaryResults.length>0&&<div style={{marginTop:20}}>{canaryResults.map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:8}}><span style={{fontSize:13}}>{t.recipient}</span><span style={{fontFamily:mono,fontSize:11,color:C.gold,padding:"4px 12px",background:C.goldDim,borderRadius:3}}>{t.token}</span></div>)}</div>}</Card>}
    {tab==="monitor"&&<div><div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}><div style={{flex:1,minWidth:200}}><InputField placeholder="Full name" value={monitorTarget} onChange={e=>setMonitorTarget(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runExp()}/></div><GoldBtn onClick={runExp} disabled={monitorLoading}>{monitorLoading?"Scanning...":"Assess"}</GoldBtn></div>
      {monitorLoading&&<Loader text="Conducting exposure assessment"/>}
      {monitorResults&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{monitorResults.analysis}</div></Card>}</div>}
  </div>;
}

function PgWarRoom(){const[log,setLog]=useState([{time:"14:32",msg:"Credential exposure detected",sev:"critical"},{time:"13:15",msg:"Anomalous login from Lagos, NG",sev:"high"},{time:"11:48",msg:"Domain reputation flagged",sev:"medium"},{time:"08:30",msg:"Daily sweep — no exposures",sev:"low"}]);
  const exec=(cmd,d)=>{setLog([{time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),msg:`[CMD] ${cmd}: ${d}`,sev:"info"},...log]);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="War Room" subtitle="Real-time monitoring and command execution. Staffed by intelligence professionals."/>
    <div className="spy-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}><Metric label="Active Threats" value="7" severity="high"/><Metric label="Monitored Assets" value="34"/><Metric label="Alerts (24h)" value="12" severity="medium"/></div>
    <Card style={{padding:24,marginBottom:16}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Command Actions</div>
      <div className="spy-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>{[["Lockdown","Emergency lockdown"],["Full Scan","OSINT sweep"],["Suppress","Suppression protocols"],["Escalate","Escalate to analysts"],["Deploy Decoys","Tracking pixels"],["Revoke Access","Credential revocation"],["Dark Web Sweep","Emergency scan"],["Call Expert","Senior analyst"]].map(([cmd,d],i)=><button key={i} onClick={()=>exec(cmd,d)} style={{padding:"14px 14px",background:C.bgInput,border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}><div style={{fontSize:12,fontWeight:500,color:C.gold,marginBottom:4}}>{cmd}</div><div style={{fontSize:10,color:C.textDim,fontWeight:200}}>{d}</div></button>)}</div></Card>
    <Card style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Activity Log</div>{log.map((e,i)=><div key={i} style={{display:"flex",gap:14,padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",flexWrap:"wrap"}}><span style={{fontSize:11,fontFamily:mono,color:C.textDim,minWidth:42}}>{e.time}</span><Badge severity={e.sev}/><span style={{fontSize:13,fontWeight:200}}>{e.msg}</span></div>)}</Card></div>;}

function PgMap(){const[sel,setSel]=useState(null);const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Situation Map" subtitle={`${CONFLICTS.length} active conflicts tracked. Data from CFR, ACLED, International Crisis Group.`}/>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>{[["war","War",C.critical],["insurgency","Insurgency",C.high],["tension","Tension",C.medium],["instability","Instability",C.high]].map(([t,l,c])=><div key={t} style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:C.textDim}}><span style={{width:6,height:6,borderRadius:"50%",background:c}}/>{l} ({CONFLICTS.filter(z=>z.type===t).length})</div>)}</div>
    <div className="spy-grid-2" style={{display:"grid",gridTemplateColumns:sel?"1fr 320px":"1fr",gap:14,alignItems:"start"}}><div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}><WorldMap zones={CONFLICTS} sel={sel} onSelect={z=>setSel(sel?.id===z.id?null:z)}/></div>
      {sel&&<Card style={{padding:24,animation:"slideIn 0.3s ease"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><Badge severity={sel.sev} label={sel.type}/><button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.textDim,fontSize:10,cursor:"pointer",fontFamily:mono}}>Close</button></div><h3 style={{fontSize:20,fontFamily:serif,fontWeight:400,marginBottom:12}}>{sel.name}</h3><p style={{fontSize:13,color:C.textSec,lineHeight:1.65,fontWeight:200,marginBottom:16}}>{sel.desc}</p>{[["Began",sel.start],["Casualties",sel.cas],["Sources",sel.src]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`1px solid ${C.border}`,fontSize:12}}><span style={{color:C.textDim}}>{k}</span><span style={{fontFamily:mono,fontSize:11}}>{v}</span></div>)}</Card>}</div>
    <div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:6}}>{CONFLICTS.map(z=><Card key={z.id} onClick={()=>setSel(z)} highlight={sel?.id===z.id} style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:5,height:5,borderRadius:"50%",background:tc[z.type]}}/><span style={{fontSize:11,fontWeight:400}}>{z.name}</span></div><Badge severity={z.sev}/></div></Card>)}</div></div>;}

function FP({title,subtitle,features,cta,onCta}){return <div style={{animation:"fadeIn 0.4s ease"}}><SH title={title} subtitle={subtitle}/>
  <div className="spy-grid-2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:24}}>{features.map((x,i)=><Card key={i} style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>{x.tag}</div><h3 style={{fontSize:16,fontFamily:serif,fontWeight:400,marginBottom:8}}>{x.title}</h3><p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{x.desc}</p>{x.remediation&&<RemediationBox text={x.remediation}/>}</Card>)}</div>{cta&&<GoldBtn onClick={onCta}>{cta}</GoldBtn>}</div>;}

// ── PAGE: SETTINGS (#10 - full account management) ───────────────────
function PgSettings({user,isDemo,setPage}){
  const[settingsTab,setSettingsTab]=useState("account");
  const[deleteConfirm,setDeleteConfirm]=useState(false);const[hibernateConfirm,setHibernateConfirm]=useState(false);
  const router=useRouter();
  const handleAction=async(action)=>{
    if(isDemo){alert("Account actions unavailable in demo mode.");return;}
    if(action==="delete"&&!deleteConfirm){setDeleteConfirm(true);return;}
    if(action==="hibernate"&&!hibernateConfirm){setHibernateConfirm(true);return;}
    try{await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:`[Spy Account] ${action}`,email:user?.email,action,timestamp:new Date().toISOString()})});alert(`Request submitted. Our team will process your ${action} request within 24 hours.`);}catch(e){alert("Request failed. Please email support@atlasspy.com.");}
    setDeleteConfirm(false);setHibernateConfirm(false);};

  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Settings" subtitle="Manage your account and intelligence preferences."/>
    <TabBar tabs={[["account","Account"],["subscription","Subscription"],["preferences","Preferences"]]} active={settingsTab} onChange={setSettingsTab}/>

    {settingsTab==="account"&&<><Card style={{padding:28,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{width:52,height:52,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:C.goldDim,border:"1px solid rgba(196,162,101,0.2)"}}><span style={{fontSize:20,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</span></div>
        <div><div style={{fontSize:16,fontWeight:500}}>{user?.name||"Operator"}</div><div style={{fontSize:12,color:C.textDim,fontFamily:mono}}>{user?.email||""}</div><div style={{fontSize:11,color:C.gold,fontFamily:mono,marginTop:4}}>{(user?.tier||"observer").toUpperCase()} TIER</div></div></div>
      {[["Timezone","UTC+3 (Istanbul)"],["Language","English"],["Report Frequency","Weekly"],["Sector Focus","All Sectors"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:`1px solid ${C.border}`,fontSize:13,flexWrap:"wrap",gap:8}}><span style={{color:C.textDim,fontWeight:200}}>{k}</span><span>{v}</span></div>)}
    </Card>
    <Card style={{padding:24,marginBottom:16}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Account Actions</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}><div><div style={{fontSize:13,fontWeight:400}}>Hibernate Account</div><div style={{fontSize:11,color:C.textDim,fontWeight:200}}>Pause your account temporarily. Data preserved.</div></div>
          {hibernateConfirm?<div style={{display:"flex",gap:8}}><GoldBtn small onClick={()=>handleAction("hibernate")}>Confirm</GoldBtn><button onClick={()=>setHibernateConfirm(false)} style={{padding:"8px 18px",border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.textDim,fontSize:10,fontFamily:mono,cursor:"pointer"}}>Cancel</button></div>:<GoldBtn small onClick={()=>handleAction("hibernate")}>Hibernate</GoldBtn>}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}><div><div style={{fontSize:13,fontWeight:400}}>Request Invoice</div><div style={{fontSize:11,color:C.textDim,fontWeight:200}}>Receive a detailed invoice for your records.</div></div><GoldBtn small onClick={()=>handleAction("invoice")}>Request</GoldBtn></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",flexWrap:"wrap",gap:8}}><div><div style={{fontSize:13,fontWeight:400,color:C.critical}}>Delete Account</div><div style={{fontSize:11,color:C.textDim,fontWeight:200}}>Permanently remove all data. Irreversible.</div></div>
          {deleteConfirm?<div style={{display:"flex",gap:8}}><button onClick={()=>handleAction("delete")} style={{padding:"8px 18px",border:`1px solid ${C.critical}`,borderRadius:3,background:C.criticalDim,color:C.critical,fontSize:10,fontFamily:mono,cursor:"pointer",letterSpacing:"1px"}}>CONFIRM DELETE</button><button onClick={()=>setDeleteConfirm(false)} style={{padding:"8px 18px",border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.textDim,fontSize:10,fontFamily:mono,cursor:"pointer"}}>Cancel</button></div>:<button onClick={()=>handleAction("delete")} style={{padding:"8px 18px",border:`1px solid ${C.critical}`,borderRadius:3,background:"transparent",color:C.critical,fontSize:10,fontFamily:mono,cursor:"pointer",letterSpacing:"2px",textTransform:"uppercase"}}>Delete</button>}</div>
      </div>
    </Card></>}

    {settingsTab==="subscription"&&<Card style={{padding:28}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Manage Subscription</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{padding:"16px 0",borderBottom:`1px solid ${C.border}`}}><div style={{fontSize:13,fontWeight:400,marginBottom:4}}>Current Plan: <span style={{color:C.gold}}>{(user?.tier||"Observer").charAt(0).toUpperCase()+(user?.tier||"observer").slice(1)}</span></div><div style={{fontSize:11,color:C.textDim,fontWeight:200}}>Manage your subscription through the links below.</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <GoldBtn full onClick={()=>setPage("membership")}>Upgrade Plan</GoldBtn>
          <GoldBtn full small onClick={()=>handleAction("cancel_subscription")}>Cancel Subscription</GoldBtn>
          <GoldBtn full small onClick={()=>handleAction("invoice")}>Request Invoice</GoldBtn>
        </div>
      </div>
    </Card>}

    {settingsTab==="preferences"&&<PgProfile user={user} isDemo={isDemo}/>}
  </div>;
}

// ── PAGE: PROFILE (#11 - user self-disclosure) ───────────────────────
function PgProfile({user,isDemo}){
  const[profile,setProfile]=useState({linkedin:"",twitter:"",company:"",role:"",industry:"",interests:"",concerns:""});
  const[saved,setSaved]=useState(false);
  const save=async()=>{if(isDemo)return;try{await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"[Spy Profile] User profile update",email:user?.email,...profile,timestamp:new Date().toISOString()})});setSaved(true);setTimeout(()=>setSaved(false),3000);}catch(e){}};
  return <div>
    <Card style={{padding:28,marginBottom:16,borderColor:"rgba(196,162,101,0.15)"}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>Your Intelligence Profile</div>
      <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:8}}>Sharing your information helps our intelligence team provide more targeted analysis and monitoring. <strong style={{color:C.gold,fontWeight:400}}>Everything you share is treated with absolute discretion and stored with end-to-end encryption.</strong></p>
      <p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6,marginBottom:20}}>If you prefer not to share personal details, that is perfectly fine. We can still deliver valuable intelligence and security services without this information.</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <InputField label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={profile.linkedin} onChange={e=>setProfile({...profile,linkedin:e.target.value})}/>
        <InputField label="X / Twitter" placeholder="@handle" value={profile.twitter} onChange={e=>setProfile({...profile,twitter:e.target.value})}/>
        <InputField label="Company / Organization" placeholder="Company name" value={profile.company} onChange={e=>setProfile({...profile,company:e.target.value})}/>
        <InputField label="Role / Position" placeholder="Your role" value={profile.role} onChange={e=>setProfile({...profile,role:e.target.value})}/>
        <InputField label="Industry" placeholder="e.g. Finance, Technology, Legal" value={profile.industry} onChange={e=>setProfile({...profile,industry:e.target.value})}/>
        <InputField label="Areas of Interest" placeholder="Geopolitical risk, competitor intel, personal protection..." value={profile.interests} onChange={e=>setProfile({...profile,interests:e.target.value})} area/>
        <InputField label="Primary Security Concerns" placeholder="What keeps you up at night? Data exposure, reputation, physical safety..." value={profile.concerns} onChange={e=>setProfile({...profile,concerns:e.target.value})} area/>
        <GoldBtn full onClick={save}>Save Profile</GoldBtn>
        {saved&&<div style={{fontSize:12,color:C.low,fontFamily:mono,textAlign:"center"}}>Profile saved securely.</div>}
      </div>
    </Card>
  </div>;
}

// ── NAV ──────────────────────────────────────────────────────────────
const NAV=[
  {group:"Operations",items:[{id:"dash",label:"Command Center"},{id:"warroom",label:"War Room"},{id:"intel",label:"Intelligence Feed"},{id:"map",label:"Situation Map"}]},
  {group:"Investigation",items:[{id:"osint",label:"OSINT Search"},{id:"research",label:"Research Requests"},{id:"footprint",label:"Digital Footprint"},{id:"breaches",label:"Breach Monitor"}]},
  {group:"Protection",items:[{id:"docintel",label:"Document Intelligence"},{id:"suppress",label:"Data Suppression"},{id:"decoy",label:"Decoy Deployment"},{id:"execprot",label:"Executive Protection"}]},
  {group:"Threat Analysis",items:[{id:"predict",label:"Threat Prediction"},{id:"insider",label:"Insider Threats"},{id:"cpir",label:"CPIR Assessment"},{id:"employee",label:"Employee Monitoring"}]},
  {group:"Services",items:[{id:"reports",label:"Reports Center"},{id:"consult",label:"Consultancy"},{id:"membership",label:"Membership"}]},
  {group:"System",items:[{id:"settings",label:"Settings"},{id:"guide",label:"User Guide"}]},
];

// ── DASHBOARD ────────────────────────────────────────────────────────
function PgDash({go}){return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Command Center" subtitle="Your daily intelligence briefing — prepared by our analyst team."/>
  <div className="spy-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
    <Metric label="Security Score" value="—" sub="Run a footprint scan" delay={.05}/><Metric label="Active Conflicts" value={CONFLICTS.filter(z=>z.type==="war").length} delay={.1}/><Metric label="Tracked Zones" value={CONFLICTS.length} delay={.15}/><Metric label="OSINT" value="Ready" severity="info" delay={.2}/></div>
  <div className="spy-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
    <Card style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:18}}>Quick Actions</div>
      {[["Run OSINT Search","osint","Search emails, usernames, domains, IPs"],["Check Breach Exposure","breaches","Scan breach databases"],["Scan Footprint","footprint","Complete exposure analysis"],["Commission Research","research","Task our analyst team"],["Deploy Canary Tokens","execprot","Track document leaks"]].map(([t,id,d],i)=>
        <div key={i} onClick={()=>go(id)} style={{padding:"12px 0",borderTop:i>0?`1px solid ${C.border}`:"none",cursor:"pointer"}}><div style={{fontSize:13,fontWeight:400,color:C.gold,marginBottom:2}}>{t}</div><div style={{fontSize:12,color:C.textDim,fontWeight:200}}>{d}</div></div>)}</Card>
    <Card style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:18}}>Live Intelligence</div>
      <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Open the Intelligence Feed for live analyst-curated news from verified sources.</div>
      <div style={{marginTop:16}}><GoldBtn small onClick={()=>go("intel")}>Open Live Feed</GoldBtn></div></Card></div>
  <Card style={{padding:24}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}><span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>Global Situation — {CONFLICTS.length} zones</span><button onClick={()=>go("map")} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer"}}>Full map</button></div><WorldMap zones={CONFLICTS} sel={null} onSelect={()=>go("map")}/></Card>
</div>;}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function SpyDashboard({user,isDemo}){
  const[page,setPage]=useState("dash");const[collapsed,setCollapsed]=useState(false);const[mobileNav,setMobileNav]=useState(false);
  const[showSplash,setShowSplash]=useState(true);
  const router=useRouter();

  const handleSignOut=async()=>{if(isDemo){router.push("/");return;}const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);await sb.auth.signOut();router.push("/");router.refresh();};

  const rp=()=>{switch(page){
    case"dash":return <PgDash go={setPage}/>;case"warroom":return <PgWarRoom/>;case"intel":return <PgIntel/>;case"map":return <PgMap/>;
    case"osint":return <PgOsint isDemo={isDemo}/>;case"decoy":return <PgDecoy/>;case"cpir":return <PgCPIR/>;
    case"breaches":return <PgBreaches user={user} isDemo={isDemo}/>;case"research":return <PgResearch/>;
    case"footprint":return <PgFootprint isDemo={isDemo}/>;case"execprot":return <PgExecProt isDemo={isDemo}/>;
    case"docintel":return <FP title="Document Intelligence" subtitle="Fuzzy-hash leak detection — built by our intelligence engineering team." features={[{tag:"Fuzzy Hash",title:"SSDeep & TLSH",desc:"Detects modified, translated documents.",remediation:"Register hashes before distribution."},{tag:"Classification",title:"Automated Severity",desc:"Source code: critical. Financial: critical. Strategy: high.",remediation:"Classify before distribution."},{tag:"Metadata",title:"Source Tracing",desc:"Extracts author, editor, creation date from leaks.",remediation:"Sanitize metadata before sharing."},{tag:"Monitoring",title:"24/7 Watch",desc:"Instant alerts on paste sites and dark web.",remediation:"Maintain hash registry."}]} cta="Commission Document Scan" onCta={()=>setPage("research")}/>;
    case"suppress":return <FP title="Data Suppression" subtitle="Automated takedowns by our legal and intelligence team." features={[{tag:"DMCA/GDPR",title:"Automated Takedowns",desc:"AI-assisted instant takedown notices.",remediation:"Document URLs. File within 24h."},{tag:"SEO Burial",title:"Link Suppression",desc:"Push negative links deep into results.",remediation:"Monitor weekly."},{tag:"Monitor",title:"Continuous Watch",desc:"24/7 re-surfacing detection.",remediation:"Alert on re-publications."},{tag:"Reports",title:"Effectiveness",desc:"Success rates, time-to-removal.",remediation:"Review quarterly."}]} cta="Request Suppression" onCta={()=>setPage("research")}/>;
    case"predict":return <FP title="Threat Prediction" subtitle="Pattern-of-life analysis by intelligence specialists." features={[{tag:"Pattern",title:"Behavioral Baseline",desc:"Routines, travel, digital habits.",remediation:"Update quarterly."},{tag:"Predictive",title:"Forecasting",desc:"Cross-reference with global intel.",remediation:"Review weekly."},{tag:"Anomaly",title:"Deviation Alerts",desc:"Unexpected logins, high-risk travel.",remediation:"Investigate within 4h."},{tag:"Actions",title:"Preemptive Recommendations",desc:"Route changes, credential rotations.",remediation:"Implement within 24h."}]} cta="Configure Monitoring" onCta={()=>setPage("research")}/>;
    case"insider":return <FP title="Insider Threats" subtitle="Developed by intelligence psychology specialists." features={[{tag:"Radius",title:"Network Mapping",desc:"Employee influence networks.",remediation:"Review quarterly."},{tag:"Sentiment",title:"Linguistic Intel",desc:"NLP on communications.",remediation:"Address trends."},{tag:"CPIR",title:"Psych Modeling",desc:"Continuous assessment.",remediation:"Conduct quarterly."},{tag:"Score",title:"Threat Index",desc:"Composite score.",remediation:"Review with HR."}]} cta="Deploy Assessment" onCta={()=>setPage("cpir")}/>;
    case"employee":return <FP title="Employee Monitoring" subtitle="Continuous digital monitoring by our surveillance team." features={[{tag:"Continuous",title:"Exposure Tracking",desc:"Monitor across breach databases.",remediation:"Notify within 24h."},{tag:"Weekly",title:"Automated Reports",desc:"Monday reports.",remediation:"Review every Monday."},{tag:"Anomaly",title:"Behavioral Flags",desc:"Unusual platform activity.",remediation:"Investigate within 48h."},{tag:"Pricing",title:"Per-Employee",desc:"$2.99/employee/month."}]} cta="Add Employees" onCta={()=>setPage("research")}/>;
    case"reports":return <FP title="Reports Center" subtitle="Intelligence deliverables prepared by our analyst team." features={[{tag:"Weekly",title:"Threat Evaluation",desc:"Comprehensive weekly brief."},{tag:"Monthly",title:"Employee Summary",desc:"Exposure summary."},{tag:"Quarterly",title:"Trend Report",desc:"Exposure trends."},{tag:"OSINT",title:"Research Deliverables",desc:"Completed reports."}]} cta="Configure Frequency" onCta={()=>setPage("research")}/>;
    case"consult":return <FP title="Consultancy" subtitle="Direct access to our intelligence professionals." features={[{tag:"Briefings",title:"Weekly Threat Briefs",desc:"Tailored actionable intelligence."},{tag:"Legal",title:"Document Review",desc:"Data protection specialists."},{tag:"Intel",title:"External Monitoring",desc:"Brand impersonation detection."},{tag:"Call Center",title:"Multilingual 24/7",desc:"EN, TR, DE, FR, ES, AR, RU, ZH."}]} cta="Book Consultation" onCta={()=>setPage("research")}/>;
    case"membership":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Membership" subtitle="Intelligence as a Service — choose your level of awareness."/>
      <div className="spy-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32}}>
        {[{id:"obs",n:"Observer",p:"Free",f:["5 OSINT searches/month","Weekly digest","Breach alerts","Threat map"]},
          {id:"analyst",n:"Analyst",p:"$49",r:true,f:["Unlimited OSINT","Real-time monitoring","NLP feed","Sector filtering","Footprint analysis","Reports","War Room","Call center"]},
          {id:"director",n:"Director",p:"$149",f:["Everything in Analyst","Data poisoning","Document intelligence","Decoy deployment","Threat prediction","Assigned analyst","Legal consultancy"]},
          {id:"ent",n:"Enterprise",p:"Custom",f:["Everything in Director","Employee monitoring","CPIR module","Radius of influence","Dedicated team","SLA guarantee"]},
        ].map((p,i)=><Card key={p.id} style={{padding:24,position:"relative"}}>
          {p.r&&<div style={{position:"absolute",top:-1,left:20,padding:"3px 12px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 3px 3px"}}>Recommended</div>}
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:10}}>{p.n}</div>
          <div style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:20}}>{p.p}<span style={{fontSize:13,color:C.textDim}}>{p.p!=="Free"&&p.p!=="Custom"?"/mo":""}</span></div>
          {p.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:C.textSec,fontWeight:200,marginBottom:6}}><span style={{color:C.gold,fontSize:9}}>&#10022;</span>{f}</div>)}
        </Card>)}</div>
      <Card style={{padding:28,maxWidth:520}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:16}}>Subscribe</div>
        <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:20}}>Select your plan. Payments processed securely by iyzico.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <GoldBtn full onClick={()=>window.open("/api/payment?tier=analyst","_blank")}>Analyst — $49/mo</GoldBtn>
          <GoldBtn full onClick={()=>window.open("/api/payment?tier=director","_blank")}>Director — $149/mo</GoldBtn>
          <button onClick={()=>setPage("consult")} style={{padding:"14px 28px",border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.textSec,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",width:"100%"}}>Enterprise — Contact Us</button>
        </div>
        <div style={{fontSize:10,color:C.textDim,fontFamily:mono,textAlign:"center",marginTop:14}}>Secured by iyzico — Cancel anytime</div>
      </Card></div>;
    case"settings":return <PgSettings user={user} isDemo={isDemo} setPage={setPage}/>;
    case"guide":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="User Guide" subtitle="Understanding the platform."/>
      <Card style={{padding:28}}><p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,maxWidth:680}}>Spy by Atlas is a private intelligence platform designed and operated by intelligence professionals. Every feature — from OSINT search to threat prediction — is built on methodologies used by professional intelligence teams worldwide.</p><p style={{fontSize:13,color:C.textDim,fontWeight:200,lineHeight:1.7,marginTop:12}}>Features with live indicators perform real-time web searches. Results are not cached or pre-generated.</p></Card></div>;
    default:return <PgDash go={setPage}/>;
  }};

  if(showSplash)return <><style>{css}</style><SplashScreen onDone={()=>setShowSplash(false)}/></>;

  const navClick=(id)=>{setPage(id);setMobileNav(false);};

  return <><style>{css}</style>
    {isDemo&&<div style={{background:C.goldDim,borderBottom:`1px solid rgba(196,162,101,0.2)`,padding:"6px 14px",fontSize:11,fontFamily:mono,color:C.gold,letterSpacing:"1px",textAlign:"center"}}>DEMO MODE — <a href="/signup" style={{color:C.gold,textDecoration:"underline"}}>Sign up</a> for full access.</div>}
    {mobileNav&&<div onClick={()=>setMobileNav(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:99}}/>}
    <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
      <aside className={mobileNav?"spy-sidebar spy-sidebar-open":"spy-sidebar"} style={{width:collapsed?56:232,background:C.bgSidebar,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s ease",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:collapsed?"20px 10px 16px":"20px 20px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>{if(mobileNav)setMobileNav(false);else setCollapsed(!collapsed);}}>
          {collapsed?<span style={{fontSize:16,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"2px",textAlign:"center",width:"100%"}}>Spy</span>:<SpyLogo/>}
        </div>
        <nav style={{flex:1,overflowY:"auto",padding:"8px 6px"}}>
          {NAV.map(g=><div key={g.group} style={{marginBottom:4}}>
            {!collapsed&&<div style={{padding:"10px 12px 4px",fontSize:9,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>{g.group}</div>}
            {collapsed&&<div style={{height:1,background:C.border,margin:"6px 8px"}}/>}
            {g.items.map(n=><button key={n.id} onClick={()=>navClick(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"7px":"7px 12px",border:"none",borderRadius:3,cursor:"pointer",fontFamily:sans,fontSize:11,fontWeight:page===n.id?500:200,width:"100%",background:page===n.id?C.goldDim:"transparent",color:page===n.id?C.gold:C.textSec,transition:"all 0.15s",justifyContent:collapsed?"center":"flex-start",letterSpacing:".2px",whiteSpace:"nowrap",overflow:"hidden"}}>{collapsed?<span style={{fontSize:9,fontFamily:mono}}>{n.label.slice(0,2).toUpperCase()}</span>:n.label}</button>)}
          </div>)}
        </nav>
        <div style={{padding:"8px 6px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={handleSignOut} style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"7px":"7px 12px",border:"none",cursor:"pointer",background:"transparent",width:"100%",color:C.textDim,fontSize:11,fontFamily:sans,borderRadius:3,justifyContent:collapsed?"center":"flex-start",fontWeight:200}}>{collapsed?<span style={{fontSize:9,fontFamily:mono}}>OUT</span>:isDemo?"Exit Demo":"Sign Out"}</button>
        </div>
      </aside>
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header className="spy-header-pad" style={{height:48,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="spy-mobile-toggle" onClick={()=>setMobileNav(!mobileNav)} style={{display:"none",alignItems:"center",justifyContent:"center",width:32,height:32,border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.gold,cursor:"pointer",fontSize:14}}>☰</button>
            <span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>{NAV.flatMap(g=>g.items).find(n=>n.id===page)?.label||"Command Center"}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:10,fontFamily:mono,color:C.textDim,display:"none"}} className="spy-date">{new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}</span>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("settings")}>
              <div style={{width:26,height:26,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:11,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</div>
            </div></div>
        </header>
        <div className="spy-main-pad" style={{flex:1,overflow:"auto",padding:"24px 28px"}}>{rp()}</div>
        <footer className="spy-footer-wrap" style={{padding:"8px 28px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:8,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — INTELLIGENCE AS A SERVICE</span>
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:8,fontFamily:mono,color:C.textDim,letterSpacing:"1px"}}><span style={{width:4,height:4,borderRadius:"50%",background:C.low,animation:"glow 3s infinite"}}/>ENCRYPTED</span>
        </footer>
      </main>
    </div></>;
}
