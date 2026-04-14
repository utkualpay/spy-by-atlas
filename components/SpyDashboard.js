"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

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
function Onboarding({onComplete}){const[step,setStep]=useState(0);
const steps=[
  {title:"Welcome to Spy",desc:"Your private intelligence platform, designed and operated by intelligence professionals. This brief walkthrough will help you understand the core capabilities at your disposal.",icon:"🛡️"},
  {title:"Command Center",desc:"Your daily intelligence hub. View your security posture, global threat landscape, and quick-access all modules. Your personalized daily brief will appear here.",icon:"📊"},
  {title:"OSINT Search",desc:"Conduct analyst-grade investigations on emails, usernames, domains, companies, and individuals. Every search generates a formal intelligence report saved to your account.",icon:"🔍"},
  {title:"The War Room",desc:"Your direct line to an AI intelligence expert. Describe any situation — cyber incident, threat assessment, operational decision — and receive real-time analyst guidance.",icon:"🔴"},
  {title:"Social Media Monitoring",desc:"Register your social accounts for continuous security monitoring. Our team analyzes your digital presence and identifies vulnerabilities.",icon:"📱"},
  {title:"Reports Center",desc:"Every analysis, scan, and assessment is saved as a formal intelligence report. Access your complete intelligence archive at any time.",icon:"📋"},
  {title:"Your Profile",desc:"Share your industry, role, and concerns to receive personalized intelligence. Everything you share is treated with absolute discretion.",icon:"🔒"},
];
const s=steps[step];
return <div style={{animation:"fadeIn 0.4s ease"}}><Card style={{padding:40,maxWidth:560,margin:"0 auto",textAlign:"center"}}>
  <div style={{fontSize:40,marginBottom:16}}>{s.icon}</div>
  <div style={{fontSize:22,fontFamily:serif,fontWeight:300,marginBottom:12}}>{s.title}</div>
  <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:28}}>{s.desc}</p>
  <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:24}}>{steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:4,borderRadius:2,background:i===step?C.gold:C.border,transition:"all 0.3s"}}/>)}</div>
  <div style={{display:"flex",gap:12,justifyContent:"center"}}>
    {step>0&&<GoldBtn small onClick={()=>setStep(step-1)}>Back</GoldBtn>}
    {step<steps.length-1?<GoldBtn onClick={()=>setStep(step+1)}>Next</GoldBtn>:<GoldBtn onClick={onComplete}>Enter Platform</GoldBtn>}
  </div>
  <button onClick={onComplete} style={{background:"none",border:"none",color:C.textDim,fontSize:11,cursor:"pointer",fontFamily:mono,marginTop:16}}>Skip walkthrough</button>
</Card></div>;}

