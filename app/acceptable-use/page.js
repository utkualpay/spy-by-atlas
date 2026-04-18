"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const H=({children})=><h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>{children}</h2>;

export default function AUPPage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>Acceptable Use Policy</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Last updated: April 2026</p>
      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <H>1. Purpose</H>
        <p>This Acceptable Use Policy ("AUP") governs your use of the Spy by Atlas platform. This policy exists to ensure the Service is used ethically, legally, and in a manner consistent with its intended purpose as a legitimate open-source intelligence tool.</p>
        <H>2. Permitted Uses</H>
        <p>The Service is designed for: personal digital security and privacy management; corporate threat intelligence and risk assessment; due diligence research using publicly available information; executive protection and digital footprint management; competitive intelligence using lawful methods; academic and journalistic research; parental monitoring of minors' online safety (by legal guardians only).</p>
        <H>3. Prohibited Uses</H>
        <p>You must NOT use the Service for: stalking, harassment, or intimidation of any individual; unauthorized surveillance or monitoring of individuals without their knowledge where legally required; any activity that violates applicable local, national, or international law; accessing, attempting to access, or facilitating access to non-public systems or data; conducting background checks for employment decisions in jurisdictions where this requires specific licensing; any purpose that would constitute a violation of the EU General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), or equivalent privacy legislation; doxing or publishing private information about individuals with intent to harm; generating intelligence reports for use in discrimination based on race, religion, gender, sexual orientation, or other protected characteristics; any form of industrial espionage that involves illegal methods; impersonation of law enforcement, government officials, or intelligence agencies.</p>
        <H>4. Rate Limits and Fair Use</H>
        <p>Automated bulk querying of the Service is prohibited without prior written consent. Excessive use that degrades service quality for other users may result in temporary throttling or suspension. API abuse, scraping, or circumvention of access controls is strictly prohibited.</p>
        <H>5. Reporting Violations</H>
        <p>If you become aware of any violation of this AUP, please report it to atlasalpaytr@gmail.com. We will investigate all reports promptly.</p>
        <H>6. Enforcement</H>
        <p>Violation of this AUP may result in: warning and request to cease the prohibited activity; temporary suspension of your account; permanent termination of your account without refund; reporting to relevant law enforcement authorities where appropriate.</p>
        <H>7. Changes</H>
        <p>We may update this AUP as needed. Material changes will be communicated to users.</p>
      </div>
    </div>
  </div>;
}
