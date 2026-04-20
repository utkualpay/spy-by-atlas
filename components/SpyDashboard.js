"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { t as T, LANGS, getLang, setLang } from "@/lib/i18n";

// ── THEME ────────────────────────────────────────────────────────────
const C={bg:"#09090b",bgCard:"#131316",bgHover:"#1a1a1f",bgSidebar:"#0c0c0f",bgInput:"#18181c",border:"#1f1f25",borderHover:"#2a2a32",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)",goldMid:"rgba(196,162,101,0.20)",critical:"#c45c5c",criticalDim:"rgba(196,92,92,0.10)",high:"#c49a5c",highDim:"rgba(196,154,92,0.10)",medium:"#7c8db5",mediumDim:"rgba(124,141,181,0.10)",low:"#6b9e7a",lowDim:"rgba(107,158,122,0.10)",info:"#8b8db5",infoDim:"rgba(139,141,181,0.10)",warRed:"#8b1a1a",warRedDim:"rgba(139,26,26,0.12)",warRedBorder:"rgba(139,26,26,0.35)"};
const css=`
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes scanline{0%{left:-100%}100%{left:100%}}
@keyframes splashFade{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
@keyframes splashText{0%{opacity:0;letter-spacing:14px}30%{opacity:0.8;letter-spacing:8px}80%{opacity:0.8;letter-spacing:8px}100%{opacity:0;letter-spacing:4px}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes warPulse{0%,100%{box-shadow:0 0 20px rgba(139,26,26,0.1)}50%{box-shadow:0 0 40px rgba(139,26,26,0.25)}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}::selection{background:${C.goldDim};color:${C.gold}}
*{box-sizing:border-box}input,textarea,select{box-sizing:border-box;max-width:100%}
@media(max-width:768px){
.sg4{grid-template-columns:repeat(2,1fr)!important}.sg3,.sg2{grid-template-columns:1fr!important}
.smp{padding:16px 14px!important}.shp{padding:0 14px!important}
.ssb{display:none!important}.ssbo{display:flex!important;position:fixed;top:0;left:0;bottom:0;z-index:100;width:260px!important}
.smt{display:flex!important}}`;
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const FORMSPREE=process.env.NEXT_PUBLIC_FORMSPREE_ID||"mvzvdjrq";

// ── CONFLICT DATA ────────────────────────────────────────────────────
const CONFLICTS=[
  {id:1,name:"Ukraine — Russia",lat:48.5,lng:35,type:"war",sev:"critical",desc:"Full-scale conventional war. Active frontlines across eastern oblasts. 500,000+ casualties.",cas:"500,000+",start:"Feb 2022",src:"CFR, ACLED, ISW"},
  {id:2,name:"Sudan Civil War",lat:15.5,lng:32.5,type:"war",sev:"critical",desc:"SAF vs RSF. Famine conditions confirmed. Acts described as genocide in Darfur.",cas:"150,000+",start:"Apr 2023",src:"Crisis Group, ACLED, OCHA"},
  {id:3,name:"Gaza — Israel",lat:31.4,lng:34.4,type:"war",sev:"critical",desc:"Active military operations. Mass displacement. Infrastructure destruction.",cas:"45,000+",start:"Oct 2023",src:"CFR, UNRWA"},
  {id:4,name:"Myanmar Civil War",lat:19.7,lng:96.2,type:"war",sev:"critical",desc:"Resistance forces vs military junta across multiple states.",cas:"15,000+/yr",start:"Feb 2021",src:"ACLED, Myanmar Now"},
  {id:5,name:"DR Congo — M23",lat:-1.5,lng:29,type:"war",sev:"high",desc:"M23 advance in North Kivu. Rwanda-backed forces vs DRC army. Mineral-driven.",cas:"10,000+",start:"2022",src:"Crisis Group, UN Panel"},
  {id:6,name:"Yemen — Houthi",lat:15.4,lng:44.2,type:"war",sev:"high",desc:"Red Sea shipping attacks. US/UK strikes. 21M people in humanitarian crisis.",cas:"Thousands",start:"2014",src:"CFR, ACLED"},
  {id:7,name:"Sahel Insurgency",lat:14,lng:1,type:"insurgency",sev:"high",desc:"JNIM, ISGS across Mali, Burkina Faso, Niger. Wagner/Africa Corps presence.",cas:"Thousands",start:"2012",src:"Crisis Group, ACLED"},
  {id:8,name:"India — Pakistan",lat:34,lng:74,type:"tension",sev:"high",desc:"Heightened tensions over Kashmir. Nuclear-armed states. Cross-border clashes.",cas:"Hundreds",start:"Ongoing",src:"CFR, SIPRI"},
  {id:9,name:"Iran — US/Israel",lat:32.4,lng:53.7,type:"tension",sev:"critical",desc:"Direct conflict 2025. Strait of Hormuz disruptions. Regional destabilization.",cas:"Unknown",start:"2025",src:"CFR, IISS"},
  {id:10,name:"Taiwan Strait",lat:24,lng:120,type:"tension",sev:"medium",desc:"PLA provocations. Air and naval incursions into Taiwan ADIZ.",cas:"N/A",start:"Ongoing",src:"CFR, CSIS"},
  {id:11,name:"Russia — NATO",lat:56,lng:26,type:"tension",sev:"high",desc:"Hybrid warfare. Sabotage operations against NATO infrastructure.",cas:"N/A",start:"2022",src:"CFR, NATO STRATCOM"},
  {id:12,name:"Mexico Cartels",lat:23.6,lng:-102.5,type:"instability",sev:"high",desc:"Transnational criminal organizations. 30,000+ annual homicides.",cas:"30,000+/yr",start:"2006",src:"CFR, InSight Crime"},
  {id:13,name:"Burkina Faso",lat:12.4,lng:-1.5,type:"war",sev:"high",desc:"JNIM and ISGS control large swathes. Civilian massacres. Junta government.",cas:"Thousands",start:"2015",src:"ACLED, HRW"},
  {id:14,name:"South Sudan",lat:6.8,lng:31.6,type:"war",sev:"high",desc:"Government vs opposition across multiple states.",cas:"Thousands",start:"2013",src:"Crisis Group, UNMISS"},
  {id:15,name:"Somalia — Al-Shabaab",lat:2,lng:45,type:"insurgency",sev:"high",desc:"Controls ~60% of south. AU mission drawdown creating security vacuum.",cas:"Thousands",start:"2006",src:"CFR, ACLED, AMISOM"},
  {id:16,name:"Nigeria",lat:9.1,lng:7.5,type:"insurgency",sev:"high",desc:"Boko Haram/ISWAP northeast. Banditry northwest. Multi-dimensional crisis.",cas:"Thousands",start:"2009",src:"ACLED, ICG"},
  {id:17,name:"Lebanon — Israel",lat:33.3,lng:35.5,type:"tension",sev:"high",desc:"Hezbollah disarmament failing. Israeli strikes destabilizing government.",cas:"2,000+",start:"Oct 2023",src:"CFR, UNIFIL"},
  {id:18,name:"Haiti",lat:18.9,lng:-72.3,type:"instability",sev:"high",desc:"Armed gangs control Port-au-Prince. State institutions non-functional.",cas:"Thousands",start:"2021",src:"CFR, ICG"},
  {id:19,name:"Venezuela — US",lat:10.5,lng:-66.9,type:"war",sev:"critical",desc:"US Operation 'Absolute Resolve'. Large-scale strikes. Ongoing instability.",cas:"Unknown",start:"Jan 2026",src:"CFR"},
  {id:20,name:"Syria — Post-Assad",lat:35,lng:38,type:"instability",sev:"high",desc:"Post-Assad transition. ISIS resurgence. Turkish, Israeli interventions.",cas:"Unknown",start:"2011",src:"CFR, SOHR"},
];

const SECTORS=["All Sectors","Cybersecurity","Finance & Banking","Energy & Infrastructure","Healthcare","Defense & Government","Technology","Legal","Maritime & Logistics","Telecommunications"];

// ── UTILITY COMPONENTS ───────────────────────────────────────────────
function Badge({severity:s,label:l}){const m={critical:[C.critical,C.criticalDim],high:[C.high,C.highDim],medium:[C.medium,C.mediumDim],low:[C.low,C.lowDim],info:[C.info,C.infoDim]};const[f,b]=m[s]||[C.textSec,C.bgInput];return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:3,fontSize:10,fontWeight:500,fontFamily:mono,textTransform:"uppercase",letterSpacing:".8px",color:f,background:b}}>{s==="critical"&&<span style={{width:4,height:4,borderRadius:"50%",background:f,animation:"pulse 2s infinite"}}/>}{l||s}</span>;}
function Metric({label,value,sub,severity,delay=0}){return <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"18px 20px",animation:`fadeIn 0.5s ease ${delay}s both`}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:10,color:C.textDim,fontFamily:mono,textTransform:"uppercase",letterSpacing:"1px"}}>{label}</span>{severity&&<Badge severity={severity}/>}</div><div style={{fontSize:26,fontWeight:200,fontFamily:serif,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:10,color:C.textDim,marginTop:6,fontFamily:mono}}>{sub}</div>}</div>;}
function SH({title,subtitle}){return <div style={{marginBottom:24}}><h2 style={{fontSize:22,fontWeight:300,fontFamily:serif,letterSpacing:"-0.3px"}}>{title}</h2>{subtitle&&<p style={{color:C.textDim,fontSize:13,marginTop:6,fontWeight:200,lineHeight:1.5}}>{subtitle}</p>}<div style={{width:32,height:1,background:C.gold,marginTop:14,opacity:.4}}/></div>;}
function Card({children,highlight,style,onClick}){const[h,setH]=useState(false);return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick} style={{background:C.bgCard,border:`1px solid ${highlight?"rgba(196,162,101,0.25)":h?C.borderHover:C.border}`,borderRadius:4,transition:"border-color 0.2s",cursor:onClick?"pointer":"default",...style}}>{children}</div>;}
function GoldBtn({children,onClick,full,small,disabled,danger}){const[h,setH]=useState(false);const bc=danger?C.critical:C.gold;return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:small?"8px 16px":"13px 24px",border:`1px solid ${disabled?C.border:bc}`,borderRadius:3,background:h&&!disabled?(danger?C.criticalDim:C.goldDim):"transparent",color:disabled?C.textDim:bc,fontSize:small?10:11,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",cursor:disabled?"default":"pointer",transition:"all 0.3s",width:full?"100%":"auto",opacity:disabled?.5:1}}>{children}</button>;}
function Inp({placeholder,value,onChange,mono:im,area,onKeyDown,label,style:st}){const s={width:"100%",padding:area?"14px 16px":"11px 16px",background:C.bgInput,border:`1px solid ${C.border}`,borderRadius:3,color:C.text,fontSize:13,fontFamily:im?mono:sans,outline:"none",fontWeight:300,transition:"border-color 0.3s",resize:area?"vertical":"none",boxSizing:"border-box",maxWidth:"100%",...st};return <div style={{width:"100%"}}>{label&&<div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>{label}</div>}{area?<textarea style={{...s,minHeight:90}} placeholder={placeholder} value={value} onChange={onChange} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>:<input style={s} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>}</div>;}
function TabBar({tabs,active,onChange}){return <div style={{display:"flex",gap:1,marginBottom:20,background:C.bgCard,borderRadius:3,padding:3,border:`1px solid ${C.border}`,width:"fit-content",flexWrap:"wrap"}}>{tabs.map(([k,l])=><button key={k} onClick={()=>onChange(k)} style={{padding:"7px 16px",border:"none",borderRadius:2,fontSize:11,fontWeight:400,cursor:"pointer",fontFamily:sans,background:active===k?C.gold:"transparent",color:active===k?C.bg:C.textSec}}>{l}</button>)}</div>;}
function Loader({text}){return <Card style={{padding:40,textAlign:"center"}}><div style={{fontSize:12,color:C.gold,fontFamily:mono,letterSpacing:"2px",marginBottom:16,textTransform:"uppercase"}}>{text||"Processing..."}</div><div style={{width:200,height:2,background:C.border,margin:"0 auto",borderRadius:1,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",width:"40%",height:"100%",background:C.gold,animation:"scanline 1.5s ease infinite"}}/></div></Card>;}
function SpyLogo({size="normal"}){const sz=size==="large"?{fs:56,sub:9}:{fs:22,sub:7};return <div style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:sz.fs,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px",lineHeight:1}}>Spy</span><span style={{fontSize:sz.sub,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></div>;}

// ── SPLASH (#7) ──────────────────────────────────────────────────────
function Splash({onDone}){useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);
return <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,animation:"splashFade 2.8s ease forwards"}}><div style={{textAlign:"center"}}><div style={{fontSize:72,fontFamily:serif,fontWeight:200,color:C.gold,animation:"splashText 2.8s ease forwards",opacity:0,textShadow:"0 0 80px rgba(196,162,101,0.12)"}}>Spy</div><div style={{fontSize:9,fontFamily:mono,letterSpacing:"3px",color:"rgba(196,162,101,0.25)",marginTop:8,animation:"splashFade 2.8s ease forwards",textTransform:"uppercase"}}>by Atlas</div></div></div>;}

// ── ONBOARDING (#2) ──────────────────────────────────────────────────
function Onboarding({onComplete,onSetAccountType}){const[step,setStep]=useState(0);const[accountType,setAccountType]=useState(null);
const steps=[
  {title:"Welcome to Spy",desc:"Your private intelligence platform, designed and operated by intelligence professionals.",icon:"🛡️",type:"info"},
  {title:"Who is this for?",desc:"We'll configure your dashboard based on your needs.",icon:"👤",type:"account_select"},
  {title:"Command Center",desc:"Your daily intelligence hub. Personalized briefs, global threat landscape, and quick-access to all modules.",icon:"📊",type:"info"},
  {title:"The War Room",desc:"Direct AI intelligence analyst. Real-time guidance for any situation — cyber incidents, threat assessments, operational decisions.",icon:"🔴",type:"info"},
  {title:"Reports Center",desc:"Every analysis auto-saves as a formal intelligence report. Your complete classified archive.",icon:"📋",type:"info"},
  {title:"Start Your 7-Day Trial",desc:"Full access to all intelligence modules. No limitations. Cancel anytime before the trial ends.",icon:"✦",type:"info"},
];
const s=steps[step];
const finish=()=>{if(accountType)onSetAccountType(accountType);onComplete();};
return <div style={{animation:"fadeIn 0.4s ease"}}><Card style={{padding:40,maxWidth:560,margin:"0 auto",textAlign:"center"}}>
  <div style={{fontSize:40,marginBottom:16}}>{s.icon}</div>
  <div style={{fontSize:22,fontFamily:serif,fontWeight:300,marginBottom:12}}>{s.title}</div>
  <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:24}}>{s.desc}</p>
  {s.type==="account_select"&&<div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24,maxWidth:360,margin:"0 auto 24px"}}>
    {[["personal","Personal","Individual intelligence and digital protection"],["family","Family","Protect your family. Monitor children's social media safety."],["business","Business","Corporate intelligence, supply chain monitoring, team seats."]].map(([k,label,desc])=>
      <div key={k} onClick={()=>setAccountType(k)} style={{padding:"16px 20px",border:`1px solid ${accountType===k?C.gold:C.border}`,borderRadius:4,background:accountType===k?C.goldDim:"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
        <div style={{fontSize:13,fontWeight:accountType===k?500:300,color:accountType===k?C.gold:C.text}}>{label}</div>
        <div style={{fontSize:11,color:C.textDim,fontWeight:200,marginTop:2}}>{desc}</div>
      </div>)}
  </div>}
  <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:24}}>{steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:4,borderRadius:2,background:i===step?C.gold:C.border,transition:"all 0.3s"}}/>)}</div>
  <div style={{display:"flex",gap:12,justifyContent:"center"}}>
    {step>0&&<GoldBtn small onClick={()=>setStep(step-1)}>Back</GoldBtn>}
    {step===1&&!accountType?<GoldBtn disabled>Select to Continue</GoldBtn>:step<steps.length-1?<GoldBtn onClick={()=>setStep(step+1)}>Next</GoldBtn>:<GoldBtn onClick={finish}>Start Trial</GoldBtn>}
  </div>
  <button onClick={finish} style={{background:"none",border:"none",color:C.textDim,fontSize:11,cursor:"pointer",fontFamily:mono,marginTop:16}}>Skip</button>