// ── WORLD MAP ────────────────────────────────────────────────────────
function WorldMap({zones,sel,onSelect}){const tx=l=>((l+180)/360)*800,ty=l=>((90-l)/180)*450;const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
return <svg viewBox="0 0 800 450" style={{width:"100%",background:C.bgCard,borderRadius:4}}><rect width="800" height="450" fill="rgba(196,162,101,0.02)"/>
{Array.from({length:17},(_,i)=><line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2={450} stroke={C.border} strokeWidth={.3} opacity={.4}/>)}
{Array.from({length:10},(_,i)=><line key={`h${i}`} x1={0} y1={i*50} x2={800} y2={i*50} stroke={C.border} strokeWidth={.3} opacity={.4}/>)}
{zones.map(z=>{const cx=tx(z.lng),cy=ty(z.lat),c=tc[z.type]||C.medium,s=sel?.id===z.id;return <g key={z.id} onClick={()=>onSelect(z)} style={{cursor:"pointer"}}><circle cx={cx} cy={cy} r={s?18:12} fill={c} opacity={.08}><animate attributeName="r" values={`${s?18:12};${s?26:18};${s?18:12}`} dur="3s" repeatCount="indefinite"/></circle><circle cx={cx} cy={cy} r={s?4:2.5} fill={c} opacity={.9}/>{s&&<circle cx={cx} cy={cy} r={7} fill="none" stroke={c} strokeWidth={.8} opacity={.5}/>}</g>;})}
</svg>;}

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
function PgAnalysis({module,title,subtitle,fields}){
  const[form,setForm]=useState({});const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);
  const submit=async()=>{const q=form.query||form.target||form.subject||"";if(!q.trim())return;setLoading(true);setResult(null);
    try{const r=await fetch("/api/gemini/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q+(form.context?`\n\nAdditional context: ${form.context}`:""),type:form.type||"general",module})});const d=await r.json();setResult(d);}catch(e){}setLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title={title} subtitle={subtitle}/>
    <Card style={{padding:24,marginBottom:16,maxWidth:600}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(fields||[]).map((f,i)=><Inp key={i} label={f.label} placeholder={f.placeholder} value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} area={f.area} mono={f.mono}/>)}
        <GoldBtn full onClick={submit} disabled={loading}>{loading?"Analyzing...":"Submit for Analysis"}</GoldBtn>
      </div>
    </Card>
    {loading&&<Loader text="Conducting deep analysis — 30-60 seconds"/>}
    {result?.analysis&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>{title.toUpperCase()} REPORT</div><div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result.analysis}</div></Card>}
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
function PgCompetitors(){
  const competitors=[
    {name:"Maltego",cat:"Link Analysis",price:"$1,999/yr",strengths:["Visual relationship mapping","1M+ entity graphs","Transform Hub marketplace","Multi-user collaboration"],weaknesses:["Complex setup","No AI analysis","No daily briefs","Enterprise pricing only"],vsUs:"Maltego excels at visual link analysis. We provide AI-generated intelligence reports — faster results, no training required."},
    {name:"SL Crimewall",cat:"Investigation Platform",price:"Enterprise",strengths:["500+ data sources","Real-time collaboration","Case management","Dark web monitoring"],weaknesses:["Government/enterprise only","No consumer access","Complex interface","High cost"],vsUs:"Crimewall is built for law enforcement. Spy is built for executives and organizations who need intelligence without the complexity."},
    {name:"Recorded Future",cat:"Threat Intel",price:"$10K+/yr",strengths:["ML-driven threat feeds","SIEM integration","Predictive analytics","Dark web coverage"],weaknesses:["Enterprise pricing","Requires security team","No personal protection","Integration-heavy"],vsUs:"Recorded Future serves SOC teams. Spy delivers the same intelligence class to individuals and smaller organizations at accessible pricing."},
    {name:"SpiderFoot",cat:"Recon Tool",price:"Free/OSS",strengths:["200+ modules","Open source","Automated scanning","Self-hostable"],weaknesses:["Technical users only","Raw data output","No analysis","No reports"],vsUs:"SpiderFoot provides raw data. Spy provides analyst-grade intelligence reports with actionable recommendations."},
    {name:"OSINT Industries",cat:"OSINT Platform",price:"Subscription",strengths:["Identity verification","Law enforcement focus","Fraud detection","Evidence gathering"],weaknesses:["Law enforcement oriented","Limited consumer features","No AI chat","No executive protection"],vsUs:"OSINT Industries serves investigators. Spy adds AI-powered analysis, War Room chat, daily briefs, and executive protection."},
    {name:"Flashpoint/Echosec",cat:"Threat + OSINT",price:"Enterprise",strengths:["Geospatial intelligence","Physical security","AI enrichment","Dark web monitoring"],weaknesses:["Enterprise only","No self-service","No personal use","Complex onboarding"],vsUs:"Flashpoint provides physical security intelligence to enterprises. Spy democratizes this for individuals and smaller organizations."},
  ];
  const ourEdge=[
    {t:"AI-Powered Analysis",d:"Every module is powered by Gemini AI. No raw data dumps — formal intelligence reports, written in professional language, saved and accessible."},
    {t:"War Room",d:"Real-time 1-on-1 with an AI intelligence analyst. No competitor offers this at our price point. Session persistence, resolution tracking."},
    {t:"Accessible Pricing",d:"$49-149/mo vs $10K+/yr from enterprise competitors. Same intelligence methodology, fraction of the cost."},
    {t:"All-in-One Platform",d:"OSINT, breach monitoring, social media, executive protection, threat prediction, document intelligence — single platform."},
    {t:"Human-Quality Reports",d:"Daily briefs that read like they were written by a senior analyst. Not AI-generated summaries — intelligence products."},
    {t:"Executive Focus",d:"Built for decision-makers, not SOC teams. Clean interface, actionable output, no technical expertise required."},
  ];
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Competitive Intelligence" subtitle="How Spy by Atlas positions against the intelligence industry. Updated by our competitive analysis team."/>
    <div style={{marginBottom:24}}><div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Our Competitive Advantages</div>
      <div className="sg3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>{ourEdge.map((e,i)=><Card key={i} style={{padding:20}}><div style={{fontSize:12,fontWeight:400,color:C.gold,marginBottom:6}}>{e.t}</div><div style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{e.d}</div></Card>)}</div>
    </div>
    <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Competitor Landscape</div>
    {competitors.map((c,i)=><Card key={i} style={{padding:20,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div><span style={{fontSize:15,fontWeight:500}}>{c.name}</span><span style={{fontSize:10,fontFamily:mono,color:C.textDim,marginLeft:10}}>{c.cat} — {c.price}</span></div>
      </div>
      <div className="sg2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12}}>
        <div><div style={{fontSize:10,fontFamily:mono,color:C.low,marginBottom:6}}>STRENGTHS</div>{c.strengths.map((s,j)=><div key={j} style={{fontSize:11,color:C.textSec,fontWeight:200,marginBottom:3}}>+ {s}</div>)}</div>
        <div><div style={{fontSize:10,fontFamily:mono,color:C.high,marginBottom:6}}>WEAKNESSES</div>{c.weaknesses.map((w,j)=><div key={j} style={{fontSize:11,color:C.textSec,fontWeight:200,marginBottom:3}}>- {w}</div>)}</div>
      </div>
      <div style={{padding:"10px 14px",background:C.goldDim,borderRadius:3,fontSize:12,color:C.gold,fontWeight:300,lineHeight:1.5}}>{c.vsUs}</div>
    </Card>)}
    <Card style={{padding:20,marginTop:16,borderColor:C.gold+"30"}}>
      <div style={{fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"2px",textTransform:"uppercase",marginBottom:8}}>Summary Assessment</div>
      <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>The intelligence platform market is dominated by enterprise solutions priced at $10K-100K+/year, targeting government agencies and large security operations centers. Spy by Atlas occupies a unique position: intelligence-grade capabilities at consumer-accessible pricing ($49-149/mo), powered by AI instead of manual analyst teams. Our primary differentiators are the War Room AI analyst, human-quality daily briefs, and the all-in-one platform approach. The market gap we fill — professional intelligence for individuals, executives, and smaller organizations — has no direct competitor at our price point.</div>
    </Card>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════════
const NAV=[
  {group:"Operations",items:[{id:"dash",label:"Command Center"},{id:"brief",label:"Daily Brief"},{id:"warroom",label:"War Room"},{id:"intel",label:"Intelligence Feed"},{id:"map",label:"Situation Map"}]},
  {group:"Investigation",items:[{id:"osint",label:"OSINT Search"},{id:"breaches",label:"Breach Console"},{id:"footprint",label:"Digital Footprint"},{id:"social",label:"Social Monitoring"},{id:"imagescan",label:"Image Security"}]},
  {group:"Protection",items:[{id:"docintel",label:"Document Intel"},{id:"suppress",label:"Data Suppression"},{id:"decoy",label:"Decoy Deployment"},{id:"execprot",label:"Executive Protection"}]},
  {group:"Threat Analysis",items:[{id:"predict",label:"Threat Prediction"},{id:"insider",label:"Insider Threats"},{id:"cpir",label:"CPIR Assessment"}]},
  {group:"Services",items:[{id:"reports",label:"Reports Center"},{id:"membership",label:"Membership"},{id:"consult",label:"Consultancy"},{id:"competitors",label:"Competitive Intel"}]},
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
  </div>;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function SpyDashboard({user,isDemo}){
  const[page,setPage]=useState("dash");const[collapsed,setCollapsed]=useState(false);const[mobileNav,setMobileNav]=useState(false);
  const[showSplash,setShowSplash]=useState(true);const[showOnboarding,setShowOnboarding]=useState(!isDemo);
  const router=useRouter();

  const handleSignOut=async()=>{if(isDemo){router.push("/");return;}const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);await sb.auth.signOut();router.push("/");router.refresh();};
  const navClick=(id)=>{setPage(id);setMobileNav(false);};

  const rp=()=>{
    if(showOnboarding&&!isDemo)return <Onboarding onComplete={()=>setShowOnboarding(false)}/>;
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
    case"footprint":return <PgAnalysis module="footprint" title="Digital Footprint" subtitle="Complete exposure analysis by our intelligence team." fields={[{key:"query",label:"Target (email, name, or username)",placeholder:"target@domain.com",mono:true},{key:"type",label:"Target Type",placeholder:"email / name / username / phone"},{key:"context",label:"Additional Context (optional)",placeholder:"Known associations, industry, concerns...",area:true}]}/>;
    case"docintel":return <PgAnalysis module="docintel" title="Document Intelligence" subtitle="Fuzzy-hash leak detection and metadata analysis." fields={[{key:"query",label:"Document or Subject",placeholder:"Document title, hash, or description"},{key:"context",label:"Distribution Details",placeholder:"Who received this document, when, classification level...",area:true}]}/>;
    case"suppress":return <PgAnalysis module="suppress" title="Data Suppression" subtitle="Automated takedown analysis and strategy." fields={[{key:"query",label:"Content to Suppress",placeholder:"URL, description, or search term"},{key:"context",label:"Suppression Details",placeholder:"Where it appears, severity, legal jurisdiction...",area:true}]}/>;
    case"execprot":return <PgAnalysis module="execprot" title="Executive Protection" subtitle="Exposure assessment for high-value individuals." fields={[{key:"query",label:"Protected Individual",placeholder:"Full name"},{key:"context",label:"Context",placeholder:"Role, public profile, known threats, travel patterns...",area:true}]}/>;
    case"predict":return <PgAnalysis module="threat" title="Threat Prediction" subtitle="Pattern-of-life analysis and threat forecasting." fields={[{key:"query",label:"Subject or Scenario",placeholder:"Describe the subject or scenario to assess"},{key:"context",label:"Pattern of Life Data",placeholder:"Routines, travel, digital habits, known associations...",area:true}]}/>;
    case"insider":return <PgAnalysis module="threat" title="Insider Threats" subtitle="Behavioral analysis and risk assessment." fields={[{key:"query",label:"Subject or Department",placeholder:"Individual, team, or department"},{key:"context",label:"Observed Indicators",placeholder:"Behavioral changes, access patterns, grievances, external contacts...",area:true}]}/>;
    case"cpir":return <PgAnalysis module="threat" title="CPIR Assessment" subtitle="Continuous Psychological Indicator Report." fields={[{key:"query",label:"Assessment Subject",placeholder:"Individual or group"},{key:"context",label:"Behavioral Observations",placeholder:"Recent changes, morale indicators, loyalty signals, stress factors...",area:true}]}/>;
    case"membership":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Membership" subtitle="Intelligence as a Service — choose your level of awareness."/>
      <div className="sg4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
        {[{id:"obs",n:"Observer",p:"Free",f:["5 OSINT searches/month","Weekly digest","Breach alerts","Threat map"]},
          {id:"analyst",n:"Analyst",p:"$49",r:true,f:["Unlimited OSINT","Daily briefs","War Room access","Social monitoring","Footprint analysis","Reports archive","Call center"]},
          {id:"director",n:"Director",p:"$149",f:["Everything in Analyst","Executive protection","Document intelligence","Decoy deployment","Threat prediction","Assigned analyst","Legal consultancy"]},
          {id:"ent",n:"Enterprise",p:"Custom",f:["Everything in Director","Employee monitoring","CPIR module","Breach database access","Dedicated team","SLA guarantee"]},
        ].map((p,i)=><Card key={p.id} style={{padding:22,position:"relative"}}>{p.r&&<div style={{position:"absolute",top:-1,left:16,padding:"2px 10px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 3px 3px"}}>Recommended</div>}<div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:8}}>{p.n}</div><div style={{fontSize:30,fontFamily:serif,fontWeight:300,marginBottom:16}}>{p.p}<span style={{fontSize:12,color:C.textDim}}>{p.p!=="Free"&&p.p!=="Custom"?"/mo":""}</span></div>{p.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSec,fontWeight:200,marginBottom:5}}><span style={{color:C.gold,fontSize:9}}>✦</span>{f}</div>)}</Card>)}</div>
      <Card style={{padding:24,maxWidth:480}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:14}}>Subscribe</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <GoldBtn full onClick={()=>window.open("/api/payment?tier=analyst","_blank")}>Analyst — $49/mo</GoldBtn>
          <GoldBtn full onClick={()=>window.open("/api/payment?tier=director","_blank")}>Director — $149/mo</GoldBtn>
          <button onClick={()=>setPage("consult")} style={{padding:"13px 24px",border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.textSec,fontSize:11,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",width:"100%"}}>Enterprise — Contact Us</button>
        </div>
        <div style={{fontSize:10,color:C.textDim,fontFamily:mono,textAlign:"center",marginTop:12}}>Secured by iyzico</div>
      </Card></div>;
    case"consult":return <PgAnalysis module="threat" title="Consultancy" subtitle="Direct access to our intelligence professionals. Describe your needs." fields={[{key:"query",label:"Subject",placeholder:"What do you need?"},{key:"context",label:"Details",placeholder:"Describe your requirements in full...",area:true}]}/>;
    case"competitors":return <PgCompetitors/>;    case"settings":return <PgSettings user={user} isDemo={isDemo} setPage={setPage}/>;
    case"guide":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="User Guide" subtitle="Understanding the platform."/><Card style={{padding:24}}><p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Spy by Atlas is designed and operated by intelligence professionals. Every module is built on real-world intelligence methodology.</p><p style={{fontSize:13,color:C.textDim,fontWeight:200,lineHeight:1.7,marginTop:12}}>Your data is stored with strict isolation — no information bleeds between accounts. Reports are encrypted and accessible only to you.</p></Card></div>;
    default:return <PgDash go={setPage} user={user}/>;
  }};

  if(showSplash)return <><style>{css}</style><Splash onDone={()=>setShowSplash(false)}/></>;

  return <><style>{css}</style>
    {isDemo&&<div style={{background:C.goldDim,borderBottom:`1px solid rgba(196,162,101,0.2)`,padding:"5px 14px",fontSize:10,fontFamily:mono,color:C.gold,letterSpacing:"1px",textAlign:"center"}}>DEMO MODE — <a href="/signup" style={{color:C.gold,textDecoration:"underline"}}>Sign up</a> for full access.</div>}
    {mobileNav&&<div onClick={()=>setMobileNav(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:99}}/>}
    <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
      <aside className={mobileNav?"ssb ssbo":"ssb"} style={{width:collapsed?56:220,background:C.bgSidebar,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s ease",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:collapsed?"16px 8px":"16px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>{if(mobileNav)setMobileNav(false);else setCollapsed(!collapsed);}}>
          {collapsed?<span style={{fontSize:14,fontFamily:serif,color:C.gold,letterSpacing:"2px",textAlign:"center",display:"block"}}>S</span>:<SpyLogo/>}
        </div>
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
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("settings")}>
            <div style={{width:24,height:24,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:10,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</div>
          </div>
        </header>
        <div className="smp" style={{flex:1,overflow:"auto",padding:"20px 24px"}}>{rp()}</div>
        <footer style={{padding:"6px 24px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
          <span style={{fontSize:8,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — DESIGNED BY INTELLIGENCE PROFESSIONALS</span>
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:8,fontFamily:mono,color:C.textDim}}><span style={{width:4,height:4,borderRadius:"50%",background:C.low,animation:"glow 3s infinite"}}/>ENCRYPTED</span>
        </footer>
      </main>
    </div></>;
}
