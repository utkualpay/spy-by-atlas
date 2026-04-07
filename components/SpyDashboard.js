"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// ── THEME ────────────────────────────────────────────────────────────
const C = {
  bg:"#09090b",bgCard:"#131316",bgHover:"#1a1a1f",bgSidebar:"#0c0c0f",bgInput:"#18181c",
  border:"#1f1f25",borderHover:"#2a2a32",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",
  gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)",goldMid:"rgba(196,162,101,0.20)",
  critical:"#c45c5c",criticalDim:"rgba(196,92,92,0.10)",high:"#c49a5c",highDim:"rgba(196,154,92,0.10)",
  medium:"#7c8db5",mediumDim:"rgba(124,141,181,0.10)",low:"#6b9e7a",lowDim:"rgba(107,158,122,0.10)",
  info:"#8b8db5",infoDim:"rgba(139,141,181,0.10)",
};
const css=`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes scanline{0%{left:-100%}100%{left:100%}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}::selection{background:${C.goldDim};color:${C.gold}}`;
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

// ── API HELPERS (route through Next.js API routes) ──────────────────
async function apiOsint(query, type) {
  const r = await fetch("/api/osint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, type }) });
  return r.ok ? r.json() : null;
}
async function apiIntel() {
  const r = await fetch("/api/intel");
  return r.ok ? r.json() : [];
}
async function apiBreaches(email) {
  const r = await fetch("/api/breaches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
  return r.ok ? r.json() : { breaches: [] };
}
async function apiFootprint(query, type) {
  const r = await fetch("/api/footprint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, type }) });
  return r.ok ? r.json() : null;
}
async function apiExecprot(target) {
  const r = await fetch("/api/execprot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target }) });
  return r.ok ? r.json() : null;
}

// ── DATA ─────────────────────────────────────────────────────────────
const SECTORS=["All Sectors","Cybersecurity","Finance & Banking","Energy & Infrastructure","Healthcare","Defense & Government","Technology","Legal","Maritime & Logistics","Telecommunications"];
const CONFLICTS=[
  {id:1,name:"Ukraine — Russia",lat:48.5,lng:35,type:"war",sev:"critical",desc:"Full-scale conventional war. Active frontlines across Donetsk, Zaporizhzhia, Kherson, Kharkiv.",cas:"500,000+",start:"Feb 2022",src:"CFR, ACLED"},
  {id:2,name:"Sudan Civil War",lat:15.5,lng:32.5,type:"war",sev:"critical",desc:"SAF vs RSF. One of world's worst humanitarian disasters. 150,000+ killed, 10M+ displaced.",cas:"150,000+",start:"Apr 2023",src:"Crisis Group, ACLED"},
  {id:3,name:"Gaza — Israel",lat:31.4,lng:34.4,type:"war",sev:"critical",desc:"Active military operations in Gaza Strip. Severe humanitarian crisis with mass displacement.",cas:"45,000+",start:"Oct 2023",src:"CFR"},
  {id:4,name:"Myanmar Civil War",lat:19.7,lng:96.2,type:"war",sev:"critical",desc:"Resistance forces vs military junta. Territory shifting across multiple states.",cas:"15,000+/yr",start:"Feb 2021",src:"ACLED"},
  {id:5,name:"Venezuela — US Intervention",lat:10.5,lng:-66.9,type:"war",sev:"critical",desc:"US Operation 'Absolute Resolve' launched Jan 3, 2026. Large-scale strikes on Caracas.",cas:"Unknown",start:"Jan 2026",src:"CFR"},
  {id:6,name:"DR Congo — M23",lat:-1.5,lng:29,type:"war",sev:"high",desc:"M23 rebel advance in North Kivu. Rwanda-backed forces vs DRC army.",cas:"10,000+",start:"2022",src:"Crisis Group"},
  {id:7,name:"Yemen — Houthi / Red Sea",lat:15.4,lng:44.2,type:"war",sev:"high",desc:"Houthi attacks on Red Sea shipping. US/UK strikes on Houthi positions.",cas:"Thousands",start:"2014",src:"CFR"},
  {id:8,name:"Sahel Insurgency",lat:14,lng:1,type:"insurgency",sev:"high",desc:"Jihadist insurgencies across Mali, Burkina Faso, Niger.",cas:"Thousands",start:"2012",src:"Crisis Group"},
  {id:9,name:"Syria — Post-Assad",lat:35,lng:38,type:"war",sev:"high",desc:"Post-Assad transition amid ISIS resurgence, Kurdish governance, Turkish and Israeli interventions.",cas:"Unknown",start:"2011",src:"CFR"},
  {id:10,name:"Somalia — Al-Shabaab",lat:2,lng:45,type:"insurgency",sev:"high",desc:"Al-Shabaab controls 60% of southern territory.",cas:"Thousands",start:"2006",src:"CFR, ACLED"},
  {id:11,name:"Haiti Collapse",lat:18.9,lng:-72.3,type:"instability",sev:"high",desc:"Armed gangs control majority of Port-au-Prince.",cas:"Thousands",start:"2021",src:"CFR"},
  {id:12,name:"Ethiopia — Eritrea Tensions",lat:11.5,lng:39.5,type:"tension",sev:"high",desc:"Post-Tigray conflict tensions. Risk of interstate war.",cas:"N/A",start:"2024",src:"Crisis Group"},
  {id:13,name:"India — Pakistan",lat:34,lng:74,type:"tension",sev:"high",desc:"Heightened tensions over Kashmir. Nuclear-armed states.",cas:"Hundreds",start:"Ongoing",src:"CFR"},
  {id:14,name:"Iran — US / Israel",lat:32.4,lng:53.7,type:"tension",sev:"critical",desc:"Direct conflict between US, Iran, Israel in 2025.",cas:"Unknown",start:"2025",src:"CFR"},
  {id:15,name:"Taiwan Strait",lat:24,lng:120,type:"tension",sev:"medium",desc:"PLA military provocations. Air and naval incursions.",cas:"N/A",start:"Ongoing",src:"CFR"},
  {id:16,name:"South China Sea",lat:14.5,lng:114,type:"tension",sev:"medium",desc:"China-Philippines confrontations at Second Thomas Shoal.",cas:"N/A",start:"Ongoing",src:"CFR"},
  {id:17,name:"Lebanon — Israel",lat:33.3,lng:35.5,type:"tension",sev:"high",desc:"Hezbollah disarmament efforts failing. Israeli strikes.",cas:"2,000+",start:"Oct 2023",src:"CFR"},
  {id:18,name:"Nigeria — Multiple Fronts",lat:9.1,lng:7.5,type:"insurgency",sev:"high",desc:"Boko Haram/ISWAP in northeast. Banditry in northwest.",cas:"Thousands",start:"2009",src:"ACLED"},
  {id:19,name:"South Sudan",lat:6.8,lng:31.6,type:"war",sev:"high",desc:"High-intensity warfare between government and opposition.",cas:"Thousands",start:"2013",src:"Crisis Group"},
  {id:20,name:"Colombia — Armed Groups",lat:4.6,lng:-74.1,type:"insurgency",sev:"medium",desc:"ELN and FARC dissidents active. Peace process stalled.",cas:"Hundreds",start:"1964",src:"Crisis Group"},
  {id:21,name:"Mexico — Cartel Violence",lat:23.6,lng:-102.5,type:"instability",sev:"high",desc:"Transnational criminal groups. Drug trafficking crisis.",cas:"30,000+/yr",start:"2006",src:"CFR"},
  {id:22,name:"Cameroon — Anglophone Crisis",lat:5.9,lng:10.1,type:"insurgency",sev:"medium",desc:"Anglophone separatist conflict.",cas:"Thousands",start:"2017",src:"CFR"},
  {id:23,name:"Ecuador — Violence",lat:-1.8,lng:-78.2,type:"instability",sev:"medium",desc:"Rising violence and organized crime.",cas:"Hundreds",start:"2024",src:"CFR"},
  {id:24,name:"Russia — NATO Tensions",lat:56,lng:26,type:"tension",sev:"high",desc:"Russian provocations against NATO. Hybrid warfare.",cas:"N/A",start:"2022",src:"CFR"},
  {id:25,name:"Pakistan — Insurgency",lat:31,lng:69,type:"insurgency",sev:"medium",desc:"TTP and Baloch insurgency.",cas:"Hundreds",start:"2004",src:"ACLED"},
  {id:26,name:"Philippines — Insurgency",lat:7.5,lng:124,type:"insurgency",sev:"low",desc:"Communist NPA and Islamist groups in Mindanao.",cas:"Hundreds",start:"1969",src:"ACLED"},
  {id:27,name:"Iraq — ISIS Remnants",lat:33.3,lng:44.4,type:"insurgency",sev:"medium",desc:"ISIS sleeper cells. Low-intensity but persistent.",cas:"Hundreds",start:"2003",src:"ACLED"},
  {id:28,name:"Burkina Faso — Jihadist",lat:12.4,lng:-1.5,type:"war",sev:"high",desc:"JNIM and ISGS control large swathes.",cas:"Thousands",start:"2015",src:"ACLED"},
];

const CPIR_QUESTIONS=[
  {q:"A project deadline is approaching and the team can't agree on the approach. What do you do?",opts:[{t:"Call a meeting to hear all perspectives, then make the call yourself",s:2,d:"dominance"},{t:"Let the team vote and go with the majority decision",s:1,d:"dominance"},{t:"Defer to whoever has the most experience on this type of project",s:0,d:"dominance"},{t:"Present your preferred approach with strong reasoning to persuade others",s:3,d:"dominance"}]},
  {q:"You notice a colleague has been making small, recurring errors in financial reports. Nobody else has caught it yet.",opts:[{t:"Bring it to management's attention through proper reporting channels",s:0,d:"integrity"},{t:"Speak with the colleague privately and offer to help them review their work",s:1,d:"integrity"},{t:"Keep an eye on it but only mention it if it becomes a bigger issue",s:2,d:"integrity"},{t:"Document it for your own records in case it becomes relevant later",s:3,d:"integrity"}]},
  {q:"Your team recently received recognition for a project, but you feel your contribution was significantly greater than acknowledged.",opts:[{t:"Let it go — the team's success matters more than individual credit",s:0,d:"resentment"},{t:"Mention it to your manager during your next one-on-one casually",s:1,d:"resentment"},{t:"Make sure colleagues know about your specific contributions going forward",s:2,d:"resentment"},{t:"Feel frustrated but avoid saying anything to keep the peace",s:3,d:"resentment"}]},
  {q:"You're given temporary access to a system outside your normal role for a specific task. After finishing, you notice the access hasn't been revoked.",opts:[{t:"Notify IT immediately and request they revoke the access",s:0,d:"access_seeking"},{t:"Make a note to mention it next time you talk to IT",s:1,d:"access_seeking"},{t:"Leave it — it might be useful if a similar task comes up",s:2,d:"access_seeking"},{t:"Explore what other information is available while you still have access",s:3,d:"access_seeking"}]},
  {q:"A close friend asks to borrow a significant amount of money. You're not in the best financial position yourself.",opts:[{t:"Explain your situation honestly and suggest alternative ways you could help",s:0,d:"vulnerability"},{t:"Lend a smaller amount than requested that you can afford to lose",s:1,d:"vulnerability"},{t:"Agree to help even though it puts strain on your finances",s:2,d:"vulnerability"},{t:"Look into other ways to quickly come up with the money",s:3,d:"vulnerability"}]},
  {q:"Your manager gives you feedback that you disagree with strongly. How do you respond?",opts:[{t:"Share your perspective respectfully and try to find common ground",s:0,d:"authority_response"},{t:"Accept the feedback outwardly and reflect on it later privately",s:1,d:"authority_response"},{t:"Push back firmly because you believe you're right on this",s:2,d:"authority_response"},{t:"Nod along but largely disregard it since you know your work better",s:3,d:"authority_response"}]},
  {q:"A new company policy requires additional documentation that you consider unnecessary for your workflow.",opts:[{t:"Follow the policy fully and suggest improvements through proper channels",s:0,d:"compliance"},{t:"Follow the policy but streamline the documentation where possible",s:1,d:"compliance"},{t:"Do the minimum needed to appear compliant while preserving efficiency",s:2,d:"compliance"},{t:"Continue your current workflow since it produces better results anyway",s:3,d:"compliance"}]},
  {q:"A colleague mentions they found an easy workaround to bypass a security feature that slows down their workflow.",opts:[{t:"Report the bypass to IT security so they can address the vulnerability",s:0,d:"security_awareness"},{t:"Tell the colleague they should stop using it because it's a security risk",s:1,d:"security_awareness"},{t:"Ask them to show you the workaround out of curiosity",s:2,d:"security_awareness"},{t:"Use the workaround yourself since it saves time and seems harmless",s:3,d:"security_awareness"}]},
  {q:"Thinking about the past few months at work, which statement best describes your trajectory?",opts:[{t:"I'm finding new challenges and feel increasingly invested in the company",s:0,d:"satisfaction"},{t:"Things are steady — I come in, do good work, and feel fine about it",s:1,d:"satisfaction"},{t:"I've been questioning whether this role still aligns with my goals",s:2,d:"satisfaction"},{t:"Several recent changes have made me less enthusiastic than I was before",s:3,d:"satisfaction"}]},
  {q:"What primarily drives you to do your best work?",opts:[{t:"Knowing my work makes a real difference to the team and company",s:0,d:"motivation"},{t:"The learning opportunities and professional growth this role provides",s:1,d:"motivation"},{t:"Concrete rewards — compensation, title, visible recognition",s:2,d:"motivation"},{t:"The autonomy to make decisions and control how I get things done",s:3,d:"motivation"}]},
  {q:"You discover what appears to be a significant security vulnerability during routine work. What's your first step?",opts:[{t:"Report it immediately through the security incident process",s:0,d:"security_response"},{t:"Document it thoroughly first so you can provide a complete report",s:1,d:"security_response"},{t:"Try to understand the full scope of the issue before telling anyone",s:2,d:"security_response"},{t:"Mention it informally to a technically skilled colleague for their opinion",s:3,d:"security_response"}]},
  {q:"How would you describe your professional network outside your current organization?",opts:[{t:"Mostly personal friends and former colleagues I've stayed in touch with",s:0,d:"network_profile"},{t:"A solid professional network built through industry events and groups",s:1,d:"network_profile"},{t:"An extensive network including contacts across different industries and countries",s:2,d:"network_profile"},{t:"I maintain connections selectively with a few trusted individuals",s:3,d:"network_profile"}]},
  {q:"The company announces it will begin monitoring employee emails and web usage for security purposes. Your reaction?",opts:[{t:"This is a reasonable measure and I have nothing to hide",s:0,d:"surveillance_tolerance"},{t:"I understand the need but I'll be more careful about personal use at work",s:1,d:"surveillance_tolerance"},{t:"It seems like an overreaction that treats employees as suspects",s:2,d:"surveillance_tolerance"},{t:"I'll start using personal devices for anything I don't want monitored",s:3,d:"surveillance_tolerance"}]},
  {q:"During an extremely stressful personal period, how does your work life adjust?",opts:[{t:"I keep work and personal life separate — my output stays consistent",s:0,d:"stress_resilience"},{t:"There might be a brief dip but I bounce back quickly",s:1,d:"stress_resilience"},{t:"It can significantly affect my focus and I may need to take personal time",s:2,d:"stress_resilience"},{t:"I tend to channel stress into working harder, sometimes to an unhealthy degree",s:3,d:"stress_resilience"}]},
  {q:"Where do you realistically see your career in three to five years?",opts:[{t:"Growing into a more senior role within this organization",s:0,d:"loyalty_trajectory"},{t:"Building deep expertise that makes me valuable wherever I go",s:1,d:"loyalty_trajectory"},{t:"Exploring opportunities broadly — including roles at other companies or industries",s:2,d:"loyalty_trajectory"},{t:"Honestly, I'm not sure yet and I'm keeping all options open",s:3,d:"loyalty_trajectory"}]},
];

const REMEDIATION={
  credential_leak:"Change the password immediately on the affected service and any other service where you used the same password. Enable two-factor authentication. Use a password manager.",
  email_exposure:"Set up email aliases for future registrations. Monitor for phishing attempts targeting this address.",
  data_broker:"Submit opt-out requests to each data broker. In the EU, submit GDPR deletion requests. Re-check quarterly.",
  social_media:"Audit privacy settings on each platform. Remove personal information from public profiles.",
  dark_web:"Assume the exposed credentials are compromised. Rotate all passwords. Monitor financial accounts.",
  general:"Conduct a full password audit. Enable 2FA on all critical accounts. Set up credit monitoring. Review app permissions.",
};

// ── UTILITY COMPONENTS ───────────────────────────────────────────────
function Badge({severity:s,label:l}){const m={critical:[C.critical,C.criticalDim],high:[C.high,C.highDim],medium:[C.medium,C.mediumDim],low:[C.low,C.lowDim],info:[C.info,C.infoDim]};const[f,b]=m[s]||[C.textSec,C.bgInput];
return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:3,fontSize:10,fontWeight:500,fontFamily:mono,textTransform:"uppercase",letterSpacing:".8px",color:f,background:b}}>{s==="critical"&&<span style={{width:4,height:4,borderRadius:"50%",background:f,animation:"pulse 2s infinite"}}/>}{l||s}</span>;}
function Metric({label:l,value:v,sub:s,severity:sv,delay:d=0}){return <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"20px 22px",animation:`fadeIn 0.5s ease ${d}s both`}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:10,color:C.textDim,fontFamily:mono,textTransform:"uppercase",letterSpacing:"1.2px"}}>{l}</span>{sv&&<Badge severity={sv}/>}</div>
<div style={{fontSize:28,fontWeight:200,fontFamily:serif,lineHeight:1,letterSpacing:"-0.5px"}}>{v}</div>{s&&<div style={{fontSize:10,color:C.textDim,marginTop:8,fontFamily:mono}}>{s}</div>}</div>;}
function SH({title:t,subtitle:s}){return <div style={{marginBottom:24}}><h2 style={{fontSize:24,fontWeight:300,fontFamily:serif,letterSpacing:"-0.3px"}}>{t}</h2>{s&&<p style={{color:C.textDim,fontSize:13,marginTop:6,fontWeight:200,lineHeight:1.5}}>{s}</p>}<div style={{width:32,height:1,background:C.gold,marginTop:14,opacity:.4}}/></div>;}
function Card({children:ch,highlight:hi,style:s,onClick:oc}){const[h,setH]=useState(false);return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={oc} style={{background:C.bgCard,border:`1px solid ${hi?"rgba(196,162,101,0.25)":h?C.borderHover:C.border}`,borderRadius:4,transition:"border-color 0.2s",cursor:oc?"pointer":"default",...s}}>{ch}</div>;}
function GoldBtn({children:ch,onClick:oc,full:f,small:sm,disabled:di}){const[h,setH]=useState(false);return <button onClick={oc} disabled={di} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:sm?"8px 18px":"14px 28px",border:`1px solid ${di?C.border:C.gold}`,borderRadius:3,background:h&&!di?C.goldDim:"transparent",color:di?C.textDim:C.gold,fontSize:sm?10:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:di?"default":"pointer",transition:"all 0.3s",width:f?"100%":"auto",opacity:di?.5:1}}>{ch}</button>;}
function InputField({placeholder:p,value:v,onChange:oc,mono:im,area:a,onKeyDown:okd,label:lb}){const s={width:"100%",padding:a?"14px 18px":"12px 18px",background:C.bgInput,border:`1px solid ${C.border}`,borderRadius:3,color:C.text,fontSize:13,fontFamily:im?mono:sans,outline:"none",fontWeight:300,transition:"border-color 0.3s",resize:a?"vertical":"none"};
return <div>{lb&&<div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:6}}>{lb}</div>}
{a?<textarea style={{...s,minHeight:100}} placeholder={p} value={v} onChange={oc} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
:<input style={s} placeholder={p} value={v} onChange={oc} onKeyDown={okd} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>}</div>;}
function TabBar({tabs:t,active:a,onChange:oc}){return <div style={{display:"flex",gap:1,marginBottom:24,background:C.bgCard,borderRadius:3,padding:3,border:`1px solid ${C.border}`,width:"fit-content",flexWrap:"wrap"}}>{t.map(([k,l])=><button key={k} onClick={()=>oc(k)} style={{padding:"8px 20px",border:"none",borderRadius:2,fontSize:12,fontWeight:400,cursor:"pointer",fontFamily:sans,transition:"all 0.2s",background:a===k?C.gold:"transparent",color:a===k?C.bg:C.textSec,letterSpacing:".3px"}}>{l}</button>)}</div>;}
function RemediationBox({text}){const[open,setOpen]=useState(false);return <div style={{marginTop:10}}>
  <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer",fontFamily:mono,letterSpacing:"1px"}}>{open?"HIDE":"SHOW"} REMEDIATION</button>
  {open&&<div style={{marginTop:8,padding:"12px 16px",background:C.bgInput,borderRadius:3,border:`1px solid ${C.border}`,fontSize:12,color:C.textSec,lineHeight:1.7,fontWeight:200}}>{text}</div>}
</div>;}
function SpyLogo({size="normal"}){const sz=size==="small"?{fs:18,sub:7,gap:2}:size==="large"?{fs:56,sub:9,gap:6}:{fs:22,sub:7,gap:3};
  return <div style={{display:"flex",alignItems:"baseline",gap:sz.gap}}><span style={{fontSize:sz.fs,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px",lineHeight:1}}>Spy</span>{size!=="small"&&<span style={{fontSize:sz.sub,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span>}</div>;}
function Loader({text}){return <Card style={{padding:40,textAlign:"center"}}><div style={{fontSize:12,color:C.gold,fontFamily:mono,letterSpacing:"2px",marginBottom:16,textTransform:"uppercase"}}>{text||"Processing..."}</div>
  <div style={{width:200,height:2,background:C.border,margin:"0 auto",borderRadius:1,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",width:"40%",height:"100%",background:C.gold,animation:"scanline 1.5s ease infinite"}}/></div></Card>;}

// ── WORLD MAP ────────────────────────────────────────────────────────
function WorldMap({zones,sel,onSelect}){
  const tx=l=>((l+180)/360)*800,ty=l=>((90-l)/180)*450;
  const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
  const continents=[
    "M33,45 L55,55 L71,68 L89,75 L100,77 L116,100 L122,112 L124,120 L130,130 L140,143 L155,158 L167,170 L178,175 L187,180 L200,185 L207,188 L218,200 L229,185 L222,170 L220,163 L222,150 L225,140 L233,133 L240,125 L244,120 L250,112 L256,108 L264,100 L273,95 L270,85 L260,78 L256,75 L240,70 L229,68 L215,67 L200,68 L189,72 L178,75 L155,73 L133,72 L110,70 L89,68 L78,58 L60,48 Z",
    "M218,200 L224,210 L230,213 L245,218 L260,222 L278,225 L295,228 L310,235 L322,245 L318,258 L316,263 L310,275 L307,283 L300,293 L293,300 L280,310 L273,318 L262,328 L256,335 L248,345 L244,352 L240,358 L235,348 L238,335 L240,320 L242,305 L244,290 L244,275 L242,260 L240,250 L236,240 L231,230 L226,220 L222,210 Z",
    "M380,130 L382,122 L385,115 L392,112 L398,108 L404,105 L408,100 L404,95 L398,88 L393,82 L396,78 L404,72 L412,68 L420,62 L430,58 L440,55 L450,52 L458,55 L464,60 L466,68 L465,78 L462,85 L460,92 L458,98 L455,105 L460,110 L465,118 L462,125 L456,132 L450,135 L442,133 L436,128 L430,122 L424,118 L418,115 L412,113 L406,115 L400,118 L394,122 L388,128 L384,132 Z",
    "M372,148 L380,142 L390,138 L400,136 L412,135 L425,136 L440,138 L450,140 L458,142 L465,148 L470,155 L474,162 L478,170 L482,178 L486,185 L492,192 L498,196 L504,200 L510,198 L505,204 L498,208 L492,215 L488,225 L484,238 L480,250 L476,260 L470,270 L464,278 L458,285 L450,292 L442,298 L436,305 L432,310 L440,312 L448,310 L456,308 L462,310 L458,316 L448,318 L438,318 L430,315 L420,312 L410,308 L402,302 L395,296 L388,288 L382,278 L378,268 L375,255 L373,245 L372,232 L370,220 L368,208 L366,198 L366,188 L368,175 L370,162 Z",
    "M465,118 L472,115 L480,112 L490,108 L500,105 L515,100 L530,95 L545,88 L560,80 L580,72 L600,62 L620,55 L640,50 L660,48 L680,50 L700,55 L718,58 L730,62 L740,65 L748,68 L752,72 L748,78 L740,85 L730,88 L720,92 L714,98 L710,105 L705,112 L700,118 L695,125 L690,130 L682,132 L676,135 L670,140 L665,148 L660,152 L650,158 L640,165 L632,172 L624,178 L618,185 L610,188 L602,185 L596,178 L590,172 L582,168 L576,165 L570,170 L565,178 L560,185 L555,192 L550,198 L545,195 L540,188 L535,180 L530,175 L525,170 L520,165 L515,162 L510,158 L505,155 L500,150 L495,145 L490,140 L485,135 L478,128 L472,122 Z",
    "M555,155 L565,150 L575,150 L585,152 L592,158 L596,165 L596,172 L590,180 L582,190 L575,200 L570,205 L565,200 L560,192 L555,182 L552,172 L552,162 Z",
    "M642,238 L652,232 L665,228 L680,228 L695,230 L708,235 L718,242 L725,252 L728,262 L726,272 L720,280 L712,286 L702,290 L690,292 L678,290 L666,286 L656,278 L648,268 L644,258 L640,248 Z",
    "M388,78 L392,72 L396,70 L398,74 L396,80 L393,85 L390,88 L386,85 Z",
    "M710,108 L715,102 L718,108 L716,118 L712,128 L708,125 L710,115 Z",
    "M280,32 L295,28 L310,25 L325,28 L335,35 L338,45 L335,55 L328,62 L318,66 L305,68 L292,65 L282,58 L278,48 L276,40 Z",
    "M628,215 L640,212 L652,215 L665,218 L678,222 L688,228 L678,230 L665,228 L652,225 L638,222 Z",
    "M474,148 L482,142 L492,140 L500,145 L508,152 L515,160 L520,168 L515,175 L508,180 L500,182 L492,180 L486,176 L480,168 L476,160 Z",
  ];
  return <svg viewBox="0 0 800 450" style={{width:"100%",background:C.bgCard,borderRadius:4}}>
    <defs><linearGradient id="mapGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.gold} stopOpacity="0.03"/><stop offset="100%" stopColor={C.gold} stopOpacity="0.01"/></linearGradient></defs>
    <rect width="800" height="450" fill="url(#mapGlow)"/>
    {Array.from({length:17},(_,i)=><line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2={450} stroke={C.border} strokeWidth={.3} opacity={.4}/>)}
    {Array.from({length:10},(_,i)=><line key={`h${i}`} x1={0} y1={i*50} x2={800} y2={i*50} stroke={C.border} strokeWidth={.3} opacity={.4}/>)}
    {continents.map((d,i)=><path key={i} d={d} fill="rgba(196,162,101,0.04)" stroke="rgba(196,162,101,0.12)" strokeWidth={.5} strokeLinejoin="round"/>)}
    {zones.map(z=>{const cx=tx(z.lng),cy=ty(z.lat),c=tc[z.type]||C.medium,s=sel?.id===z.id;
      return <g key={z.id} onClick={()=>onSelect(z)} style={{cursor:"pointer"}}>
        <circle cx={cx} cy={cy} r={s?20:14} fill={c} opacity={.06}><animate attributeName="r" values={`${s?20:14};${s?30:22};${s?20:14}`} dur="3s" repeatCount="indefinite"/></circle>
        <circle cx={cx} cy={cy} r={s?4:2.5} fill={c} opacity={.9}/>{s&&<circle cx={cx} cy={cy} r={7} fill="none" stroke={c} strokeWidth={.8} opacity={.5}/>}
      </g>;})}
  </svg>;
}

// ── PAGE COMPONENTS ─────────────────────────────────────────────────
function PgOsint({isDemo}){
  const[q,setQ]=useState("");const[t,setT]=useState("email");const[scanning,setScanning]=useState(false);const[results,setResults]=useState(null);const[error,setError]=useState("");
  const doSearch=async()=>{if(!q.trim())return;
    if(isDemo){setError("OSINT search requires a paid account. This is a demo.");return;}
    setScanning(true);setResults(null);setError("");
    try{const data=await apiOsint(q,t);
      if(!data){setError("Search failed. Check your connection.");setScanning(false);return;}
      setResults({query:q,type:t,...data});
    }catch(e){setError("Search failed.");}
    setScanning(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="OSINT Search" subtitle="AI-powered live intelligence gathering across public databases, social platforms, and breach repositories."/>
    <TabBar tabs={[["email","Email"],["username","Username"],["domain","Domain"],["phone","Phone"],["ip","IP Address"],["company","Company"]]} active={t} onChange={k=>{setT(k);setResults(null)}}/>
    <div style={{display:"flex",gap:12,marginBottom:32}}>
      <InputField mono placeholder={{email:"Enter email address",username:"Enter username",domain:"Enter domain",phone:"Enter phone number",ip:"Enter IP address",company:"Enter company name"}[t]} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}/>
      <GoldBtn onClick={doSearch} disabled={scanning}>{scanning?"Scanning...":"Search"}</GoldBtn>
    </div>
    {scanning&&<Loader text="Conducting live intelligence search"/>}
    {error&&<Card style={{padding:20,borderColor:"rgba(196,92,92,0.3)"}}><div style={{color:C.critical,fontSize:13}}>{error}</div></Card>}
    {results&&<div style={{animation:"fadeIn 0.4s ease"}}>
      <Card style={{padding:24,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase"}}>Intelligence Report</div>
          <span style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{new Date(results.timestamp).toLocaleString()}</span>
        </div>
        <div style={{fontSize:12,color:C.textDim,fontFamily:mono}}>Query: {results.query} ({results.type})</div>
      </Card>
      <Card style={{padding:24}}>
        <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{results.analysis}</div>
      </Card>
      <Card style={{padding:16,marginTop:12,borderColor:"rgba(196,162,101,0.15)"}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,marginBottom:6}}>GENERAL REMEDIATION</div>
        <div style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{REMEDIATION.general}</div>
      </Card>
    </div>}
    {!scanning&&!results&&!error&&<Card style={{padding:48,textAlign:"center"}}><div style={{fontSize:28,fontFamily:serif,fontWeight:300,marginBottom:10,color:C.textSec}}>Ready</div>
      <div style={{fontSize:13,color:C.textDim,fontWeight:200,maxWidth:420,margin:"0 auto",lineHeight:1.6}}>Enter a query to conduct a live AI-powered intelligence search.</div></Card>}
  </div>;
}

function PgIntel(){
  const[sector,setSector]=useState("All Sectors");const[news,setNews]=useState([]);const[loading,setLoading]=useState(false);const[loaded,setLoaded]=useState(false);
  const fetchNews=async()=>{setLoading(true);const data=await apiIntel();setNews(data);setLoading(false);setLoaded(true);};
  useEffect(()=>{if(!loaded)fetchNews();},[]);
  const[filter,setFilter]=useState("all");
  const cats=["all","vulnerability","threat-actor","ransomware","nation-state","policy","data-breach","geopolitical"];
  const filtered=news.filter(n=>(sector==="All Sectors"||n.sector===sector)&&(filter==="all"||n.category===filter));
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Intelligence Feed" subtitle="Live cybersecurity news from real sources."/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><span style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim,textTransform:"uppercase",marginBottom:8,display:"block"}}>Sector Focus</span>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{SECTORS.map(s=><button key={s} onClick={()=>setSector(s)} style={{padding:"6px 16px",border:`1px solid ${sector===s?C.gold:C.border}`,borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:sans,background:sector===s?C.goldDim:"transparent",color:sector===s?C.gold:C.textDim,transition:"all 0.2s",fontWeight:300}}>{s}</button>)}</div></div>
      <GoldBtn small onClick={fetchNews} disabled={loading}>{loading?"Refreshing...":"Refresh Feed"}</GoldBtn>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>{cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 14px",border:`1px solid ${filter===c?C.gold:C.border}`,borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:sans,background:filter===c?C.goldDim:"transparent",color:filter===c?C.gold:C.textDim,textTransform:"capitalize",fontWeight:300}}>{c==="all"?"All":c.replace("-"," ")}</button>)}</div>
    {loading&&<Loader text="Fetching live intelligence"/>}
    {!loading&&filtered.map((n,i)=><Card key={i} onClick={()=>n.url&&n.url!=="#"&&window.open(n.url,"_blank")} style={{padding:20,marginBottom:6,cursor:n.url&&n.url!=="#"?"pointer":"default",animation:`fadeIn 0.3s ease ${i*.03}s both`}}>
      <div style={{display:"flex",gap:8,marginBottom:6}}><Badge severity={n.severity||"info"}/><span style={{fontSize:10,fontFamily:mono,letterSpacing:"1px",color:C.textDim,textTransform:"uppercase"}}>{(n.category||"").replace("-"," ")}</span>{n.sector&&<span style={{fontSize:10,fontFamily:mono,color:C.gold,opacity:.6}}>— {n.sector}</span>}</div>
      <div style={{fontSize:14,fontWeight:500,marginBottom:5,lineHeight:1.4}}>{n.title}</div>
      <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.55}}>{n.summary}</div>
      <div style={{display:"flex",gap:10,marginTop:10,fontSize:10,color:C.textDim,fontFamily:mono}}><span>{n.source}</span><span>—</span><span>{n.time}</span></div>
    </Card>)}
  </div>;
}

function PgBreaches({user,isDemo}){
  const[email,setEmail]=useState(user?.email||"");const[breaches,setBreaches]=useState([]);const[scanning,setScanning]=useState(false);const[scanned,setScanned]=useState(false);
  const scan=async()=>{if(!email.trim())return;
    if(isDemo){return;}
    setScanning(true);setBreaches([]);
    const data=await apiBreaches(email);
    setBreaches(data?.breaches||[]);
    setScanning(false);setScanned(true);};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="Breach Monitor" subtitle="Search for credential leaks across breach databases and paste sites."/>
    <div style={{display:"flex",gap:12,marginBottom:24}}>
      <InputField mono placeholder="Enter email address" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}/>
      <GoldBtn onClick={scan} disabled={scanning}>{scanning?"Scanning...":"Check Breaches"}</GoldBtn>
    </div>
    {scanning&&<Loader text="Searching breach databases"/>}
    {scanned&&!scanning&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        <Metric label="Total Found" value={breaches.length} severity={breaches.length>3?"critical":"medium"} delay={.05}/>
        <Metric label="Action Required" value={breaches.filter(b=>b.status==="action_required").length} severity="high" delay={.1}/>
        <Metric label="Resolved" value={breaches.filter(b=>b.status==="resolved").length} delay={.15}/>
        <Metric label="Monitoring" value={breaches.filter(b=>b.status==="monitoring").length} delay={.2}/>
      </div>
      {breaches.map((b,i)=><Card key={i} highlight={b.status==="action_required"} style={{padding:20,marginBottom:6,animation:`fadeIn 0.3s ease ${i*.05}s both`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}><span style={{fontSize:15,fontWeight:500}}>{b.source}</span><Badge severity={b.severity||"medium"}/></div>
          <span style={{fontSize:10,fontFamily:mono,letterSpacing:"1px",textTransform:"uppercase",color:b.status==="action_required"?C.critical:b.status==="resolved"?C.low:C.high}}>{(b.status||"unknown").replace("_"," ")}</span></div>
        <div style={{display:"flex",gap:28,fontSize:12,color:C.textSec,fontWeight:200}}>
          <span>Exposed: <span style={{color:C.text}}>{b.type||"Unknown"}</span></span>
          {b.records&&<span>Records: <span style={{fontFamily:mono}}>{b.records}</span></span>}
          <span>Date: <span style={{fontFamily:mono}}>{b.date||"Unknown"}</span></span>
        </div>
        <RemediationBox text={b.remediation||REMEDIATION.credential_leak}/>
      </Card>)}
    </>}
    {!scanned&&!scanning&&<Card style={{padding:48,textAlign:"center"}}><div style={{fontSize:28,fontFamily:serif,fontWeight:300,marginBottom:10,color:C.textSec}}>Enter an email to scan</div></Card>}
  </div>;
}

function PgDecoy(){
  const canvasRef=useRef(null);const[file,setFile]=useState(null);const[preview,setPreview]=useState(null);const[payload,setPayload]=useState("");const[encoded,setEncoded]=useState(null);const[status,setStatus]=useState("");const[extractedMsg,setExtractedMsg]=useState("");
  const handleFile=e=>{const f=e.target.files?.[0];if(!f)return;setFile(f);setEncoded(null);setStatus("");setExtractedMsg("");const r=new FileReader();r.onload=ev=>setPreview(ev.target.result);r.readAsDataURL(f);};
  const embedPayload=()=>{if(!preview||!payload.trim())return;setStatus("Embedding...");
    const img=new Image();img.onload=()=>{const cv=canvasRef.current;cv.width=img.width;cv.height=img.height;const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);
      const idata=ctx.getImageData(0,0,cv.width,cv.height);const d=idata.data;const msg=payload+"\0";const bits=[];
      for(let i=0;i<32;i++)bits.push((msg.length>>i)&1);
      for(let i=0;i<msg.length;i++)for(let b=0;b<8;b++)bits.push((msg.charCodeAt(i)>>b)&1);
      for(let i=0;i<bits.length&&i*4<d.length;i++){d[i*4]=(d[i*4]&0xFE)|bits[i];}
      ctx.putImageData(idata,0,0);setEncoded(cv.toDataURL("image/png"));setStatus(`Embedded ${payload.length} chars into ${img.width}x${img.height} image.`);
    };img.src=preview;};
  const extractPayload=()=>{if(!encoded)return;
    const img=new Image();img.onload=()=>{const cv=document.createElement("canvas");cv.width=img.width;cv.height=img.height;const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);
      const d=ctx.getImageData(0,0,cv.width,cv.height).data;let len=0;for(let i=0;i<32;i++)len|=(d[i*4]&1)<<i;
      if(len<=0||len>10000){setExtractedMsg("No valid payload detected.");return;}
      let msg="";for(let i=0;i<len-1;i++){let ch=0;for(let b=0;b<8;b++)ch|=(d[(32+i*8+b)*4]&1)<<b;msg+=String.fromCharCode(ch);}
      setExtractedMsg(msg);};img.src=encoded;};
  const downloadEncoded=async()=>{if(!encoded)return;try{const blob=await(await fetch(encoded)).blob();const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="spy-watermarked-"+Date.now()+".png";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){window.open("")?.document.write(`<img src="${encoded}"/><br><p>Right-click to save.</p>`);}};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="Decoy Deployment" subtitle="Embed invisible cryptographic tracking data into images using LSB steganography."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card style={{padding:28}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>1. Upload Image</div>
        <label style={{display:"block",padding:32,border:`1px dashed ${C.border}`,borderRadius:4,textAlign:"center",cursor:"pointer"}}>
          <input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
          <div style={{fontSize:13,color:C.textSec,fontWeight:200}}>{file?file.name:"Click to select an image"}</div>
        </label>
        {preview&&<img src={preview} style={{width:"100%",maxHeight:200,objectFit:"contain",marginTop:16,borderRadius:4,border:`1px solid ${C.border}`}}/>}
        <div style={{marginTop:16}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>2. Tracking Payload</div>
          <InputField mono placeholder="e.g. DOC-2026-CONFIDENTIAL-RECIPIENT-ACME" value={payload} onChange={e=>setPayload(e.target.value)}/>
        </div>
        <div style={{marginTop:16}}><GoldBtn full onClick={embedPayload} disabled={!preview||!payload.trim()}>Embed Tracking Payload</GoldBtn></div>
      </Card>
      <Card style={{padding:28}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>3. Result</div>
        <canvas ref={canvasRef} style={{display:"none"}}/>
        {encoded?<>
          <img src={encoded} style={{width:"100%",maxHeight:200,objectFit:"contain",borderRadius:4,border:`1px solid ${C.gold}`,marginBottom:16}}/>
          <div style={{fontSize:12,color:C.low,fontFamily:mono,marginBottom:12}}>Payload embedded</div>
          <div style={{fontSize:11,color:C.textDim,fontWeight:200,lineHeight:1.6,marginBottom:16}}>{status}</div>
          <div style={{display:"flex",gap:8,marginBottom:16}}><GoldBtn full onClick={downloadEncoded}>Download</GoldBtn></div>
          <GoldBtn full onClick={extractPayload} small>Verify: Extract Payload</GoldBtn>
          {extractedMsg&&<div style={{marginTop:12,padding:"10px 14px",background:C.bgInput,borderRadius:3,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontFamily:mono,color:C.gold,marginBottom:4}}>EXTRACTED:</div>
            <div style={{fontSize:12,fontFamily:mono,color:C.text,wordBreak:"break-all"}}>{extractedMsg}</div>
          </div>}
        </>:<div style={{padding:40,textAlign:"center",border:`1px dashed ${C.border}`,borderRadius:4}}>
          <div style={{fontSize:14,color:C.textSec,fontWeight:200}}>Watermarked image will appear here</div>
        </div>}
      </Card>
    </div>
  </div>;
}

// ── CPIR (FIXED — hooks at top level, not inside conditionals) ──────
function PgCPIR(){
  const[mode,setMode]=useState("select");
  const[started,setStarted]=useState(false);const[qi,setQi]=useState(0);const[answers,setAnswers]=useState({});const[done,setDone]=useState(false);
  const[empName,setEmpName]=useState("");const[empDept,setEmpDept]=useState("");const[assessCode,setAssessCode]=useState("");
  const[mgrPin,setMgrPin]=useState("");const[mgrAuth,setMgrAuth]=useState(false);const[allResults,setAllResults]=useState([]);
  const[shuffledOpts,setShuffledOpts]=useState({});
  const[distEmails,setDistEmails]=useState("");const[distSending,setDistSending]=useState(false);const[distSent,setDistSent]=useState(false);
  // FIX: useState for result moved to top level (was inside if(done) — React Error #310)
  const[cpirResult,setCpirResult]=useState(null);
  const newCodeRef=useRef("CPIR-"+Math.random().toString(36).substring(2,8).toUpperCase());

  const startAssessment=()=>{
    const shuffled={};CPIR_QUESTIONS.forEach((cq,i)=>{const indices=[...Array(cq.opts.length).keys()];for(let j=indices.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[indices[j],indices[k]]=[indices[k],indices[j]];}shuffled[i]=indices;});
    setShuffledOpts(shuffled);setStarted(true);setQi(0);setAnswers({});setDone(false);setCpirResult(null);
  };
  const answer=(origIdx)=>{const na={...answers,[qi]:origIdx};setAnswers(na);if(qi<CPIR_QUESTIONS.length-1)setTimeout(()=>setQi(qi+1),300);else setDone(true);};

  const saveResult=useCallback(async()=>{
    const dims={};CPIR_QUESTIONS.forEach((cq,i)=>{const a=answers[i];if(a!==undefined){const opt=cq.opts[a];dims[opt.d]=(dims[opt.d]||0)+opt.s;}});
    const maxScore=CPIR_QUESTIONS.length*3;const totalScore=Object.values(dims).reduce((s,v)=>s+v,0);const risk=totalScore/maxScore;
    return {name:empName||"Anonymous",dept:empDept||"Unspecified",code:assessCode,dims,risk,riskLabel:risk<.25?"Low":risk<.45?"Moderate":risk<.65?"Elevated":"High",date:new Date().toISOString(),answers};
  },[answers,empName,empDept,assessCode]);

  useEffect(()=>{if(done&&!cpirResult){saveResult().then(r=>setCpirResult(r));}},
  [done,cpirResult,saveResult]);

  const loadManagerResults=async()=>{
    try{const r=await fetch("/api/cpir");if(r.ok){const data=await r.json();setAllResults(data);}}catch(e){setAllResults([]);}
    setMgrAuth(true);
  };

  const genCode=()=>"CPIR-"+Math.random().toString(36).substring(2,8).toUpperCase();

  // Done screen
  if(done){
    if(!cpirResult) return <Loader text="Processing assessment results"/>;
    const riskColor=cpirResult.risk<.25?C.low:cpirResult.risk<.45?C.medium:cpirResult.risk<.65?C.high:C.critical;
    return <div style={{animation:"fadeIn 0.4s ease"}}>
      <SH title="Assessment Complete" subtitle="Results have been recorded."/>
      <Card style={{padding:32,marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24}}>
          <div style={{position:"relative",width:80,height:80}}>
            <svg viewBox="0 0 100 100" style={{transform:"rotate(-90deg)"}}><circle cx={50} cy={50} r={42} fill="none" stroke={C.border} strokeWidth={4}/><circle cx={50} cy={50} r={42} fill="none" stroke={riskColor} strokeWidth={4} strokeDasharray={`${2*Math.PI*42*cpirResult.risk} ${2*Math.PI*42}`} strokeLinecap="round"/></svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontFamily:serif,color:riskColor}}>{Math.round(cpirResult.risk*100)}</div>
          </div>
          <div><div style={{fontSize:18,fontFamily:serif,fontWeight:400}}>Risk Index: <span style={{color:riskColor}}>{cpirResult.riskLabel}</span></div>
            <div style={{fontSize:12,color:C.textDim,fontWeight:200,marginTop:4}}>Based on {CPIR_QUESTIONS.length} psychometric indicators</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {Object.entries(cpirResult.dims).map(([k,v])=><div key={k} style={{background:C.bgInput,borderRadius:3,padding:"10px 14px",fontSize:11}}>
            <div style={{color:C.textDim,fontFamily:mono,fontSize:9,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>{k.replace(/_/g," ")}</div>
            <div style={{width:"100%",height:3,background:C.border,borderRadius:1}}><div style={{width:`${(v/3)*100}%`,height:"100%",background:v>2?C.critical:v>1?C.high:C.low,borderRadius:1}}/></div>
          </div>)}
        </div>
      </Card>
      <GoldBtn onClick={()=>{setMode("select");setStarted(false);setDone(false);setQi(0);setAnswers({});setCpirResult(null);}}>Return</GoldBtn>
    </div>;
  }

  if(mode==="select") return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="CPIR Module" subtitle="Continuous Psychological Indicator Report — Employee assessment and manager analytics."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
      <Card style={{padding:32}} onClick={()=>setMode("employee")}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Employee Assessment</div>
        <h3 style={{fontSize:20,fontFamily:serif,fontWeight:400,marginBottom:12}}>Workplace Engagement Survey</h3>
        <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>{CPIR_QUESTIONS.length} questions, approximately 5 minutes.</p>
        <div style={{marginTop:16}}><GoldBtn small onClick={e=>{e.stopPropagation();setMode("employee");}}>Begin Assessment</GoldBtn></div>
      </Card>
      <Card style={{padding:32}} onClick={()=>setMode("distribute")}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Distribute</div>
        <h3 style={{fontSize:20,fontFamily:serif,fontWeight:400,marginBottom:12}}>Send via Email</h3>
        <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Send survey invitations to employees.</p>
        <div style={{marginTop:16}}><GoldBtn small onClick={e=>{e.stopPropagation();setMode("distribute");}}>Send Invitations</GoldBtn></div>
      </Card>
      <Card style={{padding:32}} onClick={()=>setMode("manager")}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Manager Panel</div>
        <h3 style={{fontSize:20,fontFamily:serif,fontWeight:400,marginBottom:12}}>Assessment Analytics</h3>
        <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>View all completed assessments and risk distributions.</p>
        <div style={{marginTop:16}}><GoldBtn small onClick={e=>{e.stopPropagation();setMode("manager");}}>Access Panel</GoldBtn></div>
      </Card>
    </div>
  </div>;

  if(mode==="distribute"){
    const sendInvitations=async()=>{if(!distEmails.trim())return;setDistSending(true);
      const emails=distEmails.split("\n").map(e=>e.trim()).filter(Boolean);
      for(const email of emails){try{await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID||"mvzvdjrq"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_subject:"[Spy by Atlas] Workplace Engagement Survey",to:email,message:"You have been selected to complete a Workplace Engagement Survey.",timestamp:new Date().toISOString()})});}catch(e){}}
      setDistSending(false);setDistSent(true);};
    return <div style={{animation:"fadeIn 0.4s ease"}}>
      <SH title="Distribute Assessment" subtitle="Send the survey to employees via email."/>
      <Card style={{padding:32,maxWidth:600}}>
        {distSent?<div>
          <div style={{fontSize:14,color:C.low,fontFamily:mono,marginBottom:12}}>Invitations sent</div>
          <div style={{display:"flex",gap:8}}><GoldBtn onClick={()=>{setDistSent(false);setDistEmails("");setMode("select")}}>Back</GoldBtn><GoldBtn small onClick={()=>{setDistSent(false);setDistEmails("")}}>Send More</GoldBtn></div>
        </div>:<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <InputField area placeholder={"employee1@company.com\nemployee2@company.com"} value={distEmails} onChange={e=>setDistEmails(e.target.value)}/>
          <GoldBtn full onClick={sendInvitations} disabled={distSending||!distEmails.trim()}>{distSending?"Sending...":"Send Invitations"}</GoldBtn>
          <GoldBtn small onClick={()=>setMode("select")}>Cancel</GoldBtn>
        </div>}
      </Card>
    </div>;
  }

  if(mode==="manager"){
    if(!mgrAuth) return <div style={{animation:"fadeIn 0.4s ease"}}>
      <SH title="Manager Panel" subtitle="Enter manager PIN to access analytics."/>
      <Card style={{padding:32,maxWidth:400}}>
        <InputField mono placeholder="Manager PIN (any 4+ digits)" value={mgrPin} onChange={e=>setMgrPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgrPin.length>=4&&loadManagerResults()}/>
        <div style={{marginTop:16}}><GoldBtn full onClick={loadManagerResults} disabled={mgrPin.length<4}>Access Panel</GoldBtn></div>
        <div style={{marginTop:12}}><GoldBtn full small onClick={()=>setMode("select")}>Back</GoldBtn></div>
      </Card>
    </div>;
    const avgRisk=allResults.length?allResults.reduce((s,r)=>s+r.risk,0)/allResults.length:0;
    const riskDist={Low:0,Moderate:0,Elevated:0,High:0};allResults.forEach(r=>riskDist[r.riskLabel]=(riskDist[r.riskLabel]||0)+1);
    return <div style={{animation:"fadeIn 0.4s ease"}}>
      <SH title="Manager Panel" subtitle={`${allResults.length} assessment(s) on record.`}/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <GoldBtn small onClick={()=>setMode("select")}>Back</GoldBtn>
        <GoldBtn small onClick={loadManagerResults}>Refresh</GoldBtn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        <Metric label="Total" value={allResults.length} delay={.05}/>
        <Metric label="Avg Risk" value={Math.round(avgRisk*100)} severity={avgRisk>.5?"high":"medium"} delay={.1}/>
        <Metric label="High Risk" value={(riskDist.High||0)+(riskDist.Elevated||0)} severity="critical" delay={.15}/>
        <Metric label="Low Risk" value={riskDist.Low||0} severity="low" delay={.2}/>
      </div>
      <Card style={{padding:20,marginBottom:16}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>Assessment Code</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontFamily:mono,fontSize:14,color:C.text,padding:"8px 16px",background:C.bgInput,borderRadius:3,border:`1px solid ${C.border}`}}>{newCodeRef.current}</span>
          <GoldBtn small onClick={()=>{newCodeRef.current=genCode();loadManagerResults();}}>Generate New</GoldBtn>
        </div>
      </Card>
      {allResults.length>0&&<Card style={{padding:20}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>Individual Results</div>
        {allResults.map((r,i)=>{const rc=r.risk<.25?C.low:r.risk<.45?C.medium:r.risk<.65?C.high:C.critical;
          return <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{r.name}</div><div style={{fontSize:11,color:C.textDim}}>{r.dept} — {new Date(r.date).toLocaleDateString()}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:13,fontFamily:mono,color:rc}}>{Math.round(r.risk*100)}</span>
              <Badge severity={r.risk<.25?"low":r.risk<.45?"medium":r.risk<.65?"high":"critical"} label={r.riskLabel}/>
            </div>
          </div>;})}
      </Card>}
    </div>;
  }

  // Employee flow — pre-assessment
  if(!started) return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="Workplace Engagement Survey" subtitle="Help us understand workplace dynamics."/>
    <Card style={{padding:32,maxWidth:600}}>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
        <InputField placeholder="Your name (optional)" value={empName} onChange={e=>setEmpName(e.target.value)}/>
        <InputField placeholder="Department (optional)" value={empDept} onChange={e=>setEmpDept(e.target.value)}/>
        <InputField mono placeholder="Assessment code (if provided)" value={assessCode} onChange={e=>setAssessCode(e.target.value)}/>
      </div>
      <div style={{display:"flex",gap:8}}><GoldBtn onClick={startAssessment}>Begin</GoldBtn><GoldBtn small onClick={()=>setMode("select")}>Back</GoldBtn></div>
    </Card>
  </div>;

  // Questions
  const cq=CPIR_QUESTIONS[qi];const order=shuffledOpts[qi]||[0,1,2,3];
  return <div style={{animation:"fadeIn 0.3s ease"}}>
    <SH title="Workplace Engagement Survey" subtitle={`Question ${qi+1} of ${CPIR_QUESTIONS.length}`}/>
    <div style={{width:"100%",height:2,background:C.border,borderRadius:1,marginBottom:28}}><div style={{width:`${((qi+1)/CPIR_QUESTIONS.length)*100}%`,height:"100%",background:C.gold,borderRadius:1,transition:"width 0.3s"}}/></div>
    <Card style={{padding:32,maxWidth:600}}>
      <div style={{fontSize:16,fontFamily:serif,fontWeight:400,marginBottom:24,lineHeight:1.5}}>{cq.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {order.map((origIdx,dispIdx)=>{const opt=cq.opts[origIdx];return <button key={dispIdx} onClick={()=>answer(origIdx)} style={{padding:"14px 20px",background:answers[qi]===origIdx?C.goldDim:C.bgInput,border:`1px solid ${answers[qi]===origIdx?C.gold:C.border}`,borderRadius:4,color:answers[qi]===origIdx?C.gold:C.text,fontSize:13,fontWeight:200,cursor:"pointer",textAlign:"left",fontFamily:sans,transition:"all 0.2s"}}>{opt.t}</button>;})}
      </div>
    </Card>
  </div>;
}

function PgFootprint({isDemo}){
  const[q,setQ]=useState("");const[t,setT]=useState("email");const[scanning,setScanning]=useState(false);const[results,setResults]=useState(null);
  const scan=async()=>{if(!q.trim())return;if(isDemo)return;setScanning(true);setResults(null);
    const data=await apiFootprint(q,t);if(data)setResults({query:q,type:t,...data});setScanning(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="Digital Footprint" subtitle="Complete online exposure analysis."/>
    <TabBar tabs={[["email","Email"],["name","Full Name"],["username","Username"],["phone","Phone"]]} active={t} onChange={setT}/>
    <div style={{display:"flex",gap:12,marginBottom:32}}>
      <InputField mono placeholder={{email:"Enter email",name:"Enter full name",username:"Enter username",phone:"Enter phone"}[t]} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}/>
      <GoldBtn onClick={scan} disabled={scanning}>{scanning?"Scanning...":"Run Scan"}</GoldBtn>
    </div>
    {scanning&&<Loader text="Scanning digital footprint"/>}
    {results&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:14}}>Footprint Report — {results.query}</div>
      <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{results.analysis}</div>
    </Card>}
  </div>;
}

function PgResearch(){
  const[form,setForm]=useState({name:"",email:"",type:"osint",subject:"",description:"",urgency:"standard"});const[sending,setSending]=useState(false);const[sent,setSent]=useState(false);const[error,setError]=useState("");
  const submit=async()=>{if(!form.email||!form.subject||!form.description){setError("Fill in all required fields.");return;}setSending(true);setError("");
    try{const r=await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID||"mvzvdjrq"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,_subject:`[Spy] ${form.type.toUpperCase()} - ${form.subject}`,timestamp:new Date().toISOString()})});
      if(r.ok)setSent(true);else setError("Failed. Try again.");}catch(e){setError("Network error.");}setSending(false);};
  if(sent) return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Research Requests"/><Card style={{padding:32,textAlign:"center"}}><div style={{fontSize:24,fontFamily:serif,color:C.gold,marginBottom:12}}>Submitted</div><GoldBtn onClick={()=>{setSent(false);setForm({name:"",email:"",type:"osint",subject:"",description:"",urgency:"standard"});}}>New Request</GoldBtn></Card></div>;
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Research Requests" subtitle="Commission intelligence research."/>
    <Card style={{padding:28,maxWidth:600}}>
      {error&&<div style={{background:C.criticalDim,borderRadius:3,padding:"10px 16px",marginBottom:12,fontSize:12,color:C.critical}}>{error}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <InputField label="Name" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <InputField label="Email *" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <InputField label="Subject *" placeholder="Brief title" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
        <InputField label="Description *" placeholder="Describe in detail" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} area/>
        <GoldBtn full onClick={submit} disabled={sending}>{sending?"Submitting...":"Submit"}</GoldBtn>
      </div>
    </Card>
  </div>;
}

