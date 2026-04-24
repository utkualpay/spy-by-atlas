"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/use-translation";
const C={bg:"#09090b",bgCard:"#131316",border:"#1f1f25",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

export default function AboutPage(){
  const{t}=useTranslation();
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← {t("common.home")}</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"30px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <div style={{fontSize:11,fontFamily:mono,letterSpacing:"4px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>{t("about.subtitle")}</div>
      <h1 style={{fontSize:42,fontFamily:serif,fontWeight:300,marginBottom:24,lineHeight:1.2}}>{t("about.title")}</h1>

      <div style={{fontSize:15,color:C.textSec,fontWeight:200,lineHeight:1.85,marginBottom:24}}>
        Spy by Atlas is the intelligence platform built by Atlas Design Institute — an independent practice combining operational intelligence methodology with modern engineering. We are not a technology company that added intelligence features. We are intelligence practitioners who built the platform we wished existed for the private sector.
      </div>

      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:"24px 28px",marginBottom:24}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>Our Purpose</div>
        <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,margin:0}}>Intelligence capabilities that were once the domain of governments and large corporations have become essential for individuals, families, and businesses operating in a hostile digital environment. We make those capabilities accessible — properly designed, professionally operated, and priced within reach.</p>
      </div>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>How we work</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:16}}>Every module in the platform reflects methodology used by professional intelligence teams. Our analysts bring backgrounds in national security, counterintelligence, corporate investigation, and cybersecurity. Each feature is built on tradecraft that has been tested in the field, then adapted for civilian use.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>Data sources</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:16}}>Our intelligence products draw on open-source data, breach databases, public records, and curated feeds from established institutions including the Council on Foreign Relations, ACLED, the International Crisis Group, the Institute for the Study of War, IISS, and SIPRI. We do not access private systems, intercept communications, or acquire data through methods that would violate privacy law in the jurisdictions where we operate.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>Who we serve</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:16}}>Individuals concerned about their digital exposure. Families protecting children from online harm. Executives whose roles attract targeted threats. Organizations assessing supply chain risk and insider threats. Our work is for people who understand that awareness is the first layer of defense.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>Principles</h2>
      <ul style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.9,paddingLeft:20,marginBottom:24}}>
        <li><strong style={{color:C.text,fontWeight:400}}>Discretion.</strong> Your identity, your queries, and your reports are yours alone. Nothing is sold, correlated, or shared.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Professional rigor.</strong> Every output follows the standards of formal intelligence reporting — structured, sourced, and caveated where warranted.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Legality.</strong> We do not enable or assist in activity that would violate law in any jurisdiction where we or our users operate.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Restraint.</strong> Intelligence is power. We build safeguards into the platform and require users to acknowledge the ethical boundaries of its use.</li>
      </ul>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>The company</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:16}}>Atlas Design Institute is headquartered in Istanbul, Türkiye. We operate internationally and serve clients in over 40 jurisdictions. All payments are processed through Paddle.com as merchant of record, ensuring tax and regulatory compliance worldwide.</p>

      <div style={{background:C.goldDim,border:`1px solid ${C.gold}30`,borderRadius:4,padding:"20px 24px",marginTop:32}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:8}}>Contact</div>
        <div style={{fontSize:13,color:C.textSec,fontWeight:200,lineHeight:1.7}}>General inquiries, partnerships, or media: <a href="mailto:atlasalpaytr@gmail.com" style={{color:C.gold}}>atlasalpaytr@gmail.com</a></div>
      </div>

      <div style={{textAlign:"center",marginTop:40}}>
        <Link href="/signup" style={{display:"inline-block",padding:"14px 32px",border:`1px solid ${C.gold}`,borderRadius:3,background:"transparent",color:C.gold,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>{t("landing.getStarted")}</Link>
      </div>
    </div>
  </div>;
}
