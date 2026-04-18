"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",border:"#1f1f25",bgCard:"#131316"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

export default function TermsPage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>Terms of Service</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Last updated: April 2026</p>

      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>1. Acceptance of Terms</h2>
        <p>By accessing or using the Spy by Atlas platform ("Service"), operated by Atlas Design Institute ("Company," "we," "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>2. Description of Service</h2>
        <p>Spy by Atlas is an intelligence-as-a-service platform providing open-source intelligence (OSINT) research, threat monitoring, digital footprint analysis, breach monitoring, and related cybersecurity services. The Service uses artificial intelligence to analyze publicly available information and generate intelligence reports.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>3. Eligibility</h2>
        <p>You must be at least 18 years of age to use this Service. By using the Service, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. For Family accounts, the parent or legal guardian must be the account holder.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>4. Account Registration</h2>
        <p>You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>5. Subscriptions and Payment</h2>
        <p>The Service offers tiered subscription plans. Payment is processed through our merchant of record, Paddle.com, or alternative payment processors as indicated at checkout. All prices are in USD unless otherwise stated. Subscriptions automatically renew at the end of each billing period unless cancelled. You authorize us to charge your payment method on a recurring basis. Pricing may change with 30 days' notice. The 7-day free trial, where offered, requires a valid payment method. If not cancelled before the trial period ends, the subscription will automatically convert to the selected paid plan.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>6. Acceptable Use</h2>
        <p>You agree NOT to use the Service to: conduct illegal surveillance or stalking; harass, threaten, or intimidate any person; violate any applicable law or regulation; infringe on intellectual property rights; conduct unauthorized access to systems; engage in any activity that could damage, disable, or impair the Service; use the Service for any purpose that violates the privacy rights of others beyond what is publicly available; resell, redistribute, or sublicense the Service without written consent. Violation of these terms may result in immediate account termination without refund. See our <Link href="/acceptable-use">Acceptable Use Policy</Link> for full details.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>7. Intellectual Property</h2>
        <p>All content, features, and functionality of the Service are owned by Atlas Design Institute and are protected by international copyright, trademark, and other intellectual property laws. Reports generated through the Service are licensed to you for your personal or internal business use only. You may not publicly distribute, sell, or commercially exploit reports generated by the Service.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>8. Disclaimer of Warranties</h2>
        <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that: the Service will be uninterrupted, secure, or error-free; the results obtained from the Service will be accurate or reliable; the quality of any information obtained through the Service will meet your expectations. Intelligence reports are generated using artificial intelligence and publicly available data. We do not guarantee the accuracy, completeness, or timeliness of any information provided.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>9. Limitation of Liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATLAS DESIGN INSTITUTE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THE USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>10. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless Atlas Design Institute, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in connection with your use of the Service or violation of these Terms.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>11. Data and Privacy</h2>
        <p>Your use of the Service is subject to our <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>12. Termination</h2>
        <p>We reserve the right to suspend or terminate your account at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately. You may cancel your subscription at any time through your account settings or by contacting us. See our <Link href="/refund">Refund Policy</Link> for cancellation and refund details.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>13. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Istanbul, Turkey.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>14. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>

        <h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>15. Contact</h2>
        <p>For questions about these Terms, contact us at: Atlas Design Institute — atlasalpaytr@gmail.com — atlasspy.com</p>
      </div>
    </div>
  </div>;
}
