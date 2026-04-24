"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/use-translation";
const C={bg:"#09090b",bgCard:"#131316",border:"#1f1f25",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)",critical:"#c45c5c"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

export default function AboutDataPage(){
  const{t}=useTranslation();
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← {t("common.home")}</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"30px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <div style={{fontSize:11,fontFamily:mono,letterSpacing:"4px",color:C.gold,textTransform:"uppercase",marginBottom:12}}>{t("aboutdata.subtitle")}</div>
      <h1 style={{fontSize:42,fontFamily:serif,fontWeight:300,marginBottom:24,lineHeight:1.2}}>{t("aboutdata.title")}</h1>

      <div style={{fontSize:15,color:C.textSec,fontWeight:200,lineHeight:1.85,marginBottom:28}}>
        This document explains, in plain language, what happens to the information you share with Spy by Atlas. It complements our <Link href="/privacy">Privacy Policy</Link>, which is the legally binding document. Where this page and the Privacy Policy disagree, the Privacy Policy governs.
      </div>

      <div style={{background:C.bgCard,border:`1px solid ${C.gold}30`,borderRadius:4,padding:"20px 24px",marginBottom:28}}>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase",marginBottom:10}}>The Principle</div>
        <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,margin:0}}>Your data belongs to you. We collect only what we need to operate the service you paid for. We do not sell it. We do not correlate it with third-party data sets to build profiles. We do not use your queries to train artificial intelligence models.</p>
      </div>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>1. What we collect</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>When you create an account, we collect: your name, email address, and password (hashed, never stored in plain text). If you choose to personalize the platform, you may voluntarily share additional information — your company, role, industry, interests, or concerns. You may also register social media handles you wish us to monitor. All voluntary data is clearly labeled and can be removed at any time.</p>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>When you use the platform, we record: the queries you submit, the reports generated, module usage, timestamps, and technical metadata (IP address, browser type, device information) needed for security and service operation.</p>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>When you pay, we do not collect or store payment card details. Paddle.com processes payments as merchant of record and stores those details under their own compliance regime.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>2. Where your data lives</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>Your data is stored in PostgreSQL databases hosted by Supabase, a SOC 2 Type II certified infrastructure provider. Each account operates under strict Row-Level Security — the database itself enforces that no user can read or modify another user's data, not even accidentally. All data is encrypted in transit using TLS 1.3, and encrypted at rest using AES-256.</p>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>Authentication sessions are managed through secure, HTTP-only cookies. Passwords are hashed using modern cryptographic standards before storage. We never have access to your plain-text password and cannot recover it — we can only reset it.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>3. Who processes your data on our behalf</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>The following third parties process limited data strictly to operate the service:</p>
      <ul style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.9,paddingLeft:20,marginBottom:16}}>
        <li><strong style={{color:C.text,fontWeight:400}}>Supabase:</strong> database hosting, authentication. Data remains encrypted and logically isolated per account.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Vercel:</strong> application hosting and content delivery. No persistent user data is stored at this layer.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Google (Gemini API):</strong> AI processing of queries submitted to intelligence modules. Per Google's API terms, queries and responses are not used to train public models and are not retained beyond the processing window.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Paddle.com:</strong> payment processing and tax compliance. They handle billing data; we receive only subscription status.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Formspree:</strong> transactional email delivery (contact forms, CPIR assessment invitations).</li>
      </ul>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>No other third parties receive your data. No advertisers. No analytics providers that enable cross-site tracking. No data brokers.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>4. What we do not do</h2>
      <div style={{background:"rgba(196,92,92,0.04)",border:"1px solid rgba(196,92,92,0.15)",borderRadius:4,padding:"18px 22px",marginBottom:16}}>
        <ul style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.9,paddingLeft:20,margin:0}}>
          <li>We do not sell, rent, lease, barter, or otherwise monetize your personal data.</li>
          <li>We do not use your queries or reports to train AI models, including our own.</li>
          <li>We do not build cross-user profiles. Your data is never correlated with another user's data.</li>
          <li>We do not run advertising networks or display ads on the platform.</li>
          <li>We do not use analytics tools that track users across the web.</li>
          <li>We do not share your subscription tier, usage patterns, or identifiable activity with any third party for marketing purposes.</li>
          <li>We do not retain data after you delete your account beyond what is required by applicable law.</li>
        </ul>
      </div>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>5. Your rights</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>Under the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), the UK Data Protection Act, Turkish KVKK, and equivalent legislation elsewhere, you have legally enforceable rights over your personal data. These rights apply to every user regardless of jurisdiction because we extend them universally.</p>
      <ul style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.9,paddingLeft:20,marginBottom:16}}>
        <li><strong style={{color:C.text,fontWeight:400}}>Right of access:</strong> You may request a complete copy of the personal data we hold about you.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to rectification:</strong> You may correct inaccurate data we hold.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to erasure (right to be forgotten):</strong> You may request complete deletion of your data. Honored within 30 days.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to portability:</strong> You may request your data in a machine-readable format to transfer elsewhere.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to restrict processing:</strong> You may limit how we process your data while retaining your account.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to object:</strong> You may object to any processing based on legitimate interest.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
        <li><strong style={{color:C.text,fontWeight:400}}>Right to lodge a complaint:</strong> You may complain to the supervisory authority in your jurisdiction.</li>
      </ul>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>To exercise any of these rights, email <a href="mailto:atlasalpaytr@gmail.com" style={{color:C.gold}}>atlasalpaytr@gmail.com</a>. We will respond within 30 calendar days. We will not charge you a fee for exercising these rights unless the request is manifestly unfounded or excessive, and we will inform you in advance if we intend to apply any fee.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>6. OSINT data — a separate matter</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>When you use the platform to conduct open-source intelligence research on a third party, that third party's data is not stored by us beyond the resulting report in your account. We do not maintain a database of people researched through the platform. Each query is processed independently and the intermediate search results are discarded.</p>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>If you are a subject of a search and wish to have information about you removed from our systems, email us. We will verify your identity and delete any relevant reports within 30 days. Note that we do not control the upstream public sources that originally published information about you — removing their content requires approaching them directly, which our Make Me Invisible feature helps subscribed users with.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>7. Breach database access</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>Our Breach Console allows authenticated users to check whether specific email addresses appear in known data breaches. The breach data itself is aggregated from publicly disclosed incidents and does not originate from us. Users may only search for emails they have legitimate reason to check — their own, or those of accounts they administer. Unauthorized lookups of third parties may violate data protection law and our Acceptable Use Policy.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>8. Data retention</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>Account data, profile data, reports, and notes are retained for the lifetime of your account. Session logs and technical metadata are retained for up to 90 days for security purposes. Payment records are retained per Paddle's retention policy and applicable tax law — typically seven years. Upon account deletion, personal data is irreversibly removed within 30 days, except where we are legally required to retain specific records (financial transactions, law enforcement requests).</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>9. International transfers</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>Data may be processed in servers located in the European Union, the United States, and Türkiye. Transfers between jurisdictions are safeguarded by Standard Contractual Clauses approved by the European Commission, supplementary technical measures (end-to-end encryption, data minimization), and — in the case of the United States — the EU-U.S. Data Privacy Framework where applicable.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>10. Data breach notification</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>In the unlikely event of a data breach affecting your personal data, we will notify you and the relevant supervisory authority within 72 hours of becoming aware of the incident, as required by GDPR Article 33. Notifications will describe the nature of the breach, the likely consequences, and the measures we have taken in response.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>11. Law enforcement requests</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8,marginBottom:14}}>We respect lawful orders from competent authorities. We do not voluntarily disclose user data to any government or law enforcement agency. When we receive a legally binding request, we evaluate it against the laws of the jurisdiction in which we operate, narrow its scope where possible, and — unless legally prohibited from doing so — notify the affected user before disclosure so they may challenge the request. We publish an annual transparency report summarizing the requests we receive.</p>

      <h2 style={{fontSize:22,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:14}}>12. Questions</h2>
      <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.8}}>For any data-related inquiry, contact our data protection point of contact at <a href="mailto:atlasalpaytr@gmail.com" style={{color:C.gold}}>atlasalpaytr@gmail.com</a>. This page will be updated as our practices evolve; the current version is always accessible from the footer of every page.</p>
    </div>
  </div>;
}
