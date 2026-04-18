"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

export default function PrivacyPage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>Privacy Policy</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Last updated: April 2026</p>

      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>1. Data Controller</h2>
        <p>Atlas Design Institute ("we," "us") is the data controller for personal data collected through the Spy by Atlas platform. Contact: atlasalpaytr@gmail.com</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>2. Data We Collect</h2>
        <p><strong style={{color:C.text,fontWeight:400}}>Account Data:</strong> Name, email address, and password hash when you register. <strong style={{color:C.text,fontWeight:400}}>Profile Data:</strong> Information you voluntarily provide — company, role, industry, social media handles, daily routine, interests, and security concerns. <strong style={{color:C.text,fontWeight:400}}>Usage Data:</strong> Queries submitted to the platform, reports generated, pages visited, timestamps. <strong style={{color:C.text,fontWeight:400}}>Payment Data:</strong> Processed by Paddle (our merchant of record). We do not store credit card numbers. <strong style={{color:C.text,fontWeight:400}}>Technical Data:</strong> IP address, browser type, device information collected for security and service improvement.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>3. How We Use Your Data</h2>
        <p>We use your data to: provide and operate the Service; generate personalized intelligence reports; authenticate your identity; process payments and manage subscriptions; send service-related communications; improve the Service; comply with legal obligations; detect and prevent fraud and abuse.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>4. Legal Basis for Processing (GDPR)</h2>
        <p>We process personal data on the following bases: <strong style={{color:C.text,fontWeight:400}}>Contract performance:</strong> to provide the Service you subscribed to. <strong style={{color:C.text,fontWeight:400}}>Legitimate interests:</strong> to improve our Service and prevent abuse. <strong style={{color:C.text,fontWeight:400}}>Consent:</strong> for optional profile data you voluntarily provide. <strong style={{color:C.text,fontWeight:400}}>Legal obligation:</strong> to comply with applicable laws.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>5. Data Storage and Security</h2>
        <p>Your data is stored in secure PostgreSQL databases hosted by Supabase with Row-Level Security (RLS) enforced. Each user's data is strictly isolated — no data is shared between accounts. All data is encrypted in transit (TLS) and at rest. Authentication tokens are managed via secure HTTP-only cookies. We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>6. Data Sharing</h2>
        <p>We do NOT sell your personal data. We share data only with: <strong style={{color:C.text,fontWeight:400}}>Paddle:</strong> payment processing (as merchant of record). <strong style={{color:C.text,fontWeight:400}}>Supabase:</strong> database hosting. <strong style={{color:C.text,fontWeight:400}}>Google (Gemini API):</strong> AI processing of your queries (queries are not stored by Google for training). <strong style={{color:C.text,fontWeight:400}}>Law enforcement:</strong> only when required by valid legal process.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>7. Your Rights (GDPR / CCPA)</h2>
        <p>You have the right to: <strong style={{color:C.text,fontWeight:400}}>Access</strong> your personal data. <strong style={{color:C.text,fontWeight:400}}>Rectify</strong> inaccurate data. <strong style={{color:C.text,fontWeight:400}}>Erase</strong> your data ("right to be forgotten"). <strong style={{color:C.text,fontWeight:400}}>Restrict</strong> processing of your data. <strong style={{color:C.text,fontWeight:400}}>Port</strong> your data to another service. <strong style={{color:C.text,fontWeight:400}}>Object</strong> to processing based on legitimate interests. <strong style={{color:C.text,fontWeight:400}}>Withdraw consent</strong> at any time. To exercise these rights, contact us at atlasalpaytr@gmail.com. We will respond within 30 days.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>8. OSINT Data Disclaimer</h2>
        <p>The Service analyzes publicly available information ("open-source intelligence"). We do not access private systems, hack databases, or intercept communications. All intelligence reports are derived from data that is already publicly accessible. If you are the subject of a search and wish to have information removed, please contact us.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>9. Cookies</h2>
        <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. See our <Link href="/cookies">Cookie Policy</Link> for details.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>10. Children's Privacy</h2>
        <p>The Service is not directed to individuals under 18. Family account features that monitor children's social media are operated by the parent/guardian and do not create accounts for minors. We do not knowingly collect data from children under 13 (COPPA) or under 16 (GDPR).</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>11. International Transfers</h2>
        <p>Data may be processed in the European Union, United States, and Turkey. We ensure appropriate safeguards for international transfers in compliance with GDPR, including Standard Contractual Clauses where applicable.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>12. Changes to This Policy</h2>
        <p>We may update this policy periodically. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>13. Contact</h2>
        <p>Data Protection Inquiries: atlasalpaytr@gmail.com — Atlas Design Institute — Istanbul, Turkey</p>
      </div>
    </div>
  </div>;
}