function PgExecProt({isDemo}){
  const[tab,setTab]=useState("canary");const[canaryName,setCanaryName]=useState("");const[canaryRecipients,setCanaryRecipients]=useState("");const[canaryResults,setCanaryResults]=useState([]);
  const[monitorTarget,setMonitorTarget]=useState("");const[monitorResults,setMonitorResults]=useState(null);const[monitorLoading,setMonitorLoading]=useState(false);
  const generateCanaries=()=>{if(!canaryName.trim()||!canaryRecipients.trim())return;
    const recipients=canaryRecipients.split("\n").filter(r=>r.trim());
    setCanaryResults(recipients.map((r,i)=>({recipient:r.trim(),token:`CTK-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}-${i}`.toUpperCase(),generated:new Date().toISOString(),docName:canaryName})));};
  const runExposure=async()=>{if(!monitorTarget.trim()||isDemo)return;setMonitorLoading(true);
    const data=await apiExecprot(monitorTarget);if(data)setMonitorResults({target:monitorTarget,...data});setMonitorLoading(false);};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="Executive Protection" subtitle="Canary tokens, exposure monitoring, and digital protection."/>
    <TabBar tabs={[["canary","Canary Tokens"],["monitor","Exposure Monitor"]]} active={tab} onChange={setTab}/>
    {tab==="canary"&&<div>
      <Card style={{padding:28}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <InputField label="Document Name" placeholder="e.g. Q1 Strategy Report" value={canaryName} onChange={e=>setCanaryName(e.target.value)}/>
          <InputField label="Recipients (one per line)" placeholder={"John Smith - Board\nJane Doe - CFO"} value={canaryRecipients} onChange={e=>setCanaryRecipients(e.target.value)} area/>
          <GoldBtn onClick={generateCanaries} disabled={!canaryName.trim()||!canaryRecipients.trim()}>Generate Tokens</GoldBtn>
        </div>
      </Card>
      {canaryResults.length>0&&<Card style={{padding:20,marginTop:16}}>
        {canaryResults.map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:13}}>{t.recipient}</span>
          <span style={{fontFamily:mono,fontSize:11,color:C.gold,padding:"4px 12px",background:C.goldDim,borderRadius:3}}>{t.token}</span>
        </div>)}
      </Card>}
    </div>}
    {tab==="monitor"&&<div>
      <div style={{display:"flex",gap:12,marginBottom:24}}>
        <InputField placeholder="Full name" value={monitorTarget} onChange={e=>setMonitorTarget(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runExposure()}/>
        <GoldBtn onClick={runExposure} disabled={monitorLoading}>{monitorLoading?"Scanning...":"Run Assessment"}</GoldBtn>
      </div>
      {monitorLoading&&<Loader text="Conducting exposure assessment"/>}
      {monitorResults&&<Card style={{padding:24,animation:"fadeIn 0.4s ease"}}>
        <div style={{fontSize:10,fontFamily:mono,color:C.gold,textTransform:"uppercase",marginBottom:14}}>Exposure — {monitorResults.target}</div>
        <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{monitorResults.analysis}</div>
      </Card>}
    </div>}
  </div>;
}