</Card></div>;}

// ── WORLD MAP ────────────────────────────────────────────────────────
function WorldMap({zones,sel,onSelect}){
  const tx=l=>((l+180)/360)*800,ty=l=>((90-l)/180)*450;
  const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
  // Simplified but recognizable Mercator continent polygons
  const lands=[
    // North America
    "M45,65 L60,55 L80,58 L105,60 L130,58 L148,63 L160,70 L168,60 L180,55 L200,58 L218,62 L230,58 L242,65 L250,72 L252,82 L248,95 L240,108 L232,115 L228,125 L220,135 L215,145 L210,148 L200,152 L193,158 L185,168 L180,175 L175,172 L178,160 L182,150 L180,140 L172,130 L165,125 L155,120 L148,115 L140,112 L128,110 L118,108 L110,105 L105,100 L100,92 L92,88 L82,82 L72,78 L60,75 L52,72 Z",
    // Central America + Caribbean
    "M175,172 L180,175 L188,180 L195,185 L200,190 L205,195 L210,200 L215,198 L218,202 L215,208 L208,206 L200,200 L192,195 L185,188 L178,182 Z",
    // South America
    "M218,202 L228,198 L240,202 L252,208 L262,212 L275,218 L288,228 L298,238 L302,250 L300,262 L295,275 L288,288 L280,300 L272,312 L265,322 L258,332 L252,340 L248,350 L245,355 L242,345 L240,332 L238,318 L236,305 L235,290 L234,275 L232,260 L228,248 L225,238 L222,228 L218,218 L215,210 Z",
    // Europe
    "M375,50 L390,48 L400,52 L408,55 L415,52 L425,55 L435,50 L445,52 L455,48 L462,52 L468,58 L472,65 L470,72 L465,80 L460,88 L455,95 L458,100 L462,108 L460,115 L455,120 L448,125 L440,122 L432,118 L425,112 L418,108 L410,110 L405,115 L398,118 L390,120 L385,125 L380,128 L375,122 L378,115 L382,108 L380,100 L375,92 L370,85 L368,78 L370,68 L372,60 Z",
    // UK + Ireland
    "M370,62 L375,58 L380,60 L382,65 L380,72 L376,78 L372,75 L370,68 Z",
    "M365,65 L368,62 L370,65 L368,70 L365,68 Z",
    // Africa
    "M380,128 L390,130 L400,128 L412,130 L425,128 L438,132 L448,135 L458,140 L465,148 L470,158 L475,168 L480,178 L485,188 L490,195 L495,200 L498,205 L495,212 L490,220 L485,232 L482,242 L478,255 L475,265 L470,275 L465,285 L458,295 L450,305 L445,310 L440,315 L448,318 L455,315 L460,318 L455,322 L445,322 L435,320 L425,315 L415,310 L408,302 L400,295 L392,285 L385,272 L380,260 L378,248 L376,235 L375,222 L374,210 L372,198 L370,185 L370,172 L372,160 L375,148 L378,138 Z",
    // Asia (mainland)
    "M468,58 L480,55 L495,52 L510,48 L530,42 L550,38 L570,35 L590,32 L610,30 L630,28 L650,30 L668,32 L680,35 L692,40 L700,45 L708,48 L715,52 L718,58 L715,65 L710,72 L705,80 L700,88 L695,95 L690,105 L685,112 L678,118 L670,125 L665,132 L660,138 L652,145 L642,152 L635,158 L628,165 L620,170 L612,175 L605,178 L598,175 L590,170 L582,165 L575,162 L568,165 L562,172 L555,180 L548,188 L542,192 L535,185 L528,178 L520,172 L512,168 L505,162 L498,155 L492,148 L485,142 L478,135 L472,125 L468,115 L462,108 L458,100 L455,95 L460,88 L465,80 L470,72 Z",
    // India + SE Asia
    "M555,148 L565,145 L575,148 L585,152 L592,158 L598,165 L598,175 L592,182 L585,190 L578,198 L572,205 L565,198 L558,188 L552,178 L550,168 L552,158 Z",
    // Arabian Peninsula
    "M475,148 L482,142 L492,140 L500,145 L508,152 L515,162 L518,170 L515,178 L508,182 L500,185 L492,182 L486,175 L480,168 L476,158 Z",
    // Japan
    "M712,80 L718,75 L720,82 L718,92 L715,100 L712,108 L708,105 L710,95 L712,88 Z",
    // Australia
    "M640,248 L655,240 L672,235 L690,235 L705,240 L718,248 L725,258 L728,268 L725,280 L718,288 L710,295 L698,298 L685,298 L672,295 L660,288 L650,278 L645,268 L642,258 Z",
    // Indonesia/Philippines
    "M628,210 L642,205 L658,208 L672,212 L685,218 L695,225 L688,230 L675,228 L660,224 L645,220 L632,215 Z",
    // Greenland
    "M268,22 L285,18 L302,16 L318,18 L330,25 L335,35 L332,48 L325,55 L315,60 L302,62 L288,58 L278,50 L272,40 L268,30 Z",
    // New Zealand
    "M745,310 L748,305 L752,310 L750,318 L748,325 L745,320 Z",
    // Madagascar
    "M498,290 L502,285 L505,292 L503,300 L500,298 Z",
    // Iceland
    "M348,42 L355,38 L362,42 L360,48 L355,50 L350,48 Z",
  ];
  return <svg viewBox="0 0 800 450" style={{width:"100%",background:"#0c0c0e",borderRadius:4}}>
    <defs>
      <radialGradient id="mapBg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="rgba(196,162,101,0.03)"/><stop offset="100%" stopColor="transparent"/></radialGradient>
    </defs>
    <rect width="800" height="450" fill="url(#mapBg)"/>
    {/* Grid lines */}
    {Array.from({length:17},(_,i)=><line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2={450} stroke={C.border} strokeWidth={.2} opacity={.3}/>)}
    {Array.from({length:10},(_,i)=><line key={`h${i}`} x1={0} y1={i*50} x2={800} y2={i*50} stroke={C.border} strokeWidth={.2} opacity={.3}/>)}
    {/* Equator + prime meridian */}
    <line x1={0} y1={225} x2={800} y2={225} stroke="rgba(196,162,101,0.08)" strokeWidth={.5} strokeDasharray="4,4"/>
    <line x1={400} y1={0} x2={400} y2={450} stroke="rgba(196,162,101,0.08)" strokeWidth={.5} strokeDasharray="4,4"/>
    {/* Continents */}
    {lands.map((d,i)=><path key={i} d={d} fill="rgba(196,162,101,0.07)" stroke="rgba(196,162,101,0.18)" strokeWidth={.6} strokeLinejoin="round"/>)}
    {/* Conflict markers */}
    {zones.map(z=>{const cx=tx(z.lng),cy=ty(z.lat),c=tc[z.type]||C.medium,s=sel?.id===z.id;
      return <g key={z.id} onClick={()=>onSelect(z)} style={{cursor:"pointer"}}>
        <circle cx={cx} cy={cy} r={s?22:14} fill={c} opacity={.06}><animate attributeName="r" values={`${s?22:14};${s?32:22};${s?22:14}`} dur="3s" repeatCount="indefinite"/></circle>
        <circle cx={cx} cy={cy} r={s?5:3} fill={c} opacity={.9}/>
        {s&&<circle cx={cx} cy={cy} r={8} fill="none" stroke={c} strokeWidth={.8} opacity={.6}/>}
        {s&&<text x={cx} y={cy-12} textAnchor="middle" fill={c} fontSize={8} fontFamily={mono} opacity={.7}>{z.name}</text>}
      </g>;})}
  </svg>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: WAR ROOM (#17 — red theme, AI chat)
// ═══════════════════════════════════════════════════════════════════
function PgWarRoom(){
  const[msgs,setMsgs]=useState([{role:"model",text:"ATLAS ACTUAL online. Secure channel established.\n\nBrief me on the situation. What do you need assessed?"}]);
  const[input,setInput]=useState("");const[loading,setLoading]=useState(false);const endRef=useRef(null);
  const[sessions,setSessions]=useState([]);const[sessionId,setSessionId]=useState(null);const[showSessions,setShowSessions]=useState(false);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{fetch("/api/warroom").then(r=>r.json()).then(d=>{if(Array.isArray(d))setSessions(d);}).catch(()=>{});},[]);

  const saveSession=async(m)=>{if(!sessionId){const r=await fetch("/api/warroom",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"create",title:m[1]?.text?.slice(0,40)||"Session",messages:m})});const d=await r.json();if(d.id)setSessionId(d.id);}else{await fetch("/api/warroom",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save",sessionId,messages:m,title:m[1]?.text?.slice(0,40)||"Session"})});}};
  const loadSession=async(id)=>{const r=await fetch("/api/warroom",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"load",sessionId:id})});const d=await r.json();if(d.messages){setMsgs(d.messages);setSessionId(id);setShowSessions(false);}};
  const newSession=()=>{setMsgs([{role:"model",text:"ATLAS ACTUAL online. New secure channel.\n\nBrief me."}]);setSessionId(null);setShowSessions(false);};
  const resolveSession=async()=>{if(sessionId){await fetch("/api/warroom",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"resolve",sessionId})});newSession();}};

  const send=async()=>{if(!input.trim()||loading)return;const userMsg=input.trim();setInput("");
    const newMsgs=[...msgs,{role:"user",text:userMsg}];setMsgs(newMsgs);setLoading(true);
    try{const r=await fetch("/api/gemini/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({history:newMsgs})});
      const d=await r.json();const finalMsgs=[...newMsgs,{role:"model",text:d.reply||"Signal lost. Retry."}];setMsgs(finalMsgs);saveSession(finalMsgs);
    }catch(e){const finalMsgs=[...newMsgs,{role:"model",text:"Connection interrupted."}];setMsgs(finalMsgs);}
    setLoading(false);};

  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{width:10,height:10,borderRadius:"50%",background:C.warRed,animation:"pulse 2s infinite"}}/>
          <h2 style={{fontSize:22,fontWeight:300,fontFamily:serif,color:C.critical}}>War Room</h2>
        </div>
        <div style={{display:"flex",gap:6}}>
          <GoldBtn small onClick={()=>setShowSessions(!showSessions)}>Sessions ({sessions.length})</GoldBtn>
          <GoldBtn small onClick={newSession}>New Session</GoldBtn>
          {sessionId&&<GoldBtn small danger onClick={resolveSession}>Resolve</GoldBtn>}
        </div>
      </div>
      <p style={{color:C.textDim,fontSize:13,fontWeight:200,marginTop:6}}>Secure channel to ATLAS ACTUAL — Senior Intelligence Analyst. Sessions are encrypted and saved.</p>
      <div style={{width:32,height:1,background:C.warRed,marginTop:14,opacity:.6}}/>
    </div>

    {showSessions&&<Card style={{padding:16,marginBottom:16}}><div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:10}}>Previous Sessions</div>
      {sessions.length===0&&<div style={{fontSize:12,color:C.textDim,fontWeight:200}}>No saved sessions.</div>}
      {sessions.map((s,i)=><div key={s.id} onClick={()=>loadSession(s.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:i>0?`1px solid ${C.border}`:"none",cursor:"pointer",fontSize:12}}>
        <span style={{color:C.text}}>{s.title||"Untitled"}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge severity={s.status==="resolved"?"low":"high"} label={s.status}/><span style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{new Date(s.updated_at).toLocaleDateString()}</span></div>
      </div>)}
    </Card>}

    <div style={{background:"#0a0808",border:`1px solid ${C.warRedBorder}`,borderRadius:4,padding:20,minHeight:400,maxHeight:520,overflowY:"auto",marginBottom:16,animation:"warPulse 4s infinite"}}>
      {msgs.map((m,i)=><div key={i} style={{marginBottom:16,animation:i===msgs.length-1?"fadeIn 0.3s ease":"none"}}>
        <div style={{fontSize:9,fontFamily:mono,letterSpacing:"1.5px",color:m.role==="user"?C.gold:"rgba(139,26,26,0.8)",textTransform:"uppercase",marginBottom:4}}>{m.role==="user"?"YOU":"ATLAS ACTUAL"}</div>
        <div style={{fontSize:13,color:m.role==="user"?C.text:"#d4c4b0",fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap",paddingLeft:12,borderLeft:`2px solid ${m.role==="user"?C.gold+"40":C.warRed+"60"}`}}>{m.text}</div>
      </div>)}
      {loading&&<div style={{fontSize:11,color:C.warRed,fontFamily:mono,animation:"blink 1s infinite"}}>ATLAS ACTUAL is analyzing...</div>}
      <div ref={endRef}/>
    </div>

    <div style={{display:"flex",gap:10}}>
      <div style={{flex:1}}><Inp placeholder="Describe the situation..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} mono/></div>
      <GoldBtn onClick={send} disabled={loading||!input.trim()}>Send</GoldBtn>
    </div>
    <div style={{fontSize:9,fontFamily:mono,color:C.warRed,opacity:.5,marginTop:8,letterSpacing:"1px"}}>ENCRYPTED — ALL SESSIONS LOGGED — CLASSIFICATION: CONFIDENTIAL</div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: OSINT SEARCH (#1 custom form, #5 formal reports)
// ═══════════════════════════════════════════════════════════════════
function PgOsint({isDemo}){
  const[q,setQ]=useState("");const[t,setT]=useState("email");const[scanning,setScanning]=useState(false);const[report,setReport]=useState(null);const[error,setError]=useState("");
  const doSearch=async()=>{if(!q.trim())return;if(isDemo){setError("OSINT requires an active subscription.");return;}setScanning(true);setReport(null);setError("");
    try{const r=await fetch("/api/gemini/osint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,type:t})});const d=await r.json();
      if(d.error){setError(d.error);}else{setReport(d);}
    }catch(e){setError("Connection failed.");}setScanning(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="OSINT Search" subtitle="Analyst-grade intelligence investigation. Each search produces a formal intelligence report saved to your account."/>
    <TabBar tabs={[["email","Email"],["username","Username"],["domain","Domain"],["phone","Phone"],["ip","IP"],["company","Company"],["person","Person"]]} active={t} onChange={k=>{setT(k);setReport(null);setError("");}}/>
    <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:200}}><Inp mono placeholder={{email:"target@domain.com",username:"target_username",domain:"target-domain.com",phone:"+1234567890",ip:"192.168.1.1",company:"Target Corporation",person:"John Smith"}[t]} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}/></div>
      <GoldBtn onClick={doSearch} disabled={scanning}>{scanning?"Analyzing...":"Initiate Search"}</GoldBtn>
    </div>
    {scanning&&<Loader text="Conducting deep OSINT analysis — this may take 30-60 seconds"/>}
    {error&&<Card style={{padding:20}}><div style={{color:C.critical,fontSize:13}}>{error}</div></Card>}
    {report&&<div style={{animation:"fadeIn 0.4s ease"}}>
      <Card style={{padding:6,marginBottom:2,background:C.gold+"10",borderColor:C.gold+"30"}}><div style={{padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><div><span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold}}>INTELLIGENCE REPORT</span><span style={{fontSize:10,fontFamily:mono,color:C.textDim,marginLeft:12}}>CLASSIFICATION: CONFIDENTIAL</span></div><span style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{new Date(report.timestamp).toLocaleString()}</span></div></Card>
      <Card style={{padding:24}}><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:sans}}>{report.report}</div></Card>
      {report.reportId&&<div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginTop:8}}>Report saved — ID: {report.reportId}</div>}
    </div>}
    {!scanning&&!report&&!error&&<Card style={{padding:48,textAlign:"center"}}><div style={{fontSize:26,fontFamily:serif,fontWeight:300,marginBottom:10,color:C.textSec}}>Ready for Tasking</div><div style={{fontSize:13,color:C.textDim,fontWeight:200,maxWidth:440,margin:"0 auto",lineHeight:1.6}}>Select a target type and enter the identifier. Our analysis engine will produce a comprehensive formal intelligence report.</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: INTEL FEED (#4 — Gemini powered)
// ═══════════════════════════════════════════════════════════════════
function PgIntel(){
  const[sector,setSector]=useState("All Sectors");const[news,setNews]=useState([]);const[loading,setLoading]=useState(false);const[loaded,setLoaded]=useState(false);const[error,setError]=useState("");const[filter,setFilter]=useState("all");
  const fetchNews=async()=>{setLoading(true);setError("");try{const r=await fetch("/api/intel");const data=await r.json();if(Array.isArray(data)&&data.length>0)setNews(data);else setError("Retry in a moment.");}catch(e){setError("Connection failed.");}setLoading(false);setLoaded(true);};
  useEffect(()=>{if(!loaded)fetchNews();},[]);
  const cats=["all","vulnerability","threat-actor","ransomware","nation-state","policy","data-breach","geopolitical"];
  const filtered=news.filter(n=>(sector==="All Sectors"||n.sector===sector)&&(filter==="all"||n.category===filter));
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Intelligence Feed" subtitle="Curated intelligence from verified sources. Updated continuously."/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
      <div><div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>Sector</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{SECTORS.map(s=><button key={s} onClick={()=>setSector(s)} style={{padding:"5px 12px",border:`1px solid ${sector===s?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",fontFamily:sans,background:sector===s?C.goldDim:"transparent",color:sector===s?C.gold:C.textDim,fontWeight:300}}>{s}</button>)}</div></div>
      <GoldBtn small onClick={fetchNews} disabled={loading}>{loading?"Fetching...":"Refresh"}</GoldBtn>
    </div>
    <div style={{display:"flex",gap:5,marginBottom:18,flexWrap:"wrap"}}>{cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"5px 12px",border:`1px solid ${filter===c?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",fontFamily:sans,background:filter===c?C.goldDim:"transparent",color:filter===c?C.gold:C.textDim,textTransform:"capitalize",fontWeight:300}}>{c==="all"?"All":c.replace("-"," ")}</button>)}</div>
    {loading&&<Loader text="Fetching intelligence — up to 30 seconds"/>}
    {error&&!loading&&<Card style={{padding:24,textAlign:"center"}}><div style={{color:C.high,marginBottom:12,fontSize:13}}>{error}</div><GoldBtn small onClick={fetchNews}>Retry</GoldBtn></Card>}
    {!loading&&filtered.map((n,i)=><Card key={i} onClick={()=>n.url&&n.url!=="#"&&window.open(n.url,"_blank")} style={{padding:18,marginBottom:5,cursor:n.url&&n.url!=="#"?"pointer":"default"}}>
      <div style={{display:"flex",gap:8,marginBottom:5,flexWrap:"wrap"}}><Badge severity={n.severity||"info"}/><span style={{fontSize:10,fontFamily:mono,color:C.textDim,textTransform:"uppercase"}}>{(n.category||"").replace("-"," ")}</span></div>
      <div style={{fontSize:14,fontWeight:500,marginBottom:4,lineHeight:1.4}}>{n.title}</div>
      <div style={{fontSize:13,color:C.textSec,fontWeight:200}}>{n.summary}</div>
      <div style={{display:"flex",gap:8,marginTop:8,fontSize:10,color:C.textDim,fontFamily:mono,flexWrap:"wrap"}}><span>{n.source}</span><span>—</span><span>{n.time}</span></div>
    </Card>)}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: DAILY BRIEF (#6 — human-like professional report)
// ═══════════════════════════════════════════════════════════════════
function PgBrief({user}){
  const[brief,setBrief]=useState(null);const[loading,setLoading]=useState(false);
  const generate=async()=>{setLoading(true);
    try{const r=await fetch("/api/gemini/brief",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:{industry:user?.industry,role:user?.role,interests:user?.interests,concerns:user?.concerns}})});const d=await r.json();setBrief(d.brief);}catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Daily Intelligence Brief" subtitle="Your personalized morning brief — prepared by our intelligence team."/>
    {!brief&&!loading&&<Card style={{padding:40,textAlign:"center"}}><div style={{fontSize:22,fontFamily:serif,fontWeight:300,marginBottom:12,color:C.textSec}}>Brief Not Yet Generated</div><p style={{fontSize:13,color:C.textDim,fontWeight:200,marginBottom:20}}>Generate your personalized daily intelligence brief. Content is tailored to your sector and interests.</p><GoldBtn onClick={generate}>Generate Today's Brief</GoldBtn></Card>}
    {loading&&<Loader text="Preparing your intelligence brief"/>}
    {brief&&<Card style={{padding:28}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:4}}>DAILY INTELLIGENCE BRIEF</div><div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:20}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).toUpperCase()} — CLASSIFICATION: CONFIDENTIAL</div><div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{brief}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: BREACH CONSOLE (#8, #9, #10)
// ═══════════════════════════════════════════════════════════════════
function PgBreaches({user,isDemo}){
  const[tab,setTab]=useState("scan");const[email,setEmail]=useState(user?.email||"");const[scanning,setScanning]=useState(false);const[result,setResult]=useState(null);
  // Admin upload state
  const[uploadForm,setUploadForm]=useState({source_name:"",breach_date:"",data_types:"",total_records:"",severity:"high",raw_data:"",emails:""});const[uploading,setUploading]=useState(false);const[uploadResult,setUploadResult]=useState("");
  const isAdmin=user?.email==="atlasalpaytr@gmail.com";

  const scan=async()=>{if(!email.trim()||isDemo)return;setScanning(true);setResult(null);
    try{const r=await fetch("/api/breach-db",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});setResult(await r.json());}catch(e){}setScanning(false);};

  const uploadBreach=async()=>{if(!uploadForm.source_name.trim())return;setUploading(true);setUploadResult("");
    try{const emailList=uploadForm.emails.split("\n").map(e=>e.trim().toLowerCase()).filter(Boolean);
      const r=await fetch("/api/breach-db",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"upload",source_name:uploadForm.source_name,breach_date:uploadForm.breach_date,data_types:uploadForm.data_types,total_records:uploadForm.total_records,severity:uploadForm.severity,raw_data:uploadForm.raw_data,emails:emailList})});
      const d=await r.json();if(d.success)setUploadResult("Breach data uploaded successfully.");else setUploadResult(d.error||"Upload failed.");
    }catch(e){setUploadResult("Upload failed.");}setUploading(false);};

  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Breach Intelligence Console" subtitle="Cross-reference credentials against our database and open-source intelligence."/>
    <TabBar tabs={[["scan","Scan Credentials"],...(isAdmin?[["upload","Upload Breach Data"]]:[])] } active={tab} onChange={setTab}/>

    {tab==="scan"&&<><div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}><div style={{flex:1,minWidth:200}}><Inp mono placeholder="target@domain.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}/></div><GoldBtn onClick={scan} disabled={scanning}>{scanning?"Scanning...":"Scan Breaches"}</GoldBtn></div>
    {scanning&&<Loader text="Cross-referencing breach databases"/>}
    {result?.analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>BREACH IMPACT ASSESSMENT</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{result.analysis}</div>
    {result.localBreaches?.length>0&&<div style={{marginTop:20,padding:16,background:C.criticalDim,borderRadius:3,border:"1px solid rgba(196,92,92,0.2)"}}><div style={{fontSize:10,fontFamily:mono,color:C.critical,marginBottom:8}}>LOCAL DATABASE MATCHES: {result.localBreaches.length}</div>{result.localBreaches.map((b,i)=><div key={i} style={{fontSize:12,color:C.text,marginBottom:4}}>{b.source_name} ({b.breach_date}) — {b.data_types}</div>)}</div>}</Card>}</>}

    {tab==="upload"&&isAdmin&&<Card style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.critical,textTransform:"uppercase",marginBottom:14}}>ADMIN — Upload Breach Data</div>
      <p style={{fontSize:12,color:C.textDim,fontWeight:200,marginBottom:16}}>Upload breach data to the local database. Emails will be indexed for user searches. Only accessible to administrators.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="Source Name *" placeholder="e.g. LinkedIn 2021, Collection #1" value={uploadForm.source_name} onChange={e=>setUploadForm({...uploadForm,source_name:e.target.value})}/>
        <Inp label="Breach Date" placeholder="e.g. 2021-06-22" value={uploadForm.breach_date} onChange={e=>setUploadForm({...uploadForm,breach_date:e.target.value})} mono/>
        <Inp label="Exposed Data Types" placeholder="e.g. email, password, phone, name, address" value={uploadForm.data_types} onChange={e=>setUploadForm({...uploadForm,data_types:e.target.value})}/>
        <Inp label="Total Records" placeholder="e.g. 700M" value={uploadForm.total_records} onChange={e=>setUploadForm({...uploadForm,total_records:e.target.value})} mono/>
        <div><div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>Severity</div>
          <div style={{display:"flex",gap:6}}>{["critical","high","medium","low"].map(s=><button key={s} onClick={()=>setUploadForm({...uploadForm,severity:s})} style={{padding:"5px 12px",border:`1px solid ${uploadForm.severity===s?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",background:uploadForm.severity===s?C.goldDim:"transparent",color:uploadForm.severity===s?C.gold:C.textDim,textTransform:"capitalize"}}>{s}</button>)}</div></div>
        <Inp label="Searchable Emails (one per line)" placeholder={"user1@example.com\nuser2@example.com\n..."} value={uploadForm.emails} onChange={e=>setUploadForm({...uploadForm,emails:e.target.value})} area/>
        <Inp label="Raw Data (optional)" placeholder="Paste raw breach records, CSV data, or notes" value={uploadForm.raw_data} onChange={e=>setUploadForm({...uploadForm,raw_data:e.target.value})} area/>
        <GoldBtn full onClick={uploadBreach} disabled={uploading||!uploadForm.source_name.trim()}>{uploading?"Uploading...":"Upload Breach Data"}</GoldBtn>
        {uploadResult&&<div style={{fontSize:12,fontFamily:mono,color:uploadResult.includes("success")?C.low:C.critical,textAlign:"center"}}>{uploadResult}</div>}
      </div>
    </Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: SOCIAL MEDIA MONITORING (#14)
// ═══════════════════════════════════════════════════════════════════
function PgSocial(){
  const[handles,setHandles]=useState([]);const[newHandle,setNewHandle]=useState("");const[newPlatform,setNewPlatform]=useState("instagram");const[analysis,setAnalysis]=useState(null);const[loading,setLoading]=useState(false);const[analyzing,setAnalyzing]=useState(false);
  useEffect(()=>{fetch("/api/social").then(r=>r.json()).then(d=>{if(Array.isArray(d))setHandles(d);});},[]);
  const addHandle=async()=>{if(!newHandle.trim())return;setLoading(true);await fetch("/api/social",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"add",handles:[{platform:newPlatform,handle:newHandle}]})});setNewHandle("");const r=await fetch("/api/social");setHandles(await r.json());setLoading(false);};
  const analyze=async()=>{setAnalyzing(true);const r=await fetch("/api/social",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"analyze"})});const d=await r.json();setAnalysis(d.analysis);setAnalyzing(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Social Media Monitoring" subtitle="Register your social accounts for continuous security monitoring by our intelligence team."/>
    <Card style={{padding:24,marginBottom:16}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Add Account</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
        {["instagram","twitter","linkedin"].map(p=><button key={p} onClick={()=>setNewPlatform(p)} style={{padding:"6px 14px",border:`1px solid ${newPlatform===p?C.gold:C.border}`,borderRadius:20,fontSize:11,cursor:"pointer",background:newPlatform===p?C.goldDim:"transparent",color:newPlatform===p?C.gold:C.textDim,fontFamily:sans,textTransform:"capitalize"}}>{p}</button>)}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><div style={{flex:1,minWidth:180}}><Inp placeholder="@username or profile URL" value={newHandle} onChange={e=>setNewHandle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addHandle()}/></div><GoldBtn small onClick={addHandle} disabled={loading}>Add</GoldBtn></div>
      <p style={{fontSize:11,color:C.textDim,fontWeight:200,marginTop:10}}>Your accounts are monitored by our intelligence team. We analyze profiles, comments, connections, and identify security vulnerabilities. This information is treated with complete discretion.</p>
    </Card>
    {handles.length>0&&<Card style={{padding:20,marginBottom:16}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>Monitored Accounts ({handles.length})</div>
      {handles.map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:8}}>
        <div><span style={{fontSize:12,fontWeight:400,textTransform:"capitalize"}}>{h.platform}</span><span style={{fontSize:12,color:C.textDim,marginLeft:8}}>{h.handle}</span></div>
        <Badge severity={h.status==="monitoring"?"low":h.status==="flagged"?"critical":"info"} label={h.status}/>
      </div>)}
      <div style={{marginTop:16}}><GoldBtn onClick={analyze} disabled={analyzing}>{analyzing?"Analyzing...":"Run Security Assessment"}</GoldBtn></div>
    </Card>}
    {analyzing&&<Loader text="Conducting social media security assessment"/>}
    {analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>SOCMINT ASSESSMENT</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{analysis}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: REPORTS CENTER (#7 — all reports accessible)
// ═══════════════════════════════════════════════════════════════════
function PgReports(){
  const[reports,setReports]=useState([]);const[loading,setLoading]=useState(true);const[selected,setSelected]=useState(null);const[content,setContent]=useState(null);const[typeFilter,setTypeFilter]=useState("all");
  useEffect(()=>{fetch("/api/reports").then(r=>r.json()).then(d=>{setReports(Array.isArray(d)?d:[]);setLoading(false);});},[]);
  const viewReport=async(id)=>{const r=await fetch("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});const d=await r.json();setContent(d);setSelected(id);};
  const types=["all","osint","daily_brief","breach","social_media","threat_assessment","footprint","executive_protection"];
  const filtered=typeFilter==="all"?reports:reports.filter(r=>r.type===typeFilter);

  if(content)return <div style={{animation:"fadeIn 0.3s ease"}}><div style={{display:"flex",gap:8,marginBottom:20}}><GoldBtn small onClick={()=>{setContent(null);setSelected(null);}}>← Back to Reports</GoldBtn></div>
    <Card style={{padding:6,marginBottom:2,background:C.gold+"10",borderColor:C.gold+"30"}}><div style={{padding:"10px 18px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><span style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px"}}>{content.type?.toUpperCase()?.replace("_"," ")}</span><span style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{content.classification} — {new Date(content.created_at).toLocaleString()}</span></div></Card>
    <Card style={{padding:24}}><h3 style={{fontSize:18,fontFamily:serif,fontWeight:400,marginBottom:16}}>{content.title}</h3><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{content.content}</div></Card></div>;

  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Reports Center" subtitle="Your complete intelligence archive. Every analysis and scan is preserved here."/>
    <div style={{display:"flex",gap:5,marginBottom:20,flexWrap:"wrap"}}>{types.map(t=><button key={t} onClick={()=>setTypeFilter(t)} style={{padding:"5px 12px",border:`1px solid ${typeFilter===t?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",background:typeFilter===t?C.goldDim:"transparent",color:typeFilter===t?C.gold:C.textDim,textTransform:"capitalize"}}>{t==="all"?"All":t.replace("_"," ")}</button>)}</div>
    {loading&&<Loader text="Loading reports"/>}
    {!loading&&filtered.length===0&&<Card style={{padding:40,textAlign:"center"}}><div style={{fontSize:18,fontFamily:serif,color:C.textSec}}>No reports yet</div><p style={{fontSize:12,color:C.textDim,fontWeight:200,marginTop:8}}>Reports are generated when you run OSINT searches, breach scans, and other analyses.</p></Card>}
    {filtered.map((r,i)=><Card key={r.id} onClick={()=>viewReport(r.id)} style={{padding:16,marginBottom:5,cursor:"pointer"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:13,fontWeight:400,marginBottom:2}}>{r.title}</div><div style={{fontSize:10,color:C.textDim,fontFamily:mono}}>{r.type?.replace("_"," ")} — {new Date(r.created_at).toLocaleDateString()}</div></div>
        <Badge severity="info" label={r.classification||"CONFIDENTIAL"}/>
      </div>
    </Card>)}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: SITUATION MAP
// ═══════════════════════════════════════════════════════════════════
function PgMap(){const[sel,setSel]=useState(null);const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Situation Map" subtitle={`${CONFLICTS.length} active conflicts. Data: CFR, ACLED, ICG, ISW, IISS, SIPRI.`}/>
  <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>{[["war","War",C.critical],["insurgency","Insurgency",C.high],["tension","Tension",C.medium],["instability","Instability",C.high]].map(([t,l,c])=><div key={t} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textDim}}><span style={{width:6,height:6,borderRadius:"50%",background:c}}/>{l} ({CONFLICTS.filter(z=>z.type===t).length})</div>)}</div>
  <div className="sg2" style={{display:"grid",gridTemplateColumns:sel?"1fr 300px":"1fr",gap:14,alignItems:"start"}}><div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}><WorldMap zones={CONFLICTS} sel={sel} onSelect={z=>setSel(sel?.id===z.id?null:z)}/></div>
    {sel&&<Card style={{padding:20,animation:"slideIn 0.3s ease"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><Badge severity={sel.sev} label={sel.type}/><button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.textDim,fontSize:10,cursor:"pointer",fontFamily:mono}}>Close</button></div><h3 style={{fontSize:18,fontFamily:serif,fontWeight:400,marginBottom:10}}>{sel.name}</h3><p style={{fontSize:13,color:C.textSec,lineHeight:1.6,fontWeight:200,marginBottom:14}}>{sel.desc}</p>{[["Began",sel.start],["Casualties",sel.cas],["Sources",sel.src]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`,fontSize:12}}><span style={{color:C.textDim}}>{k}</span><span style={{fontFamily:mono,fontSize:11}}>{v}</span></div>)}</Card>}</div>
  <div style={{marginTop:14,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:5}}>{CONFLICTS.map(z=><Card key={z.id} onClick={()=>setSel(z)} highlight={sel?.id===z.id} style={{padding:"9px 12px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:5,height:5,borderRadius:"50%",background:tc[z.type]}}/><span style={{fontSize:11}}>{z.name}</span></div><Badge severity={z.sev}/></div></Card>)}</div>
</div>;}

// ═══════════════════════════════════════════════════════════════════
// PAGE: GENERIC ANALYSIS (#1 — each with custom form)
// ═══════════════════════════════════════════════════════════════════
function PgAnalysis({module,title,subtitle,fields,apiRoute,bodyKey,extraBody}){
  const[form,setForm]=useState({});const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);
  const submit=async()=>{const q=form.query||form.target||form.subject||"";if(!q.trim())return;setLoading(true);setResult(null);
    try{
      const route=apiRoute||"/api/gemini/analyze";
      const body=apiRoute?{[bodyKey||"query"]:q+(form.context?`\nContext: ${form.context}`:""),...(extraBody||{}),additionalData:form.context||"",context:form.context||"",assets:form.context||"",entityType:form.type||"entity",queryType:form.type||"entity"}:{query:q+(form.context?`\n\nAdditional context: ${form.context}`:""),type:form.type||"general",module};
      const r=await fetch(route,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();setResult(d);
    }catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title={title} subtitle={subtitle}/>
    <Card style={{padding:24,marginBottom:16,maxWidth:600}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(fields||[]).map((f,i)=><Inp key={i} label={f.label} placeholder={f.placeholder} value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} area={f.area} mono={f.mono}/>)}
        <GoldBtn full onClick={submit} disabled={loading}>{loading?"Analyzing...":"Submit for Analysis"}</GoldBtn>
      </div>
    </Card>
    {loading&&<Loader text="Conducting deep analysis — 30-60 seconds"/>}
    {result?.analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>{title.toUpperCase()} REPORT</div><div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:16}}>CLASSIFICATION: CONFIDENTIAL — {new Date().toLocaleString()}</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result.analysis}</div></Card>}
    {result?.error&&<Card style={{padding:20}}><div style={{color:C.critical,fontSize:13}}>{result.error}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: SETTINGS (#10 — full account mgmt, #11 profile, #3 routine)
// ═══════════════════════════════════════════════════════════════════
function PgSettings({user,isDemo,setPage}){
  const[tab,setTab]=useState("account");const[delConfirm,setDelConfirm]=useState(false);
  const[profile,setProfile]=useState({linkedin:"",twitter:"",instagram:"",company:"",role:"",industry:"",interests:"",concerns:""});const[saved,setSaved]=useState(false);
  const[routine,setRoutine]=useState({wake:"",commute:"",work_start:"",work_end:"",devices:"",networks:"",travel:"",public_exposure:""});const[routineSaved,setRoutineSaved]=useState(false);
  const action=async(a)=>{if(isDemo)return;if(a==="delete"&&!delConfirm){setDelConfirm(true);return;}
    await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:`[Spy Account] ${a}`,email:user?.email,action:a,timestamp:new Date().toISOString()})});
    alert(`Your ${a} request has been submitted. Our team will process it within 24 hours.`);setDelConfirm(false);};
  const saveProfile=async()=>{if(isDemo)return;await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"[Spy Profile] Update",email:user?.email,...profile})});setSaved(true);setTimeout(()=>setSaved(false),3000);};
  const saveRoutine=async()=>{if(isDemo)return;await fetch(`https://formspree.io/f/${FORMSPREE}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"[Spy Routine] Pattern of Life",email:user?.email,...routine})});setRoutineSaved(true);setTimeout(()=>setRoutineSaved(false),3000);};

  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Settings" subtitle="Manage your account, subscription, and intelligence profile."/>
    <TabBar tabs={[["account","Account"],["subscription","Subscription"],["profile","Intelligence Profile"],["routine","Daily Routine"]]} active={tab} onChange={setTab}/>

    {tab==="account"&&<><Card style={{padding:24,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16,flexWrap:"wrap"}}><div style={{width:48,height:48,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:C.goldDim,border:"1px solid rgba(196,162,101,0.2)"}}><span style={{fontSize:18,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</span></div><div><div style={{fontSize:15,fontWeight:500}}>{user?.name||"Operator"}</div><div style={{fontSize:11,color:C.textDim,fontFamily:mono}}>{user?.email}</div><div style={{fontSize:10,color:C.gold,fontFamily:mono,marginTop:2}}>{(user?.tier||"observer").toUpperCase()}</div></div></div>
      {[["Timezone","UTC+3 (Istanbul)"],["Language","English"],["Sector","All Sectors"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:`1px solid ${C.border}`,fontSize:12,flexWrap:"wrap"}}><span style={{color:C.textDim}}>{k}</span><span>{v}</span></div>)}</Card>
    <Card style={{padding:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Account Actions</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}><div><div style={{fontSize:12}}>Hibernate Account</div><div style={{fontSize:10,color:C.textDim}}>Pause temporarily. Data preserved.</div></div><GoldBtn small onClick={()=>action("hibernate")}>Hibernate</GoldBtn></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}><div><div style={{fontSize:12}}>Request Invoice</div><div style={{fontSize:10,color:C.textDim}}>Detailed invoice for records.</div></div><GoldBtn small onClick={()=>action("invoice")}>Request</GoldBtn></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",flexWrap:"wrap",gap:8}}><div><div style={{fontSize:12,color:C.critical}}>Delete Account</div><div style={{fontSize:10,color:C.textDim}}>Permanently remove all data.</div></div>
          {delConfirm?<div style={{display:"flex",gap:6}}><GoldBtn small danger onClick={()=>action("delete")}>CONFIRM</GoldBtn><GoldBtn small onClick={()=>setDelConfirm(false)}>Cancel</GoldBtn></div>:<GoldBtn small danger onClick={()=>action("delete")}>Delete</GoldBtn>}</div>
      </div></Card></>}

    {tab==="subscription"&&<Card style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Subscription</div>
      <div style={{padding:"14px 0",borderBottom:`1px solid ${C.border}`,marginBottom:16}}><div style={{fontSize:13}}>Current: <span style={{color:C.gold}}>{(user?.tier||"Observer").charAt(0).toUpperCase()+(user?.tier||"observer").slice(1)}</span></div></div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}><GoldBtn full onClick={()=>setPage("membership")}>Upgrade Plan</GoldBtn><GoldBtn full small onClick={()=>action("cancel_subscription")}>Cancel Subscription</GoldBtn><GoldBtn full small onClick={()=>action("invoice")}>Request Invoice</GoldBtn></div>
    </Card>}

    {tab==="profile"&&<Card style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>Intelligence Profile</div>
      <p style={{fontSize:12,color:C.textSec,fontWeight:200,lineHeight:1.6,marginBottom:6}}>This information helps our team provide targeted intelligence. <strong style={{color:C.gold,fontWeight:400}}>Everything is treated with absolute discretion.</strong></p>
      <p style={{fontSize:11,color:C.textDim,fontWeight:200,marginBottom:16}}>Sharing is optional. We deliver valuable intelligence without it.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="LinkedIn" placeholder="https://linkedin.com/in/..." value={profile.linkedin} onChange={e=>setProfile({...profile,linkedin:e.target.value})}/>
        <Inp label="X / Twitter" placeholder="@handle" value={profile.twitter} onChange={e=>setProfile({...profile,twitter:e.target.value})}/>
        <Inp label="Instagram" placeholder="@handle" value={profile.instagram} onChange={e=>setProfile({...profile,instagram:e.target.value})}/>
        <Inp label="Company" placeholder="Organization" value={profile.company} onChange={e=>setProfile({...profile,company:e.target.value})}/>
        <Inp label="Role" placeholder="Your position" value={profile.role} onChange={e=>setProfile({...profile,role:e.target.value})}/>
        <Inp label="Industry" placeholder="e.g. Finance, Tech, Legal" value={profile.industry} onChange={e=>setProfile({...profile,industry:e.target.value})}/>
        <Inp label="Interests" placeholder="Geopolitical risk, competitor intel, digital protection..." value={profile.interests} onChange={e=>setProfile({...profile,interests:e.target.value})} area/>
        <Inp label="Primary Concerns" placeholder="What keeps you up at night?" value={profile.concerns} onChange={e=>setProfile({...profile,concerns:e.target.value})} area/>
        <GoldBtn full onClick={saveProfile}>Save Profile</GoldBtn>
        {saved&&<div style={{fontSize:11,color:C.low,fontFamily:mono,textAlign:"center"}}>Saved securely.</div>}
      </div></Card>}

    {tab==="routine"&&<Card style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>Daily Routine — Pattern of Life (#3)</div>
      <p style={{fontSize:12,color:C.textSec,fontWeight:200,lineHeight:1.6,marginBottom:16}}>Detailed routine data enables precise threat prediction. Our system models your pattern of life to identify anomalies and preempt risks. All data is encrypted and accessible only to your assigned intelligence team.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="Typical Wake Time" placeholder="e.g. 06:30 — where, routine activities" value={routine.wake} onChange={e=>setRoutine({...routine,wake:e.target.value})}/>
        <Inp label="Commute Details" placeholder="Method, route, timing, usual stops" value={routine.commute} onChange={e=>setRoutine({...routine,commute:e.target.value})} area/>
        <Inp label="Work Hours & Location" placeholder="Start/end times, office/remote, meeting patterns" value={routine.work_start} onChange={e=>setRoutine({...routine,work_start:e.target.value})} area/>
        <Inp label="Devices & Networks" placeholder="Devices used, networks connected to, VPN usage, cloud services" value={routine.devices} onChange={e=>setRoutine({...routine,devices:e.target.value})} area/>
        <Inp label="Travel Patterns" placeholder="Frequency, destinations, booking methods, loyalty programs" value={routine.travel} onChange={e=>setRoutine({...routine,travel:e.target.value})} area/>
        <Inp label="Public Exposure" placeholder="Speaking engagements, social events, public appearances, media" value={routine.public_exposure} onChange={e=>setRoutine({...routine,public_exposure:e.target.value})} area/>
        <GoldBtn full onClick={saveRoutine}>Save Routine Data</GoldBtn>
        {routineSaved&&<div style={{fontSize:11,color:C.low,fontFamily:mono,textAlign:"center"}}>Pattern of life data saved securely.</div>}
      </div></Card>}
  </div>;
}

// ── DECOY (kept from previous) ───────────────────────────────────────
function PgDecoy(){const canvasRef=useRef(null);const[file,setFile]=useState(null);const[preview,setPreview]=useState(null);const[payload,setPayload]=useState("");const[encoded,setEncoded]=useState(null);const[status,setStatus]=useState("");const[ext,setExt]=useState("");
  const handleFile=e=>{const f=e.target.files?.[0];if(!f)return;setFile(f);setEncoded(null);setStatus("");setExt("");const r=new FileReader();r.onload=ev=>setPreview(ev.target.result);r.readAsDataURL(f);};
  const embed=()=>{if(!preview||!payload.trim())return;const img=new Image();img.onload=()=>{const cv=canvasRef.current;cv.width=img.width;cv.height=img.height;const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);const id=ctx.getImageData(0,0,cv.width,cv.height);const d=id.data;const msg=payload+"\0";const bits=[];for(let i=0;i<32;i++)bits.push((msg.length>>i)&1);for(let i=0;i<msg.length;i++)for(let b=0;b<8;b++)bits.push((msg.charCodeAt(i)>>b)&1);for(let i=0;i<bits.length&&i*4<d.length;i++)d[i*4]=(d[i*4]&0xFE)|bits[i];ctx.putImageData(id,0,0);setEncoded(cv.toDataURL("image/png"));setStatus(`${payload.length} chars embedded.`);};img.src=preview;};
  const extract=()=>{if(!encoded)return;const img=new Image();img.onload=()=>{const cv=document.createElement("canvas");cv.width=img.width;cv.height=img.height;const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,cv.width,cv.height).data;let len=0;for(let i=0;i<32;i++)len|=(d[i*4]&1)<<i;if(len<=0||len>10000){setExt("No payload.");return;}let m="";for(let i=0;i<len-1;i++){let ch=0;for(let b=0;b<8;b++)ch|=(d[(32+i*8+b)*4]&1)<<b;m+=String.fromCharCode(ch);}setExt(m);};img.src=encoded;};
  const dl=async()=>{if(!encoded)return;try{const b=await(await fetch(encoded)).blob();const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="spy-"+Date.now()+".png";document.body.appendChild(a);a.click();document.body.removeChild(a);}catch(e){}};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Decoy Deployment" subtitle="LSB steganographic tracking — intelligence engineering."/>
    <div className="sg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{padding:20}}><div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:14}}>1. Upload & Embed</div>
        <label style={{display:"block",padding:24,border:`1px dashed ${C.border}`,borderRadius:4,textAlign:"center",cursor:"pointer"}}><input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/><span style={{fontSize:12,color:C.textSec}}>{file?file.name:"Select image"}</span></label>
        {preview&&<img src={preview} style={{width:"100%",maxHeight:160,objectFit:"contain",marginTop:10,borderRadius:4,border:`1px solid ${C.border}`}}/>}
        <div style={{marginTop:12}}><Inp mono placeholder="DOC-2026-CONFIDENTIAL-ACME" value={payload} onChange={e=>setPayload(e.target.value)} label="Payload"/></div>
        <div style={{marginTop:12}}><GoldBtn full onClick={embed} disabled={!preview||!payload.trim()}>Embed</GoldBtn></div></Card>
      <Card style={{padding:20}}><div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:14}}>2. Result</div>
        <canvas ref={canvasRef} style={{display:"none"}}/>
        {encoded?<><img src={encoded} style={{width:"100%",maxHeight:160,objectFit:"contain",borderRadius:4,border:`1px solid ${C.gold}`,marginBottom:10}}/><div style={{fontSize:11,color:C.low,fontFamily:mono,marginBottom:8}}>{status}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><GoldBtn onClick={dl}>Download</GoldBtn><GoldBtn small onClick={extract}>Verify</GoldBtn></div>{ext&&<div style={{marginTop:10,padding:"8px 12px",background:C.bgInput,borderRadius:3,border:`1px solid ${C.border}`}}><div style={{fontSize:10,fontFamily:mono,color:C.gold}}>EXTRACTED:</div><div style={{fontSize:11,fontFamily:mono,color:C.text,wordBreak:"break-all"}}>{ext}</div></div>}</>:<div style={{padding:32,textAlign:"center",border:`1px dashed ${C.border}`,borderRadius:4}}><span style={{fontSize:13,color:C.textSec,fontWeight:200}}>Result appears here</span></div>}</Card>
    </div></div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: IMAGE SECURITY SCAN (#10, #11)
// ═══════════════════════════════════════════════════════════════════
function PgImageScan({user}){
  const[file,setFile]=useState(null);const[scanning,setScanning]=useState(false);const[analysis,setAnalysis]=useState(null);const[preview,setPreview]=useState(null);
  const handleFile=e=>{const f=e.target.files?.[0];if(!f)return;setFile(f);setAnalysis(null);if(f.type.startsWith("image/")){const r=new FileReader();r.onload=ev=>setPreview(ev.target.result);r.readAsDataURL(f);}else{setPreview(null);}};
  const scanFile=async()=>{if(!file)return;setScanning(true);
    try{const r=await fetch("/api/admin/image-scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:file.name,filesize:`${(file.size/1024).toFixed(1)} KB`,dimensions:preview?"Detected from upload":"Unknown",userEmail:user?.email})});
      const d=await r.json();setAnalysis(d.analysis);
    }catch(e){setAnalysis("Scan failed. Please retry.");}setScanning(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Image Security Scan" subtitle="Upload any image for a comprehensive security analysis. Our system examines metadata, steganographic content, geolocation data, and potential threats."/>
    <div className="sg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{padding:24}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Upload Image</div>
        <label style={{display:"block",padding:28,border:`1px dashed ${C.border}`,borderRadius:4,textAlign:"center",cursor:"pointer"}}><input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/><span style={{fontSize:12,color:C.textSec,fontWeight:200}}>{file?file.name:"Click to select an image"}</span>{file&&<div style={{fontSize:10,color:C.textDim,fontFamily:mono,marginTop:4}}>{(file.size/1024).toFixed(1)} KB — {file.type}</div>}</label>
        {preview&&<img src={preview} style={{width:"100%",maxHeight:200,objectFit:"contain",marginTop:12,borderRadius:4,border:`1px solid ${C.border}`}}/>}
        <div style={{marginTop:16}}><GoldBtn full onClick={scanFile} disabled={!file||scanning}>{scanning?"Scanning...":"Run Security Scan"}</GoldBtn></div>
        <p style={{fontSize:10,color:C.textDim,fontWeight:200,marginTop:10,lineHeight:1.5}}>Your image is analyzed by our forensics team. The administrator is notified of all uploads for quality assurance.</p>
      </Card>
      <div>
        {scanning&&<Loader text="Conducting forensic image analysis"/>}
        {analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>IMAGE FORENSICS REPORT</div>
          <div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:16}}>File: {file?.name} — {new Date().toLocaleString()}</div>
          <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{analysis}</div>
        </Card>}
        {!scanning&&!analysis&&<Card style={{padding:40,textAlign:"center"}}><div style={{fontSize:18,fontFamily:serif,color:C.textSec,fontWeight:300,marginBottom:8}}>No File Scanned</div><p style={{fontSize:12,color:C.textDim,fontWeight:200}}>Upload an image to receive a step-by-step forensic security analysis covering EXIF metadata, steganography detection, reverse image search, malware scanning, and geolocation extraction.</p></Card>}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: COMPETITIVE INTELLIGENCE (#18)
// ═══════════════════════════════════════════════════════════════════
function PgCapabilities(){
  const caps=[
    {cat:"Investigation",items:[
      {t:"OSINT Search",d:"Formal intelligence reports on emails, usernames, domains, IPs, companies, and individuals. Each search produces a classified-style dossier."},
      {t:"Link Analysis & Entity Mapping",d:"Map relationships between people, organizations, domains, and digital identities. Visual network analysis with connection strength indicators."},
      {t:"Identity Verification",d:"Cross-reference identities against public records, corporate registries, professional credentials, and social media for authenticity scoring."},
      {t:"Fraud Detection",d:"Risk assessment covering financial fraud, identity fraud, BEC indicators, synthetic identity markers, and impersonation detection."},
      {t:"Evidence Chain Management",d:"Forensic-grade documentation workflows with chain of custody templates, legal compliance guidance, and digital evidence preservation protocols."},
    ]},
    {cat:"Monitoring",items:[
      {t:"Dark Web Intelligence",d:"Monitoring underground forums, credential marketplaces, ransomware group communications, paste sites, and encrypted channel mentions."},
      {t:"Breach Database Console",d:"Cross-reference credentials against our managed breach database plus AI-powered impact assessment. Admin upload capability for proprietary breach data."},
      {t:"Social Media Monitoring",d:"Continuous security assessment of Instagram, Twitter/X, and LinkedIn accounts. Privacy exposure, impersonation risks, and social engineering vectors."},
      {t:"Digital Footprint Analysis",d:"Complete exposure audit across data brokers, public records, web mentions, and social platforms with exposure scoring."},
      {t:"Image Security Forensics",d:"EXIF metadata extraction, steganography detection, reverse image search, malware scanning, and geolocation data analysis."},
    ]},
    {cat:"Threat Intelligence",items:[
      {t:"Geospatial Intelligence (GEOINT)",d:"Location-based threat assessment covering physical security, infrastructure vulnerabilities, civil unrest risk, and safe haven identification."},
      {t:"Predictive Threat Forecasting",d:"30/60/90-day threat horizon analysis with confidence levels, impact ratings, and preemptive action recommendations by sector."},
      {t:"War Room — AI Intelligence Analyst",d:"1-on-1 with a senior AI intelligence analyst. Real-time threat assessment, operational guidance, session persistence, and resolution tracking."},
      {t:"Intelligence Feed",d:"Live curated intelligence from verified sources. Sector filtering, category classification, severity ratings."},
      {t:"Situation Map",d:"20+ active conflict zones tracked with data from CFR, ACLED, ICG, ISW, IISS, and SIPRI."},
    ]},
    {cat:"Protection",items:[
      {t:"Executive Protection",d:"Comprehensive exposure assessments for high-value individuals covering digital, physical, and reputational attack surfaces."},
      {t:"Decoy Deployment (Steganography)",d:"LSB steganographic tracking payloads embedded in images. Trace unauthorized file sharing to the source."},
      {t:"Document Intelligence",d:"Fuzzy-hash leak detection for edited, translated, or obfuscated documents. Metadata analysis and classification."},
      {t:"Data Suppression",d:"Automated takedown strategy and SEO burial analysis for unwanted content."},
      {t:"Case Management",d:"Formal case analysis with evidence tracking, investigative step planning, resource allocation, and resolution timelines."},
    ]},
    {cat:"Reporting & Access",items:[
      {t:"Daily Intelligence Brief",d:"Personalized morning briefs written in professional intelligence language — not AI summaries, intelligence products tailored to your sector."},
      {t:"Reports Archive",d:"Every analysis auto-saves as a formal classified report. Full archive with type filtering and instant access."},
      {t:"Insider Threat Assessment (CPIR)",d:"Continuous Psychological Indicator Report with behavioral analysis, risk scoring, and manager analytics."},
      {t:"24/7 Multilingual Support",d:"English, Turkish, German, French, Spanish, Arabic, Russian, Mandarin."},
    ]},
  ];
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Platform Capabilities" subtitle="Full-spectrum intelligence at a fraction of enterprise pricing. Every capability below is operational and accessible from your dashboard."/>
    <Card style={{padding:20,marginBottom:20,borderColor:C.gold+"30"}}><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Spy by Atlas consolidates capabilities that enterprise platforms charge $10,000-100,000+/year for — into a single, AI-powered platform starting at $49/month. Designed and operated by intelligence professionals. No technical expertise required.</div></Card>
    {caps.map((cat,ci)=><div key={ci} style={{marginBottom:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>{cat.cat}</div>
      <div className="sg2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {cat.items.map((item,i)=><Card key={i} style={{padding:18}}><div style={{fontSize:12,fontWeight:400,marginBottom:4}}>{item.t}</div><div style={{fontSize:11,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{item.d}</div></Card>)}
      </div>
    </div>)}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// PAYWALL (#1 — hard gate for observers)
// ═══════════════════════════════════════════════════════════════════
function Paywall({setPage}){return <div style={{animation:"fadeIn 0.4s ease"}}><Card style={{padding:48,maxWidth:480,margin:"40px auto",textAlign:"center"}}>
  <div style={{fontSize:28,fontFamily:serif,fontWeight:300,color:C.gold,marginBottom:12}}>Premium Intelligence</div>
  <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:8}}>This module requires an active subscription.</p>
  <p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6,marginBottom:28}}>Start your 7-day free trial to unlock all intelligence capabilities. Full access, no limitations. Cancel anytime.</p>
  <GoldBtn full onClick={()=>setPage("membership")}>View Plans & Start Trial</GoldBtn>
</Card></div>;}

// ═══════════════════════════════════════════════════════════════════
// IP SCAN WIDGET (#4)
// ═══════════════════════════════════════════════════════════════════
function IPScanWidget(){
  const[data,setData]=useState(null);const[loading,setLoading]=useState(false);
  const scan=async()=>{setLoading(true);try{
    const ipR=await fetch("https://api.ipify.org?format=json");const{ip}=await ipR.json();
    const r=await fetch("/api/ip-scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ip})});
    setData(await r.json());}catch(e){setData({error:"Scan failed"});}setLoading(false);};
  useEffect(()=>{scan();},[]);
  if(loading)return <Card style={{padding:16}}><div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase"}}>SCANNING CONNECTION...</div></Card>;
  if(!data||data.error)return <Card style={{padding:16}}><div style={{fontSize:10,fontFamily:mono,color:C.textDim}}>Connection scan unavailable</div></Card>;
  const isSafe=!data.isProxy&&data.threatAssessment?.includes("SAFE");
  return <Card style={{padding:16,borderColor:isSafe?"rgba(107,158,122,0.3)":"rgba(196,92,92,0.3)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
      <div><div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Connection Status</div>
        <div style={{fontSize:13,fontFamily:mono}}>{data.ip}</div>
        <div style={{fontSize:11,color:C.textDim,fontWeight:200}}>{data.city}, {data.country} — {data.isp}</div></div>
      <Badge severity={isSafe?"low":"high"} label={isSafe?"SECURE":"REVIEW"}/>
    </div>
    {data.threatAssessment&&<div style={{fontSize:11,color:C.textSec,fontWeight:200,marginTop:8,lineHeight:1.5}}>{data.threatAssessment}</div>}
  </Card>;
}

// ═══════════════════════════════════════════════════════════════════
// TRAVEL SECURITY (#8)
// ═══════════════════════════════════════════════════════════════════
function PgTravel(){
  const[form,setForm]=useState({destination:"",flight:"",hotel:"",dates:"",purpose:""});const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);
  const submit=async()=>{if(!form.destination.trim())return;setLoading(true);setResult(null);
    try{const r=await fetch("/api/gemini/travel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});setResult(await r.json());}catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Travel Security" subtitle="Pre-travel intelligence briefings. Cross-references kinetic threats, cyber risks, and geopolitical data."/>
    <Card style={{padding:24,maxWidth:600,marginBottom:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="Destination *" placeholder="City, Country" value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})}/>
        <Inp label="Flight Details" placeholder="Airline, flight number, date" value={form.flight} onChange={e=>setForm({...form,flight:e.target.value})}/>
        <Inp label="Hotel" placeholder="Hotel name and address" value={form.hotel} onChange={e=>setForm({...form,hotel:e.target.value})}/>
        <Inp label="Travel Dates" placeholder="e.g. 15 May — 22 May 2026" value={form.dates} onChange={e=>setForm({...form,dates:e.target.value})}/>
        <Inp label="Purpose" placeholder="Business / Personal / Diplomatic" value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/>
        <GoldBtn full onClick={submit} disabled={loading}>{loading?"Generating Dossier...":"Generate Travel Brief"}</GoldBtn>
      </div></Card>
    {loading&&<Loader text="Compiling travel security dossier — 30-60 seconds"/>}
    {result?.analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>PRE-TRAVEL SECURITY DOSSIER</div><div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:16}}>CLASSIFICATION: CONFIDENTIAL — {new Date().toLocaleString()}</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result.analysis}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// SUPPLY CHAIN (#7)
// ═══════════════════════════════════════════════════════════════════
function PgSupplyChain(){
  const[domain,setDomain]=useState("");const[name,setName]=useState("");const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);
  const scan=async()=>{if(!domain.trim())return;setLoading(true);setResult(null);
    try{const r=await fetch("/api/gemini/supply-chain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vendorDomain:domain,vendorName:name})});setResult(await r.json());}catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Supply Chain Intel" subtitle="Third-party threat mapping. Scan vendor domains for exposed ports, vulnerabilities, and dark web activity."/>
    <Card style={{padding:24,maxWidth:600,marginBottom:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="Vendor Domain *" placeholder="vendor-company.com" value={domain} onChange={e=>setDomain(e.target.value)} mono/>
        <Inp label="Vendor Name" placeholder="Vendor Company Inc." value={name} onChange={e=>setName(e.target.value)}/>
        <GoldBtn full onClick={scan} disabled={loading}>{loading?"Scanning...":"Scan Vendor"}</GoldBtn>
      </div></Card>
    {loading&&<Loader text="Conducting vendor risk assessment"/>}
    {result?.analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>VENDOR RISK ASSESSMENT</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result.analysis}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// FAMILY MODULE (#5)
// ═══════════════════════════════════════════════════════════════════
function PgFamily(){
  const[childName,setChildName]=useState("");const[handles,setHandles]=useState([{platform:"instagram",handle:""}]);const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);
  const addHandle=()=>setHandles([...handles,{platform:"instagram",handle:""}]);
  const assess=async()=>{if(!childName.trim())return;setLoading(true);setResult(null);
    try{const r=await fetch("/api/gemini/family",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({childName,handles:handles.filter(h=>h.handle.trim())})});setResult(await r.json());}catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Family Protection" subtitle="Child safety monitoring. NLP sentiment analysis detects cyberbullying, predatory language, and toxic interactions."/>
    <Card style={{padding:24,maxWidth:600,marginBottom:16}}>
      <Inp label="Child's Name" placeholder="First name" value={childName} onChange={e=>setChildName(e.target.value)}/>
      <div style={{marginTop:16,fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>Social Accounts</div>
      {handles.map((h,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4}}>{["instagram","twitter","tiktok"].map(p=><button key={p} onClick={()=>{const n=[...handles];n[i].platform=p;setHandles(n);}} style={{padding:"4px 10px",border:`1px solid ${h.platform===p?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",background:h.platform===p?C.goldDim:"transparent",color:h.platform===p?C.gold:C.textDim,textTransform:"capitalize"}}>{p}</button>)}</div>
        <div style={{flex:1,minWidth:150}}><Inp placeholder="@username" value={h.handle} onChange={e=>{const n=[...handles];n[i].handle=e.target.value;setHandles(n);}}/></div>
      </div>)}
      <button onClick={addHandle} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer",fontFamily:mono,marginBottom:16}}>+ Add Another Account</button>
      <GoldBtn full onClick={assess} disabled={loading}>{loading?"Analyzing...":"Run Safety Assessment"}</GoldBtn>
      <p style={{fontSize:10,color:C.textDim,fontWeight:200,marginTop:10}}>We analyze public-facing content only. No private messages are accessed or stored. Parents receive alert levels, not message contents.</p>
    </Card>
    {loading&&<Loader text="Conducting child safety assessment"/>}
    {result?.analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>CHILD SAFETY ASSESSMENT</div><div style={{fontSize:10,fontFamily:mono,color:C.critical,marginBottom:16}}>CLASSIFICATION: RESTRICTED — PARENT ACCESS ONLY</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result.analysis}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// MAKE ME INVISIBLE (#6)
// ═══════════════════════════════════════════════════════════════════
function PgInvisible(){
  const[name,setName]=useState("");const[email,setEmail]=useState("");const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);
  const go=async()=>{if(!name.trim())return;setLoading(true);setResult(null);
    try{const r=await fetch("/api/gemini/suppression",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,action:"mass_optout"})});setResult(await r.json());}catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Data Suppression" subtitle="Remove your presence from data brokers, people search engines, and public databases."/>
    <Card style={{padding:32,maxWidth:560,textAlign:"center",marginBottom:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Absolute Suppression</div>
      <Inp label="Full Legal Name" placeholder="John Michael Smith" value={name} onChange={e=>setName(e.target.value)}/>
      <div style={{marginTop:12}}><Inp label="Primary Email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} mono/></div>
      <div style={{marginTop:24}}>
        <button onClick={go} disabled={loading} style={{width:"100%",padding:"20px 32px",border:`2px solid ${C.gold}`,borderRadius:4,background:C.goldDim,color:C.gold,fontSize:14,fontFamily:serif,fontWeight:400,letterSpacing:"1px",cursor:loading?"default":"pointer",transition:"all 0.3s",opacity:loading?.5:1}}>{loading?"Processing suppression...":"MAKE ME INVISIBLE"}</button>
      </div>
      <p style={{fontSize:10,color:C.textDim,fontWeight:200,marginTop:14,lineHeight:1.5}}>Generates automated opt-out requests for 15+ data brokers including Whitepages, Spokeo, Experian, BeenVerified, Radaris, and more. Includes GDPR and CCPA deletion request templates.</p>
    </Card>
    {loading&&<Loader text="Generating suppression requests across 15+ brokers"/>}
    {result?.guide&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>SUPPRESSION PLAYBOOK</div><div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:6}}>Brokers targeted: {result.brokers?.length || 15}</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result.guide}</div></Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// HONEYTOKENS / DECEPTION (#12)
// ═══════════════════════════════════════════════════════════════════
function PgHoneytokens(){
  const[tab,setTab]=useState("generate");const[docName,setDocName]=useState("");const[recipients,setRecipients]=useState("");const[tokenType,setTokenType]=useState("document");
  const[tokens,setTokens]=useState([]);const[allTokens,setAllTokens]=useState([]);const[loading,setLoading]=useState(false);
  const generate=async()=>{if(!docName.trim()||!recipients.trim())return;setLoading(true);
    const r=await fetch("/api/gemini/honeytokens",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"generate",documentName:docName,recipients:recipients.split("\n").filter(r=>r.trim()),tokenType})});
    const d=await r.json();setTokens(d.tokens||[]);setLoading(false);};
  const loadAll=async()=>{try{const r=await fetch("/api/gemini/honeytokens",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"list"})});const d=await r.json();setAllTokens(Array.isArray(d)?d:[]);}catch(e){setAllTokens([]);}};
  useEffect(()=>{loadAll();},[]);
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Deception Technology" subtitle="Generate honey-tokens — trackable fake documents and credentials. If leaked, trace the exact source instantly."/>
    <TabBar tabs={[["generate","Generate Tokens"],["monitor","Monitor Tokens"]]} active={tab} onChange={setTab}/>
    {tab==="generate"&&<Card style={{padding:24,maxWidth:600}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="Document / Asset Name" placeholder="Q4 Strategy Report, API Key, Client List" value={docName} onChange={e=>setDocName(e.target.value)}/>
        <div><div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>Token Type</div>
          <div style={{display:"flex",gap:6}}>{["document","credential","url","canary"].map(t=><button key={t} onClick={()=>setTokenType(t)} style={{padding:"5px 12px",border:`1px solid ${tokenType===t?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",background:tokenType===t?C.goldDim:"transparent",color:tokenType===t?C.gold:C.textDim,textTransform:"capitalize"}}>{t}</button>)}</div></div>
        <Inp label="Recipients (one per line)" placeholder={"John Smith — Board Member\nJane Doe — CFO\nVendor Corp — Subcontractor"} value={recipients} onChange={e=>setRecipients(e.target.value)} area/>
        <GoldBtn full onClick={generate} disabled={loading}>{loading?"Generating...":"Generate Honey-Tokens"}</GoldBtn>
      </div>
      {tokens.length>0&&<div style={{marginTop:20}}><div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:10}}>Generated Tokens</div>
        {tokens.map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:12}}>{t.recipient}</span>
          <span style={{fontFamily:mono,fontSize:10,color:C.gold,padding:"4px 10px",background:C.goldDim,borderRadius:3}}>{t.token_id}</span>
        </div>)}
        <p style={{fontSize:10,color:C.textDim,fontWeight:200,marginTop:10}}>Embed each token into the recipient's copy. If the document surfaces on dark web or unauthorized channels, the token identifies the leak source.</p>
      </div>}
    </Card>}
    {tab==="monitor"&&<Card style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase"}}>Active Tokens ({allTokens.length})</span><GoldBtn small onClick={loadAll}>Refresh</GoldBtn></div>
      {allTokens.length===0&&<div style={{fontSize:12,color:C.textDim,fontWeight:200}}>No tokens generated yet.</div>}
      {allTokens.map((t,i)=><div key={t.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:12}}>{t.document_name} → {t.recipient}</div><div style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{t.token_id} — {t.token_type}</div></div>
        <Badge severity={t.triggered?"critical":"low"} label={t.triggered?"TRIGGERED":"CLEAN"}/>
      </div>)}
    </Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// SEAT MANAGEMENT (#3)
// ═══════════════════════════════════════════════════════════════════
function PgSeats(){
  const[seats,setSeats]=useState([]);const[newEmail,setNewEmail]=useState("");const[newRole,setNewRole]=useState("member");const[loading,setLoading]=useState(false);
  const load=async()=>{const r=await fetch("/api/seats");setSeats(await r.json());};
  useEffect(()=>{load();},[]);
  const invite=async()=>{if(!newEmail.trim())return;setLoading(true);
    await fetch("/api/seats",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"invite",email:newEmail,role:newRole})});
    setNewEmail("");load();setLoading(false);};
  const remove=async(email)=>{await fetch("/api/seats",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"remove",email})});load();};
  const activeSeats=seats.filter(s=>s.status!=="removed");
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Team Seats" subtitle="Manage sub-users for your organization. $15 per additional seat/month."/>
    <Card style={{padding:24,marginBottom:16}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>Invite Team Member</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
        {["member","admin"].map(r=><button key={r} onClick={()=>setNewRole(r)} style={{padding:"5px 12px",border:`1px solid ${newRole===r?C.gold:C.border}`,borderRadius:20,fontSize:10,cursor:"pointer",background:newRole===r?C.goldDim:"transparent",color:newRole===r?C.gold:C.textDim,textTransform:"capitalize"}}>{r}</button>)}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><div style={{flex:1,minWidth:200}}><Inp placeholder="employee@company.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&invite()}/></div><GoldBtn small onClick={invite} disabled={loading}>Invite</GoldBtn></div>
      <p style={{fontSize:10,color:C.textDim,fontWeight:200,marginTop:8}}>Each additional seat is $15/month, billed to the Master Account. New members receive an invitation email.</p>
    </Card>
    <Card style={{padding:20}}>
      <div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:12}}>Team Members ({activeSeats.length})</div>
      {activeSeats.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:12}}>{s.email}</div><div style={{fontSize:10,color:C.textDim,fontFamily:mono}}>{s.role} — {s.status}</div></div>
        <div style={{display:"flex",gap:6}}><Badge severity={s.status==="active"?"low":"info"} label={s.status}/><GoldBtn small danger onClick={()=>remove(s.email)}>Remove</GoldBtn></div>
      </div>)}
    </Card>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// TRIAL CARD GATE (#9 — block usage until card entered)
// ═══════════════════════════════════════════════════════════════════
function TrialGate({setPage,user}){return <div style={{animation:"fadeIn 0.4s ease"}}><Card style={{padding:48,maxWidth:520,margin:"40px auto",textAlign:"center",borderColor:C.gold+"40"}}>
  <div style={{fontSize:12,fontFamily:mono,letterSpacing:"3px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>One Step Remains</div>
  <div style={{fontSize:28,fontFamily:serif,fontWeight:300,marginBottom:12}}>Unlock Your Access</div>
  <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:10}}>Your 7-day trial begins the moment you add a payment method. Full access to every module — no limits, no restrictions.</p>
  <p style={{fontSize:12,color:C.textDim,fontWeight:200,marginBottom:28}}>Cancel before day 7 and you are not charged.</p>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <GoldBtn full onClick={()=>window.open("/api/paddle?tier=personal_pro","_blank")}>Start Trial — Personal Pro ($49/mo)</GoldBtn>
    <GoldBtn full onClick={()=>window.open("/api/paddle?tier=business","_blank")}>Start Trial — Business ($149/mo)</GoldBtn>
  </div>
  <div style={{marginTop:20,fontSize:10,fontFamily:mono,color:C.textDim,letterSpacing:"1px"}}>SECURED BY PADDLE — GLOBAL TAX COMPLIANT</div>
</Card></div>;}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT TOUR OVERLAY (#10 — guided first experience)
// ═══════════════════════════════════════════════════════════════════
function ProductTour({steps,onComplete,onSkip}){
  const[idx,setIdx]=useState(0);const s=steps[idx];if(!s)return null;
  return <div style={{position:"fixed",inset:0,zIndex:9000,pointerEvents:"none"}}>
    <div style={{position:"absolute",inset:0,background:"rgba(9,9,11,0.78)",backdropFilter:"blur(2px)",animation:"fadeIn 0.3s ease",pointerEvents:"auto"}}/>
    <div style={{position:"absolute",bottom:40,left:"50%",transform:"translateX(-50%)",width:"90%",maxWidth:440,background:C.bgCard,border:`1px solid ${C.gold}`,borderRadius:6,padding:24,pointerEvents:"auto",animation:"fadeIn 0.4s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:8}}>Step {idx+1} of {steps.length}</div>
      <div style={{fontSize:18,fontFamily:serif,fontWeight:400,marginBottom:10}}>{s.title}</div>
      <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:20}}>{s.desc}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <button onClick={onSkip} style={{background:"none",border:"none",color:C.textDim,fontSize:11,cursor:"pointer",fontFamily:mono,letterSpacing:"1px"}}>Skip tour</button>
        <div style={{display:"flex",gap:8}}>
          {idx>0&&<GoldBtn small onClick={()=>setIdx(idx-1)}>Back</GoldBtn>}
          {idx<steps.length-1?<GoldBtn small onClick={()=>{if(s.action)s.action();setIdx(idx+1);}}>Next →</GoldBtn>:<GoldBtn small onClick={onComplete}>Complete</GoldBtn>}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// NOTES (#15)
// ═══════════════════════════════════════════════════════════════════
function PgNotes(){
  const[notes,setNotes]=useState([]);const[loading,setLoading]=useState(true);const[selected,setSelected]=useState(null);const[editMode,setEditMode]=useState(false);
  const[title,setTitle]=useState("");const[content,setContent]=useState("");
  const load=async()=>{try{const r=await fetch("/api/notes");const d=await r.json();setNotes(Array.isArray(d)?d:[]);}catch(e){setNotes([]);}setLoading(false);};
  useEffect(()=>{load();},[]);

  const create=async()=>{const r=await fetch("/api/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"create",title:"New Note",content:""})});const d=await r.json();setSelected(d);setTitle("New Note");setContent("");setEditMode(true);load();};
  const save=async()=>{if(!selected)return;await fetch("/api/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update",id:selected.id,title,content})});setEditMode(false);load();};
  const del=async(id)=>{await fetch("/api/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",id})});setSelected(null);setEditMode(false);load();};
  const openNote=(n)=>{setSelected(n);setTitle(n.title);setContent(n.content||"");setEditMode(false);};

  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Notes" subtitle="Private notes. Encrypted. Only you can read them."/>
    <div className="sg2" style={{display:"grid",gridTemplateColumns:selected?"300px 1fr":"1fr",gap:16}}>
      <div>
        <GoldBtn full onClick={create}>+ New Note</GoldBtn>
        <div style={{marginTop:14}}>
          {loading&&<Card style={{padding:16}}><div style={{fontSize:11,fontFamily:mono,color:C.textDim}}>Loading...</div></Card>}
          {!loading&&notes.length===0&&<Card style={{padding:20,textAlign:"center"}}><div style={{fontSize:12,color:C.textDim,fontWeight:200}}>No notes yet.</div></Card>}
          {notes.map((n)=><Card key={n.id} onClick={()=>openNote(n)} highlight={selected?.id===n.id} style={{padding:14,marginBottom:6,cursor:"pointer"}}>
            <div style={{fontSize:13,fontWeight:400,marginBottom:4}}>{n.title||"Untitled"}</div>
            <div style={{fontSize:11,color:C.textDim,fontWeight:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(n.content||"").slice(0,80)}</div>
            <div style={{fontSize:9,color:C.textDim,fontFamily:mono,marginTop:6}}>{new Date(n.updated_at).toLocaleDateString()}</div>
          </Card>)}
        </div>
      </div>
      {selected&&<Card style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase"}}>{editMode?"Editing":"Viewing"}</div>
          <div style={{display:"flex",gap:6}}>
            {!editMode&&<GoldBtn small onClick={()=>setEditMode(true)}>Edit</GoldBtn>}
            {editMode&&<GoldBtn small onClick={save}>Save</GoldBtn>}
            <GoldBtn small danger onClick={()=>del(selected.id)}>Delete</GoldBtn>
          </div>
        </div>
        {editMode?<>
          <Inp placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/>
          <div style={{marginTop:10}}><Inp placeholder="Write your note..." value={content} onChange={e=>setContent(e.target.value)} area style={{minHeight:320}}/></div>
        </>:<>
          <h3 style={{fontSize:20,fontFamily:serif,fontWeight:400,marginBottom:12}}>{title||"Untitled"}</h3>
          <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{content||<em style={{color:C.textDim}}>Empty note. Click Edit to add content.</em>}</div>
        </>}
      </Card>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// CPIR MASTER DASHBOARD (#4 — preview questions, assign via email)
// ═══════════════════════════════════════════════════════════════════
function PgCPIR(){
  const[tab,setTab]=useState("assign");
  const[loading,setLoading]=useState(false);
  // Preview
  const[previewQs,setPreviewQs]=useState(null);
  const[loadingPreview,setLoadingPreview]=useState(false);
  // Assign
  const[seats,setSeats]=useState([]);
  const[selectedEmail,setSelectedEmail]=useState("");
  const[selectedName,setSelectedName]=useState("");
  const[department,setDepartment]=useState("");
  const[manualEmail,setManualEmail]=useState("");
  const[assignResult,setAssignResult]=useState(null);
  // Results
  const[results,setResults]=useState([]);
  const[selectedResult,setSelectedResult]=useState(null);

  const loadSeats=async()=>{try{const r=await fetch("/api/seats");const d=await r.json();setSeats(Array.isArray(d)?d.filter(s=>s.status!=="removed"):[]);}catch(e){setSeats([]);}};
  const loadResults=async()=>{try{const r=await fetch("/api/cpir");const d=await r.json();setResults(Array.isArray(d)?d:[]);}catch(e){setResults([]);}};
  useEffect(()=>{loadSeats();loadResults();},[]);

  const previewQuestions=async()=>{setLoadingPreview(true);
    try{const r=await fetch("/api/cpir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"preview_questions"})});const d=await r.json();setPreviewQs(d.questions||[]);}catch(e){}setLoadingPreview(false);};

  const assign=async()=>{const email=selectedEmail||manualEmail;if(!email.trim())return;setLoading(true);setAssignResult(null);
    try{const r=await fetch("/api/cpir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"assign",employeeEmail:email,employeeName:selectedName||email,department})});const d=await r.json();setAssignResult(d);loadResults();}catch(e){}setLoading(false);};

  const viewResult=async(id)=>{try{const r=await fetch("/api/cpir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"view",id})});const d=await r.json();setSelectedResult(d);}catch(e){}};

  if(selectedResult)return <div style={{animation:"fadeIn 0.3s ease"}}>
    <GoldBtn small onClick={()=>setSelectedResult(null)}>← Back to Results</GoldBtn>
    <SH title={`CPIR: ${selectedResult.employee_name}`} subtitle={`Assessment ${selectedResult.assessment_code}`}/>
    <Card style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>CPIR ASSESSMENT REPORT</div>
      <div style={{fontSize:10,fontFamily:mono,color:C.textDim,marginBottom:16}}>CLASSIFICATION: CONFIDENTIAL — {new Date(selectedResult.created_at).toLocaleString()}</div>
      {selectedResult.dimensions?.analysis_text?<div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{selectedResult.dimensions.analysis_text}</div>:<div style={{fontSize:12,color:C.textDim}}>Assessment has not been completed by the employee yet.</div>}
    </Card>
  </div>;

  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="CPIR Assessment" subtitle="Continuous Psychological Indicator Report. Behavioral risk assessment for insider threat detection."/>
    <TabBar tabs={[["assign","Assign Test"],["preview","Preview Questions"],["results","Results ("+results.length+")"]]} active={tab} onChange={setTab}/>

    {tab==="assign"&&<Card style={{padding:24,maxWidth:640}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>Assign New Assessment</div>
      <p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6,marginBottom:16}}>Select a team member or enter an email. The employee receives a unique link via email and completes the assessment without logging in. Results appear in your Results tab.</p>

      {seats.length>0&&<div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>Select from team</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {seats.map(s=><div key={s.id} onClick={()=>{setSelectedEmail(s.email);setSelectedName(s.email.split("@")[0]);setManualEmail("");}} style={{padding:"10px 14px",border:`1px solid ${selectedEmail===s.email?C.gold:C.border}`,borderRadius:3,background:selectedEmail===s.email?C.goldDim:"transparent",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
            <span style={{fontSize:12,color:selectedEmail===s.email?C.gold:C.text}}>{s.email}</span>
            <span style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{s.role}</span>
          </div>)}
        </div>
      </div>}

      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>{seats.length>0?"Or enter email manually":"Enter employee email"}</div>
        <Inp placeholder="employee@company.com" value={manualEmail} onChange={e=>{setManualEmail(e.target.value);setSelectedEmail("");setSelectedName("");}} mono/>
      </div>

      <div style={{marginBottom:12}}><Inp label="Employee Name (optional)" placeholder="Jane Doe" value={selectedName} onChange={e=>setSelectedName(e.target.value)}/></div>
      <div style={{marginBottom:16}}><Inp label="Department (optional)" placeholder="e.g. Engineering" value={department} onChange={e=>setDepartment(e.target.value)}/></div>

      <GoldBtn full onClick={assign} disabled={loading||(!selectedEmail&&!manualEmail.trim())}>{loading?"Assigning...":"Send Assessment Link"}</GoldBtn>

      {assignResult?.success&&<div style={{marginTop:16,padding:"14px 16px",background:C.lowDim,border:"1px solid rgba(107,158,122,0.3)",borderRadius:3}}>
        <div style={{fontSize:11,fontFamily:mono,color:C.low,marginBottom:6}}>✓ ASSESSMENT CREATED</div>
        <div style={{fontSize:12,color:C.textSec,marginBottom:6}}>Email sent. Link also accessible at:</div>
        <div style={{fontSize:11,fontFamily:mono,color:C.gold,wordBreak:"break-all"}}>{assignResult.assessmentUrl}</div>
      </div>}
      {assignResult?.error&&<div style={{marginTop:16,padding:"12px 16px",background:C.criticalDim,borderRadius:3,fontSize:12,color:C.critical}}>{assignResult.error}</div>}
    </Card>}

    {tab==="preview"&&<Card style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase"}}>Question Preview</div>
        <GoldBtn small onClick={previewQuestions} disabled={loadingPreview}>{loadingPreview?"Generating...":previewQs?"Regenerate":"Generate Preview"}</GoldBtn>
      </div>
      <p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6,marginBottom:16}}>Review the type of questions used in the assessment. Questions are AI-generated per assignment to prevent gaming. Each question targets a specific risk dimension (loyalty, stress, financial, satisfaction, access, external, ideological).</p>
      {loadingPreview&&<Loader text="Generating sample questions"/>}
      {previewQs&&previewQs.map((q,i)=><div key={q.id} style={{padding:"12px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:10,fontFamily:mono,color:C.gold,paddingTop:2,flexShrink:0}}>Q{i+1}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:C.text,fontWeight:300,marginBottom:4}}>{q.text}</div>
            <div style={{fontSize:10,fontFamily:mono,color:C.textDim,textTransform:"uppercase",letterSpacing:"1px"}}>Dimension: {q.dimension}</div>
          </div>
        </div>
      </div>)}
    </Card>}

    {tab==="results"&&<Card style={{padding:20}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>Assessment Results</div>
      {results.length===0&&<div style={{fontSize:12,color:C.textDim,fontWeight:200}}>No assessments assigned yet.</div>}
      {results.map((r,i)=>{const completed=r.answers&&Object.keys(r.answers).length>0;return <div key={r.id} onClick={()=>completed&&viewResult(r.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:i>0?`1px solid ${C.border}`:"none",cursor:completed?"pointer":"default",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:13,color:C.text}}>{r.employee_name||"Unnamed"}</div>
          <div style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{r.department||"No dept"} — {new Date(r.created_at).toLocaleDateString()} — Code: {r.assessment_code}</div>
        </div>
        <Badge severity={completed?"low":"high"} label={completed?"COMPLETED":"PENDING"}/>
      </div>;})}
    </Card>}
  </div>;
}


const NAV=[
  {group:"Operations",items:[{id:"dash",label:"Command Center"},{id:"brief",label:"Daily Brief"},{id:"warroom",label:"War Room"},{id:"intel",label:"Intelligence Feed"},{id:"map",label:"Situation Map"},{id:"travel",label:"Travel Security"}]},
  {group:"Investigation",items:[{id:"osint",label:"OSINT Search"},{id:"linkmap",label:"Link Analysis"},{id:"identity",label:"Identity Verification"},{id:"fraud",label:"Fraud Detection"},{id:"breaches",label:"Breach Console"},{id:"darkweb",label:"Dark Web Intel"}]},
  {group:"Monitoring",items:[{id:"footprint",label:"Digital Footprint"},{id:"social",label:"Social Monitoring"},{id:"imagescan",label:"Image Security"},{id:"geospatial",label:"Geospatial Intel"},{id:"ipscan",label:"Connection Security"},{id:"supplychain",label:"Supply Chain"}]},
  {group:"Protection",items:[{id:"invisible",label:"Make Me Invisible"},{id:"docintel",label:"Document Intel"},{id:"decoy",label:"Decoy Deployment"},{id:"honeytokens",label:"Deception Tech"},{id:"execprot",label:"Executive Protection"},{id:"evidence",label:"Evidence Chain"}]},
  {group:"Threat Analysis",items:[{id:"predict",label:"Threat Prediction"},{id:"predictive",label:"Predictive Forecast"},{id:"insider",label:"Insider Threats"},{id:"cpir",label:"CPIR Assessment"},{id:"cases",label:"Case Management"}]},
  {group:"Family & Team",items:[{id:"family",label:"Family Protection"},{id:"seats",label:"Team Seats"}]},
  {group:"Personal",items:[{id:"notes",label:"Notes"},{id:"reports",label:"Reports Center"}]},
  {group:"Services",items:[{id:"membership",label:"Membership"},{id:"consult",label:"Consultancy"},{id:"capabilities",label:"Our Capabilities"}]},
  {group:"System",items:[{id:"settings",label:"Settings"},{id:"guide",label:"User Guide"}]},
];

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function PgDash({go,user}){
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Command Center" subtitle={`Good ${new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"}, ${user?.name?.split(" ")[0]||"Operator"}. Your intelligence briefing is ready.`}/>
    <div className="sg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
      <Metric label="Active Conflicts" value={CONFLICTS.filter(z=>z.type==="war").length} severity="critical" delay={.05}/>
      <Metric label="Tracked Zones" value={CONFLICTS.length} delay={.1}/>
      <Metric label="Critical Alerts" value={CONFLICTS.filter(z=>z.sev==="critical").length} severity="high" delay={.15}/>
      <Metric label="Intel Status" value="Active" severity="low" delay={.2}/>
    </div>
    <div className="sg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <Card style={{padding:20}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:14}}>Quick Actions</div>
        {[["Generate Daily Brief","brief"],["OSINT Search","osint"],["Breach Scan","breaches"],["War Room","warroom"],["Social Monitoring","social"],["View Reports","reports"]].map(([t,id],i)=>
          <div key={i} onClick={()=>go(id)} style={{padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",cursor:"pointer",fontSize:13,fontWeight:300,color:C.gold}}>{t}</div>)}</Card>
      <Card style={{padding:20}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:14}}>Intelligence Status</div>
        <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>All systems operational. Your daily brief is ready for generation. {CONFLICTS.filter(z=>z.sev==="critical").length} critical situations require monitoring.</div>
        <div style={{marginTop:14}}><GoldBtn small onClick={()=>go("brief")}>Open Brief</GoldBtn></div></Card></div>
    <Card style={{padding:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}><span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>Global Situation</span><button onClick={()=>go("map")} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer"}}>Full map</button></div><WorldMap zones={CONFLICTS} sel={null} onSelect={()=>go("map")}/></Card>
    <div style={{marginTop:16}}><IPScanWidget/></div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function SpyDashboard({user,isDemo}){
  const[page,setPage]=useState("dash");const[collapsed,setCollapsed]=useState(false);const[mobileNav,setMobileNav]=useState(false);
  const[showSplash,setShowSplash]=useState(true);const[showOnboarding,setShowOnboarding]=useState(!isDemo&&!user?.onboarded);
  const[accountType,setAccountType]=useState(user?.account_type||null);
  const[lang,setLangState]=useState("en");
  const[showTour,setShowTour]=useState(false);
  const router=useRouter();
  const tier=user?.tier||"observer";
  const subActive=isDemo||user?.subscription_status==="active"||user?.subscription_status==="trial";
  const trialNeedsCard=!isDemo&&user?.trial_started_at&&!user?.card_on_file&&user?.subscription_status!=="active";
  const mainRef=useRef(null);

  // Language
  useEffect(()=>{setLangState(getLang());const h=()=>setLangState(getLang());window.addEventListener("langchange",h);return()=>window.removeEventListener("langchange",h);},[]);
  const tr=(k)=>T(k,lang);

  const handleSignOut=async()=>{if(isDemo){router.push("/");return;}const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);await sb.auth.signOut();router.push("/");router.refresh();};

  // Scroll to top on page change (#7)
  const scrollTop=()=>{if(mainRef.current)mainRef.current.scrollTop=0;window.scrollTo({top:0,behavior:"instant"});};
  const navClick=(id)=>{setPage(id);setMobileNav(false);scrollTop();};
  const setPageScroll=(id)=>{setPage(id);scrollTop();};

  const setAccountTypeFn=async(t)=>{setAccountType(t);if(!isDemo){try{const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);await sb.from("profiles").update({account_type:t,onboarded:true}).eq("id",user?.id);}catch(e){}}};

  // Access control
  const premiumPages=["brief","warroom","osint","linkmap","identity","fraud","breaches","darkweb","footprint","social","imagescan","geospatial","docintel","suppress","decoy","execprot","evidence","predict","predictive","insider","cpir","cases","reports","travel","supplychain","family","honeytokens","invisible","ipscan","seats","notes"];
  const needsSub=(p)=>premiumPages.includes(p)&&tier==="observer"&&!isDemo;

  const rp=()=>{
    if(showOnboarding&&!isDemo)return <Onboarding onComplete={()=>{setShowOnboarding(false);if(!isDemo)setShowTour(true);}} onSetAccountType={setAccountTypeFn}/>;
    // Trial gate: block everything except membership/settings/capabilities until card on file
    if(trialNeedsCard&&!["membership","settings","capabilities","guide"].includes(page))return <TrialGate setPage={setPage} user={user}/>;
    if(needsSub(page))return <Paywall setPage={setPage}/>;
    switch(page){
    case"dash":return <PgDash go={setPage} user={user}/>;
    case"brief":return <PgBrief user={user}/>;
    case"warroom":return <PgWarRoom/>;
    case"intel":return <PgIntel/>;
    case"map":return <PgMap/>;
    case"osint":return <PgOsint isDemo={isDemo}/>;
    case"breaches":return <PgBreaches user={user} isDemo={isDemo}/>;
    case"social":return <PgSocial/>;
    case"imagescan":return <PgImageScan user={user}/>;
    case"decoy":return <PgDecoy/>;
    case"reports":return <PgReports/>;
    case"travel":return <PgTravel/>;
    case"supplychain":return <PgSupplyChain/>;
    case"family":return <PgFamily/>;
    case"invisible":return <PgInvisible/>;
    case"honeytokens":return <PgHoneytokens/>;
    case"seats":return <PgSeats/>;
    case"ipscan":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Connection Security" subtitle="Real-time analysis of your current network connection."/><IPScanWidget/></div>;
    case"footprint":return <PgAnalysis module="footprint" title="Digital Footprint" subtitle="Complete exposure analysis." fields={[{key:"query",label:"Target",placeholder:"target@domain.com",mono:true},{key:"type",label:"Type",placeholder:"email / name / username / phone"},{key:"context",label:"Context",placeholder:"Known associations, concerns...",area:true}]}/>;
    case"docintel":return <PgAnalysis module="docintel" title="Document Intelligence" subtitle="Fuzzy-hash leak detection." fields={[{key:"query",label:"Document",placeholder:"Title, hash, or description"},{key:"context",label:"Distribution",placeholder:"Recipients, classification...",area:true}]}/>;
    case"execprot":return <PgAnalysis module="execprot" title="Executive Protection" subtitle="Exposure assessment." fields={[{key:"query",label:"Individual",placeholder:"Full name"},{key:"context",label:"Context",placeholder:"Role, threats, travel...",area:true}]}/>;
    case"predict":return <PgAnalysis module="threat" title="Threat Prediction" subtitle="Pattern-of-life analysis." fields={[{key:"query",label:"Subject",placeholder:"Describe scenario"},{key:"context",label:"Pattern of Life",placeholder:"Routines, habits...",area:true}]}/>;
    case"insider":return <PgAnalysis module="threat" title="Insider Threats" subtitle="Behavioral risk assessment." fields={[{key:"query",label:"Subject",placeholder:"Individual or department"},{key:"context",label:"Indicators",placeholder:"Changes, access patterns...",area:true}]}/>;
    case"cpir":return <PgCPIR/>;
    case"notes":return <PgNotes/>;
    case"linkmap":return <PgAnalysis module="linkmap" title="Link Analysis" subtitle="Entity relationship mapping." fields={[{key:"query",label:"Entity",placeholder:"Name, company, domain",mono:true},{key:"type",label:"Type",placeholder:"person / company / domain"},{key:"context",label:"Known Links",placeholder:"Associations, ties...",area:true}]} apiRoute="/api/gemini/linkmap" bodyKey="entity"/>;
    case"darkweb":return <PgAnalysis module="darkweb" title="Dark Web Intelligence" subtitle="Underground monitoring." fields={[{key:"query",label:"Target",placeholder:"Email, domain, company",mono:true},{key:"type",label:"Type",placeholder:"email / domain / company"},{key:"context",label:"Context",placeholder:"Threat actors, incidents...",area:true}]} apiRoute="/api/gemini/darkweb" bodyKey="query"/>;
    case"identity":return <PgAnalysis module="identity" title="Identity Verification" subtitle="Authenticity scoring." fields={[{key:"query",label:"Full Name",placeholder:"First Last"},{key:"context",label:"Data",placeholder:"Email, company, credentials...",area:true}]} apiRoute="/api/gemini/identity" bodyKey="name"/>;
    case"fraud":return <PgAnalysis module="fraud" title="Fraud Detection" subtitle="Risk assessment." fields={[{key:"query",label:"Entity",placeholder:"Person, company, email",mono:true},{key:"type",label:"Type",placeholder:"person / company / domain"},{key:"context",label:"Indicators",placeholder:"Suspicious activity...",area:true}]} apiRoute="/api/gemini/fraud" bodyKey="entity"/>;
    case"geospatial":return <PgAnalysis module="geospatial" title="Geospatial Intelligence" subtitle="Location threat assessment." fields={[{key:"query",label:"Location",placeholder:"City, address, coordinates"},{key:"context",label:"Context",placeholder:"Purpose, duration, concerns...",area:true}]} apiRoute="/api/gemini/geospatial" bodyKey="location"/>;
    case"predictive":return <PgAnalysis module="predictive" title="Predictive Forecast" subtitle="30/60/90-day threat horizon." fields={[{key:"query",label:"Sector",placeholder:"e.g. Finance, Technology"},{key:"context",label:"Assets",placeholder:"Specific assets, exposure...",area:true}]} apiRoute="/api/gemini/predict" bodyKey="sector"/>;
    case"evidence":return <PgAnalysis module="evidence" title="Evidence Chain" subtitle="Forensic documentation." fields={[{key:"query",label:"Case",placeholder:"Describe the incident",area:true}]} apiRoute="/api/gemini/evidence" bodyKey="caseDescription"/>;
    case"cases":return <PgAnalysis module="cases" title="Case Management" subtitle="Investigative analysis." fields={[{key:"query",label:"Case Details",placeholder:"Subject, findings, timeline...",area:true}]} apiRoute="/api/cases" bodyKey="caseData"/>;
    case"suppress":return <PgInvisible/>;
    case"capabilities":return <PgCapabilities/>;
    case"membership":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Membership" subtitle="Start your 7-day free trial. Full access. Cancel anytime."/>
      <div style={{background:C.goldDim,border:`1px solid ${C.gold}30`,borderRadius:4,padding:"14px 20px",marginBottom:24,fontSize:13,color:C.gold,fontWeight:300,textAlign:"center"}}>7-Day Free Trial — Full access to all modules. No limitations. Card required.</div>
      <div className="sg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
        {[{id:"obs",n:"Observer",p:"Free",desc:"Limited teaser",f:["Situation map","Intel feed (limited)","Platform preview"]},
          {id:"personal_pro",n:"Personal Pro",p:"$49",r:true,desc:"Standard intelligence",f:["Unlimited OSINT","Daily briefs","War Room","Social monitoring","Data broker removal","Footprint analysis","Breach monitoring","Reports archive","Travel security"]},
          {id:"business",n:"Business Premium",p:"$149",desc:"+$15/seat",f:["Everything in Personal Pro","Supply chain intel","Dark web monitoring","Deception technology","Corporate exposure alerts","Team seats ($15/ea)","Identity verification","Fraud detection","Case management"]},
          {id:"executive",n:"Executive",p:"Custom",desc:"White glove",f:["Everything in Business","Dedicated analyst team","Active deepfake poisoning","Custom integrations","SLA guarantee","Priority response"]},
        ].map((p,i)=><Card key={p.id} style={{padding:22,position:"relative"}}>{p.r&&<div style={{position:"absolute",top:-1,left:16,padding:"2px 10px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 3px 3px"}}>Popular</div>}<div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>{p.n}</div><div style={{fontSize:28,fontFamily:serif,fontWeight:300,marginBottom:4}}>{p.p}<span style={{fontSize:11,color:C.textDim}}>{p.p!=="Free"&&p.p!=="Custom"?"/mo":""}</span></div><div style={{fontSize:10,color:C.textDim,fontFamily:mono,marginBottom:14}}>{p.desc}</div>{p.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSec,fontWeight:200,marginBottom:4}}><span style={{color:C.gold,fontSize:9}}>✦</span>{f}</div>)}</Card>)}</div>
      <Card style={{padding:24,maxWidth:480}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:14}}>Start 7-Day Free Trial</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <GoldBtn full onClick={()=>window.open("/api/paddle?tier=personal_pro","_blank")}>Personal Pro — $49/mo</GoldBtn>
          <GoldBtn full onClick={()=>window.open("/api/paddle?tier=business","_blank")}>Business Premium — $149/mo</GoldBtn>
          <button onClick={()=>setPage("consult")} style={{padding:"13px 24px",border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.textSec,fontSize:11,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",width:"100%"}}>Executive — Request Demo</button>
        </div>
        <div style={{fontSize:10,color:C.textDim,fontFamily:mono,textAlign:"center",marginTop:12}}>Powered by Paddle — Tax compliant globally</div>
      </Card></div>;
    case"consult":return <PgAnalysis module="threat" title="Consultancy" subtitle="Describe your needs." fields={[{key:"query",label:"Subject",placeholder:"What do you need?"},{key:"context",label:"Details",placeholder:"Full requirements...",area:true}]}/>;
    case"settings":return <PgSettings user={user} isDemo={isDemo} setPage={setPage}/>;
    case"guide":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="User Guide" subtitle="Platform architecture."/>
      <Card style={{padding:24}}><p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Spy by Atlas is designed and operated by intelligence professionals. Every module runs on real-world methodology.</p>
      <div style={{marginTop:16,fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.7}}>
        <div style={{fontFamily:mono,fontSize:10,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:8}}>Data Architecture</div>
        <p>Your data is stored in an isolated PostgreSQL database with Row-Level Security. No data bleeds between accounts. Reports are encrypted and accessible only to you. All AI analysis runs server-side — your queries never leave our infrastructure unprotected.</p>
        <div style={{fontFamily:mono,fontSize:10,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginTop:16,marginBottom:8}}>Multi-Tenancy</div>
        <p>Each user operates in a fully isolated environment. Master accounts control sub-user access. Business seats inherit organizational permissions without accessing other users' data.</p>
      </div></Card></div>;
    default:return <PgDash go={setPage} user={user}/>;
  }};

  if(showSplash)return <><style>{css}</style><Splash onDone={()=>setShowSplash(false)}/></>;

  return <><style>{css}</style>
    {isDemo&&<div style={{background:C.goldDim,borderBottom:`1px solid rgba(196,162,101,0.2)`,padding:"5px 14px",fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"1px",textAlign:"center"}}>DEMO MODE — <a href="/signup" style={{color:C.gold,textDecoration:"underline"}}>Sign up</a> for full access.</div>}
    {mobileNav&&<div onClick={()=>setMobileNav(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:99}}/>}
    {showTour&&<ProductTour steps={[
      {title:"Welcome to your command center",desc:"This is your intelligence hub. From here you access every module. The left sidebar navigates between capabilities."},
      {title:"Generate your first brief",desc:"Click 'Daily Brief' in the sidebar to generate a personalized intelligence briefing. This is your morning intelligence report — always current, always private."},
      {title:accountType==="family"?"Add a family member":accountType==="business"?"Add a team member":"Run your first OSINT search",desc:accountType==="family"?"Visit 'Family Protection' to add a child and monitor their social media safety. No private messages — only public-facing content.":accountType==="business"?"Visit 'Team Seats' to invite employees. Each seat is $15/month. Then try 'Supply Chain' to scan your first vendor.":"Visit 'OSINT Search' to investigate any email, domain, person, or company. Every search auto-saves as a formal intelligence report."},
      {title:"You are in control",desc:"All data is encrypted and isolated to your account. Nothing is shared. Everything is yours."},
    ]} onComplete={async()=>{setShowTour(false);if(!isDemo&&user?.id){try{const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);await sb.from("profiles").update({tour_completed:true}).eq("id",user.id);}catch(e){}}}} onSkip={()=>setShowTour(false)}/>}
    <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
      <aside className={mobileNav?"ssb ssbo":"ssb"} style={{width:collapsed?56:220,background:C.bgSidebar,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s ease",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:collapsed?"16px 8px":"16px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>navClick("dash")} title="Home">
          {collapsed?<span style={{fontSize:14,fontFamily:serif,color:C.gold,letterSpacing:"2px",textAlign:"center",display:"block"}}>S</span>:<SpyLogo/>}
        </div>
        {!collapsed&&<button onClick={()=>setCollapsed(true)} style={{padding:"4px 16px",border:"none",background:"transparent",color:C.textDim,fontSize:9,fontFamily:mono,letterSpacing:"1px",cursor:"pointer",textAlign:"left",borderBottom:`1px solid ${C.border}`}}>COLLAPSE</button>}
        {collapsed&&<button onClick={()=>setCollapsed(false)} style={{padding:"4px",border:"none",background:"transparent",color:C.textDim,fontSize:11,cursor:"pointer",borderBottom:`1px solid ${C.border}`}}>›</button>}
        <nav style={{flex:1,overflowY:"auto",padding:"6px 5px"}}>
          {NAV.map(g=><div key={g.group} style={{marginBottom:3}}>
            {!collapsed&&<div style={{padding:"8px 10px 3px",fontSize:9,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>{g.group}</div>}
            {collapsed&&<div style={{height:1,background:C.border,margin:"4px 6px"}}/>}
            {g.items.map(n=><button key={n.id} onClick={()=>navClick(n.id)} style={{display:"flex",alignItems:"center",padding:collapsed?"6px":"6px 10px",border:"none",borderRadius:3,cursor:"pointer",fontFamily:sans,fontSize:11,fontWeight:page===n.id?500:200,width:"100%",background:page===n.id?n.id==="warroom"?C.warRedDim:C.goldDim:"transparent",color:page===n.id?(n.id==="warroom"?C.critical:C.gold):C.textSec,transition:"all 0.15s",justifyContent:collapsed?"center":"flex-start",whiteSpace:"nowrap",overflow:"hidden"}}>{collapsed?<span style={{fontSize:9,fontFamily:mono}}>{n.label.slice(0,2).toUpperCase()}</span>:n.label}</button>)}
          </div>)}
        </nav>
        <div style={{padding:"6px 5px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={handleSignOut} style={{display:"flex",alignItems:"center",padding:collapsed?"6px":"6px 10px",border:"none",cursor:"pointer",background:"transparent",width:"100%",color:C.textDim,fontSize:11,fontFamily:sans,borderRadius:3,justifyContent:collapsed?"center":"flex-start",fontWeight:200}}>{collapsed?"×":isDemo?"Exit Demo":"Sign Out"}</button>
        </div>
      </aside>
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header className="shp" style={{height:44,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button className="smt" onClick={()=>setMobileNav(!mobileNav)} style={{display:"none",alignItems:"center",justifyContent:"center",width:30,height:30,border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.gold,cursor:"pointer",fontSize:13}}>☰</button>
            <span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>{NAV.flatMap(g=>g.items).find(n=>n.id===page)?.label||"Command Center"}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <select value={lang} onChange={e=>{setLang(e.target.value);setLangState(e.target.value);}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:3,color:C.textDim,fontSize:10,fontFamily:mono,padding:"4px 8px",cursor:"pointer",letterSpacing:"1px"}}>
              {LANGS.map(l=><option key={l.code} value={l.code} style={{background:C.bg,color:C.text}}>{l.code.toUpperCase()}</option>)}
            </select>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPageScroll("settings")}>
              <div style={{width:24,height:24,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:10,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</div>
            </div>
          </div>
        </header>
        <div ref={mainRef} className="smp" style={{flex:1,overflow:"auto",padding:"20px 24px"}}>{rp()}</div>
        <footer style={{padding:"6px 24px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:8,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — DESIGNED BY INTELLIGENCE PROFESSIONALS</span>
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:8,fontFamily:mono,color:C.textDim}}><span style={{width:4,height:4,borderRadius:"50%",background:C.low,animation:"glow 3s infinite"}}/>ENCRYPTED</span>
        </footer>
      </main>
    </div></>;
}