function PgWarRoom(){
  const[log,setLog]=useState([
    {time:"14:32",msg:"New credential exposure detected",sev:"critical"},
    {time:"13:15",msg:"Anomalous login from unrecognized IP",sev:"high"},
    {time:"11:48",msg:"Domain reputation change flagged",sev:"medium"},
    {time:"10:02",msg:"Employee monitoring report — 3 anomalies",sev:"high"},
    {time:"08:30",msg:"Daily OSINT sweep complete — no exposures",sev:"low"},
  ]);
  const execCmd=(cmd,detail)=>{setLog([{time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),msg:`[CMD] ${cmd}: ${detail}`,sev:"info"},...log]);};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="War Room" subtitle="Real-time monitoring and command execution."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
      <Metric label="Active Threats" value="7" severity="high" delay={.05}/><Metric label="Monitored Assets" value="34" delay={.1}/><Metric label="Alerts (24h)" value="12" severity="medium" delay={.15}/>
    </div>
    <Card style={{padding:24,marginBottom:16}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Command Actions</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[["Lockdown","Emergency lockdown of all assets"],["Full Scan","Comprehensive OSINT sweep"],["Suppress","Data suppression protocols"],["Escalate","Escalate high+ threats"],["Deploy Decoys","Inject tracking pixels"],["Revoke Access","Revoke compromised credentials"],["Dark Web Sweep","Emergency dark web scan"],["Call Expert","Connect with analyst"]].map(([cmd,desc],i)=>
          <button key={i} onClick={()=>execCmd(cmd,desc)} style={{padding:"14px 16px",background:C.bgInput,border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border}}>
            <div style={{fontSize:12,fontWeight:500,color:C.gold,marginBottom:4}}>{cmd}</div>
            <div style={{fontSize:10,color:C.textDim,fontWeight:200}}>{desc}</div>
          </button>)}
      </div>
    </Card>
    <Card style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:16}}>Activity Log</div>
      {log.map((e,i)=><div key={i} style={{display:"flex",gap:14,padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",animation:i===0?"fadeIn 0.3s ease":"none"}}>
        <span style={{fontSize:11,fontFamily:mono,color:C.textDim,minWidth:42}}>{e.time}</span>
        <Badge severity={e.sev}/><span style={{fontSize:13,fontWeight:200}}>{e.msg}</span>
      </div>)}
    </Card>
  </div>;
}

function PgMap(){const[sel,setSel]=useState(null);const tc={war:C.critical,insurgency:C.high,tension:C.medium,instability:C.high};
  return <div style={{animation:"fadeIn 0.4s ease"}}>
    <SH title="Situation Map" subtitle={`${CONFLICTS.length} active conflicts tracked. Data from CFR, ACLED, ICG.`}/>
    <div style={{display:"flex",gap:20,marginBottom:20}}>
      {[["war","Active War",C.critical],["insurgency","Insurgency",C.high],["tension","Tension",C.medium],["instability","Instability",C.high]].map(([t,l,c])=>
        <div key={t} style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:C.textDim}}><span style={{width:6,height:6,borderRadius:"50%",background:c}}/>{l} ({CONFLICTS.filter(z=>z.type===t).length})</div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:sel?"1fr 320px":"1fr",gap:14,alignItems:"start"}}>
      <div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}><WorldMap zones={CONFLICTS} sel={sel} onSelect={z=>setSel(sel?.id===z.id?null:z)}/></div>
      {sel&&<Card style={{padding:24,animation:"slideIn 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><Badge severity={sel.sev} label={sel.type}/><button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.textDim,fontSize:10,cursor:"pointer",fontFamily:mono}}>Close</button></div>
        <h3 style={{fontSize:20,fontFamily:serif,fontWeight:400,marginBottom:12}}>{sel.name}</h3>
        <p style={{fontSize:13,color:C.textSec,lineHeight:1.65,fontWeight:200,marginBottom:16}}>{sel.desc}</p>
        {[["Began",sel.start],["Casualties",sel.cas],["Sources",sel.src]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`1px solid ${C.border}`,fontSize:12}}><span style={{color:C.textDim}}>{k}</span><span style={{fontFamily:mono,fontSize:11}}>{v}</span></div>)}
      </Card>}
    </div>
    <div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:6}}>
      {CONFLICTS.map((z,i)=><Card key={z.id} onClick={()=>setSel(z)} highlight={sel?.id===z.id} style={{padding:"10px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:5,height:5,borderRadius:"50%",background:tc[z.type]}}/><span style={{fontSize:11,fontWeight:400}}>{z.name}</span></div>
          <Badge severity={z.sev}/>
        </div>
      </Card>)}
    </div>
  </div>;
}

function FP({title:t,subtitle:s,features:f,cta:ct,onCta:oc}){return <div style={{animation:"fadeIn 0.4s ease"}}><SH title={t} subtitle={s}/>
  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:24}}>
    {f.map((x,i)=><Card key={i} style={{padding:24}}>
      <div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>{x.tag}</div>
      <h3 style={{fontSize:16,fontFamily:serif,fontWeight:400,marginBottom:8}}>{x.title}</h3>
      <p style={{fontSize:12,color:C.textDim,fontWeight:200,lineHeight:1.6}}>{x.desc}</p>
      {x.remediation&&<RemediationBox text={x.remediation}/>}
    </Card>)}</div>{ct&&<GoldBtn onClick={oc}>{ct}</GoldBtn>}</div>;}

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
function PgDash({go}){
  return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Command Center" subtitle="Your intelligence briefing."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
      <Metric label="Security Score" value="--" sub="Run a footprint scan to calculate" delay={.05}/>
      <Metric label="Active Conflicts" value={CONFLICTS.filter(z=>z.type==="war").length} delay={.1}/>
      <Metric label="Tracked Zones" value={CONFLICTS.length} delay={.15}/>
      <Metric label="OSINT Searches" value="Ready" severity="info" delay={.2}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
      <Card style={{padding:24}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:18}}>Quick Actions</div>
        {[["Run OSINT Search","osint","Search emails, usernames, domains, IPs"],["Check Breach Exposure","breaches","Scan breach databases"],["Scan Digital Footprint","footprint","Complete exposure analysis"],["Submit Research Request","research","Commission analyst research"],["Deploy Canary Tokens","execprot","Generate tracking tokens"]].map(([t,id,d],i)=>
          <div key={i} onClick={()=>go(id)} style={{padding:"12px 0",borderTop:i>0?`1px solid ${C.border}`:"none",cursor:"pointer"}}><div style={{fontSize:13,fontWeight:400,color:C.gold,marginBottom:2}}>{t}</div><div style={{fontSize:12,color:C.textDim,fontWeight:200}}>{d}</div></div>)}
      </Card>
      <Card style={{padding:24}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:18}}>Live Intelligence</div>
        <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>Open the Intelligence Feed to load live cybersecurity news from real sources.</div>
        <div style={{marginTop:16}}><GoldBtn small onClick={()=>go("intel")}>Open Live Feed</GoldBtn></div>
      </Card>
    </div>
    <Card style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>Global Situation — {CONFLICTS.length} zones</span>
        <button onClick={()=>go("map")} style={{background:"none",border:"none",color:C.gold,fontSize:11,cursor:"pointer"}}>Full map</button>
      </div>
      <WorldMap zones={CONFLICTS} sel={null} onSelect={()=>go("map")}/>
    </Card>
  </div>;
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function SpyDashboard({ user, isDemo }) {
  const[page,setPage]=useState("dash");
  const[collapsed,setCollapsed]=useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    if (isDemo) { router.push("/"); return; }
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const rp=()=>{switch(page){
    case"dash":return <PgDash go={setPage}/>;
    case"warroom":return <PgWarRoom/>;
    case"intel":return <PgIntel/>;
    case"map":return <PgMap/>;
    case"osint":return <PgOsint isDemo={isDemo}/>;
    case"decoy":return <PgDecoy/>;
    case"cpir":return <PgCPIR/>;
    case"breaches":return <PgBreaches user={user} isDemo={isDemo}/>;
    case"research":return <PgResearch/>;
    case"footprint":return <PgFootprint isDemo={isDemo}/>;
    case"execprot":return <PgExecProt isDemo={isDemo}/>;
    case"docintel":return <FP title="Document Intelligence" subtitle="Fuzzy-hash leak detection." features={[
      {tag:"Fuzzy Hash",title:"SSDeep & TLSH Matching",desc:"Detects modified, reformatted, translated documents.",remediation:"Register hashes before distribution."},
      {tag:"Severity",title:"Automated Classification",desc:"Source code (critical), financial data (critical), strategy (high).",remediation:"Classify all documents before distribution."},
      {tag:"Metadata",title:"Internal Source Tracing",desc:"Extracts author, creation date, last editor from leaked documents.",remediation:"Sanitize metadata before sharing."},
      {tag:"Monitoring",title:"Continuous Watch",desc:"24/7 monitoring. Instant alerts on paste sites and dark web.",remediation:"Maintain hash registry. Review monthly."},
    ]} cta="Upload Document Hash"/>;
    case"suppress":return <FP title="Data Suppression" subtitle="Automated takedown and search result burial." features={[
      {tag:"DMCA/GDPR",title:"Automated Takedowns",desc:"AI agents fire instant takedown notices.",remediation:"Document exposed URLs. File within 24h."},
      {tag:"SEO Burial",title:"Link Suppression",desc:"Automated SEO networks push negative links deep.",remediation:"Monitor search results weekly."},
      {tag:"Monitor",title:"Continuous Watch",desc:"24/7 monitoring for re-surfacing.",remediation:"Set alerts for re-publications."},
      {tag:"Reports",title:"Effectiveness Tracking",desc:"Success rates, time-to-removal, quarterly trends.",remediation:"Review suppression effectiveness quarterly."},
    ]} cta="Request Suppression"/>;
    case"predict":return <FP title="Threat Prediction" subtitle="Pattern-of-life analysis." features={[
      {tag:"Pattern",title:"Behavioral Baseline",desc:"Input routines, travel, digital habits.",remediation:"Update quarterly."},
      {tag:"Predictive",title:"Threat Forecasting",desc:"Cross-reference with global threat intelligence.",remediation:"Review forecasts weekly."},
      {tag:"Anomaly",title:"Deviation Alerts",desc:"Unexpected logins, travel to high-risk zones.",remediation:"Investigate within 4 hours."},
      {tag:"Actions",title:"Preemptive Recommendations",desc:"Route changes, credential rotations.",remediation:"Implement high-priority within 24h."},
    ]} cta="Configure Pattern of Life"/>;
    case"insider":return <FP title="Insider Threats" subtitle="Radius of influence, sentiment analysis." features={[
      {tag:"Radius",title:"Network Mapping",desc:"Maps employee influence networks.",remediation:"Review quarterly."},
      {tag:"Sentiment",title:"Linguistic Intelligence",desc:"NLP sentiment analysis on communications.",remediation:"Address trends through management."},
      {tag:"CPIR",title:"Psychological Modeling",desc:"15-dimension assessment.",remediation:"Conduct quarterly."},{tag:"Risk Score",title:"Insider Threat Index",desc:"Composite score.",remediation:"Review elevated scores with HR."},
    ]} cta="Deploy Assessment" onCta={()=>setPage("cpir")}/>;
    case"employee":return <FP title="Employee Monitoring" subtitle="Continuous digital monitoring." features={[
      {tag:"Continuous",title:"Exposure Tracking",desc:"Monitors across breach databases.",remediation:"Notify within 24h."},
      {tag:"Weekly",title:"Automated Reports",desc:"Monday reports on all employees.",remediation:"Review every Monday."},
      {tag:"Anomaly",title:"Behavioral Flags",desc:"New accounts on unusual platforms.",remediation:"Investigate within 48h."},
      {tag:"Pricing",title:"Per-Employee",desc:"$2.99/employee/month."},
    ]} cta="Add Employees"/>;
    case"reports":return <FP title="Reports Center" subtitle="All generated reports." features={[
      {tag:"Weekly",title:"Threat Evaluation",desc:"Comprehensive weekly threat assessment."},
      {tag:"Monthly",title:"Employee Summary",desc:"Monthly exposure summary."},
      {tag:"Quarterly",title:"Footprint Trends",desc:"Quarterly exposure analysis."},
      {tag:"OSINT",title:"Research Deliverables",desc:"Completed OSINT reports."},
    ]} cta="Configure Frequency"/>;
    case"consult":return <FP title="Consultancy" subtitle="Intelligence analysts and 24/7 support." features={[
      {tag:"Threat Eval",title:"Weekly Briefings",desc:"Tailored actionable weekly briefings."},
      {tag:"Legal",title:"Document Review",desc:"Data protection and IP specialists."},
      {tag:"Company Intel",title:"External Monitoring",desc:"Brand impersonation and credential sales."},
      {tag:"Call Center",title:"Multilingual 24/7",desc:"EN, TR, DE, FR, ES, AR, RU, ZH."},
    ]} cta="Book Consultation"/>;
    case"membership":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Membership" subtitle="Intelligence as a Service."/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32}}>
        {[{id:"obs",n:"Observer",p:"Free",f:["5 OSINT searches/month","Weekly digest","Breach alerts","Threat map"]},
          {id:"pro",n:"Professional",p:"$9.99",r:true,f:["Unlimited OSINT","Real-time monitoring","NLP feed","Sector filtering","Footprint analysis","Reports","War Room","Call center"]},
          {id:"exec",n:"Executive",p:"$29.99",f:["Everything in Professional","Data poisoning","Document intelligence","Decoy deployment","Threat prediction","Assigned analyst","Legal consultancy"]},
          {id:"ent",n:"Enterprise",p:"Custom",f:["Everything in Executive","Employee monitoring","CPIR module","Radius of influence","Unlimited capacity","Dedicated team","SLA guarantee"]},
        ].map((p,i)=><Card key={p.id} style={{padding:28,position:"relative"}}>
          {p.r&&<div style={{position:"absolute",top:-1,left:24,padding:"3px 12px",background:C.gold,color:C.bg,fontSize:9,fontFamily:mono,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:"0 0 3px 3px"}}>Recommended</div>}
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase",marginBottom:10}}>{p.n}</div>
          <div style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:20}}>{p.p}<span style={{fontSize:13,color:C.textDim}}>{p.p!=="Free"&&p.p!=="Custom"?"/mo":""}</span></div>
          {p.f.map((f,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:C.textSec,fontWeight:200,marginBottom:6}}><span style={{color:C.gold,fontSize:9}}>&#10022;</span>{f}</div>)}
        </Card>)}</div>
      <Card style={{padding:28,maxWidth:520}}>
        <span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>Subscribe</span>
        <p style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7,marginTop:12,marginBottom:20}}>Select a plan to proceed to our secure payment page. Payments are processed by iyzico. You can cancel anytime from your account settings.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <GoldBtn full onClick={()=>window.open("/api/payment?tier=professional","_blank")}>Subscribe — Professional ($9.99/mo)</GoldBtn>
          <GoldBtn full onClick={()=>window.open("/api/payment?tier=executive","_blank")}>Subscribe — Executive ($29.99/mo)</GoldBtn>
          <button onClick={()=>setPage("consult")} style={{padding:"14px 28px",border:`1px solid ${C.border}`,borderRadius:3,background:"transparent",color:C.textSec,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",width:"100%"}}>Enterprise — Contact Us</button>
        </div>
        <div style={{fontSize:10,color:C.textDim,fontFamily:mono,textAlign:"center",marginTop:14}}>Secured by iyzico — Cancel anytime</div>
      </Card></div>;
    case"settings":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="Settings" subtitle="Configure your intelligence platform."/>
      <Card style={{padding:28}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:C.goldDim,border:"1px solid rgba(196,162,101,0.2)"}}><span style={{fontSize:20,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</span></div>
          <div><div style={{fontSize:16,fontWeight:500}}>{user?.name||"Operator"}</div><div style={{fontSize:12,color:C.textDim,fontFamily:mono}}>{user?.email||""}</div></div></div>
        {[["Timezone","UTC+3 (Istanbul)"],["Language","English"],["Report Frequency","Weekly"],["Sector Focus","All Sectors"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:`1px solid ${C.border}`,fontSize:13}}><span style={{color:C.textDim,fontWeight:200}}>{k}</span><span>{v}</span></div>)}
      </Card></div>;
    case"guide":return <div style={{animation:"fadeIn 0.4s ease"}}><SH title="User Guide" subtitle="Understanding the platform."/>
      <Card style={{padding:28}}><p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,maxWidth:680}}>Spy by Atlas is a private intelligence platform. Features marked with real-time indicators perform live web searches.</p></Card></div>;
    default:return <PgDash go={setPage}/>;
  }};

  return <><style>{css}</style>
    {isDemo&&<div style={{background:C.goldDim,borderBottom:`1px solid rgba(196,162,101,0.2)`,padding:"6px 28px",fontSize:11,fontFamily:mono,color:C.gold,letterSpacing:"1px",textAlign:"center"}}>DEMO MODE — Some features require a paid account. <a href="/signup" style={{color:C.gold,textDecoration:"underline"}}>Sign up</a> for full access.</div>}
    <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
      <aside style={{width:collapsed?56:232,background:C.bgSidebar,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s ease",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:collapsed?"20px 10px 16px":"20px 20px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setCollapsed(!collapsed)}>
          {collapsed?<span style={{fontSize:16,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"2px",textAlign:"center",width:"100%"}}>Spy</span>:<SpyLogo/>}
        </div>
        <nav style={{flex:1,overflowY:"auto",padding:"8px 6px"}}>
          {NAV.map(g=><div key={g.group} style={{marginBottom:4}}>
            {!collapsed&&<div style={{padding:"10px 12px 4px",fontSize:9,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>{g.group}</div>}
            {collapsed&&<div style={{height:1,background:C.border,margin:"6px 8px"}}/>}
            {g.items.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"7px":"7px 12px",border:"none",borderRadius:3,cursor:"pointer",fontFamily:sans,fontSize:11,fontWeight:page===n.id?500:200,width:"100%",background:page===n.id?C.goldDim:"transparent",color:page===n.id?C.gold:C.textSec,transition:"all 0.15s",justifyContent:collapsed?"center":"flex-start",letterSpacing:".2px",whiteSpace:"nowrap",overflow:"hidden"}}>
              {collapsed?<span style={{fontSize:9,fontFamily:mono}}>{n.label.slice(0,2).toUpperCase()}</span>:n.label}</button>)}
          </div>)}
        </nav>
        <div style={{padding:"8px 6px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={handleSignOut} style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"7px":"7px 12px",border:"none",cursor:"pointer",background:"transparent",width:"100%",color:C.textDim,fontSize:11,fontFamily:sans,borderRadius:3,justifyContent:collapsed?"center":"flex-start",fontWeight:200}}>
            {collapsed?<span style={{fontSize:9,fontFamily:mono}}>OUT</span>:isDemo?"Exit Demo":"Sign Out"}</button>
        </div>
      </aside>
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{height:48,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0}}>
          <span style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>{NAV.flatMap(g=>g.items).find(n=>n.id===page)?.label||"Command Center"}</span>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontSize:10,fontFamily:mono,color:C.textDim}}>{new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}</span>
            <div style={{width:1,height:14,background:C.border}}/>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("settings")}>
              <div style={{width:26,height:26,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:11,fontFamily:serif,color:C.gold}}>{(user?.name||"O")[0]}</div>
              <span style={{fontSize:11,color:C.textSec,fontWeight:200}}>{user?.name||"Operator"}</span></div></div>
        </header>
        <div style={{flex:1,overflow:"auto",padding:"24px 28px"}}>{rp()}</div>
        <footer style={{padding:"8px 28px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:8,fontFamily:mono,letterSpacing:"1.5px",color:C.textDim}}>SPY BY ATLAS — atlasspy.com — INTELLIGENCE AS A SERVICE</span>
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:8,fontFamily:mono,color:C.textDim,letterSpacing:"1px"}}><span style={{width:4,height:4,borderRadius:"50%",background:C.low,animation:"glow 3s infinite"}}/>ENCRYPTED — OPERATIONAL</span>
        </footer>
      </main>
    </div></>;
}
