"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const H=({children})=><h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>{children}</h2>;

export default function EulaPage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>End User License Agreement</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Last updated: April 2026 — Effective upon acceptance at signup</p>

      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <p style={{background:"rgba(196,162,101,0.05)",border:"1px solid rgba(196,162,101,0.15)",padding:"16px 20px",borderRadius:4,marginBottom:20,fontSize:13}}><strong style={{color:C.gold,fontWeight:400}}>IMPORTANT:</strong> This End User License Agreement ("EULA") is a binding legal contract between you ("User," "Licensee") and Atlas Design Institute ("Licensor"). By checking the acceptance box at signup, or by using the Spy by Atlas platform, you acknowledge you have read, understood, and agree to be bound by these terms. If you do not agree, do not use the Service.</p>

        <H>1. Grant of License</H>
        <p>Subject to the terms of this EULA and payment of applicable subscription fees, Licensor grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Spy by Atlas platform ("Service") for your internal personal or business purposes only. This license does not include the right to sublicense, resell, distribute, or commercially exploit the Service or its outputs beyond the scope of your authorized use.</p>

        <H>2. Authorized Users</H>
        <p>The license is granted to the individual or organization that established the account ("Master Account"). For Business Premium subscribers, additional seats may be added under the Master Account at the prevailing per-seat rate. Each authorized user must personally accept this EULA before accessing the Service. Sharing of account credentials is strictly prohibited and constitutes a material breach of this EULA.</p>

        <H>3. Permitted Use</H>
        <p>You may use the Service only for lawful purposes in accordance with this EULA, our Terms of Service, Acceptable Use Policy, and all applicable laws of the jurisdictions in which you operate. Permitted uses include: personal digital security management; corporate threat intelligence; lawful due diligence using publicly available information; executive protection and digital footprint management; competitive intelligence gathered through lawful means; parental monitoring of minors by legal guardians; academic, journalistic, or research activities that comply with applicable privacy laws.</p>

        <H>4. User Responsibility for Compliance</H>
        <p>You are solely responsible for ensuring your use of the Service complies with all laws and regulations applicable to you, including but not limited to: the European Union General Data Protection Regulation (GDPR); the California Consumer Privacy Act (CCPA); national data protection laws of your jurisdiction and the jurisdictions of any persons you research through the Service; employment law, where the Service is used in an employment context; anti-stalking and harassment laws; defamation law. Licensor provides the tools; you are responsible for how you use them. Licensor explicitly disclaims any responsibility for your misuse of the Service.</p>

        <H>5. Prohibited Conduct</H>
        <p>You shall NOT: (a) use the Service to stalk, harass, intimidate, threaten, or cause emotional or physical harm to any person; (b) conduct unauthorized surveillance of individuals without their knowledge where such surveillance requires knowledge or consent under applicable law; (c) use the Service to facilitate identity theft, fraud, extortion, blackmail, or any other criminal conduct; (d) attempt to access non-public systems, data, or private communications of any person or entity; (e) use the Service to aggregate or publish personal information about any individual with intent to cause harm ("doxing"); (f) use intelligence generated by the Service as the basis for discrimination in employment, housing, lending, insurance, or provision of services based on race, religion, gender, sexual orientation, national origin, disability, genetic information, or any other legally protected characteristic; (g) reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service; (h) circumvent, disable, or interfere with security features; (i) use automated means (bots, scrapers, crawlers) to access the Service without prior written authorization; (j) resell, redistribute, or create derivative works based on the Service or its outputs; (k) use the Service to impersonate law enforcement, intelligence agencies, government officials, or any real person or entity; (l) use the Service in violation of international sanctions, embargoes, or export controls.</p>

        <H>6. AI-Generated Content Acknowledgment</H>
        <p>You acknowledge and understand that intelligence reports, analyses, and assessments generated by the Service are produced by artificial intelligence (Google Gemini) analyzing publicly available data. You expressly acknowledge that: AI-generated content may contain errors, inaccuracies, omissions, or outdated information; AI outputs should not be relied upon as the sole basis for significant decisions; you are responsible for independently verifying critical information before acting upon it; the Service is not a substitute for licensed legal, financial, security, investigation, or medical advice; Licensor makes no representation regarding the accuracy, completeness, or reliability of AI-generated outputs.</p>

        <H>7. Ownership and Intellectual Property</H>
        <p>The Service, including all software, features, algorithms, designs, logos, trademarks, and proprietary methodologies, is the exclusive property of Atlas Design Institute and its licensors. All rights not expressly granted herein are reserved. Reports generated through the Service are licensed to you for your internal use; Licensor retains all underlying intellectual property rights. You may not remove, alter, or obscure any proprietary notices, trademarks, or watermarks.</p>

        <H>8. Third-Party Services</H>
        <p>The Service incorporates third-party components and services, including but not limited to: Google Gemini (AI processing); Supabase (database and authentication); Vercel (hosting); Paddle.com (payment processing and tax compliance); Formspree (form submissions). Your use of the Service is also subject to the terms of these third-party providers. Licensor is not responsible for third-party service outages or data practices of third-party providers.</p>

        <H>9. Warranty Disclaimer</H>
        <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LICENSOR EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO: WARRANTIES OF MERCHANTABILITY; FITNESS FOR A PARTICULAR PURPOSE; NON-INFRINGEMENT; ACCURACY, RELIABILITY, OR COMPLETENESS OF INFORMATION; UNINTERRUPTED OR ERROR-FREE OPERATION; SECURITY AGAINST UNAUTHORIZED ACCESS. NO ORAL OR WRITTEN ADVICE PROVIDED BY LICENSOR SHALL CREATE ANY WARRANTY.</p>

        <H>10. Limitation of Liability</H>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LICENSOR, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, BUSINESS INTERRUPTION, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF LICENSOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. LICENSOR'S TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THIS EULA OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO LICENSOR IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED US DOLLARS ($100 USD), WHICHEVER IS GREATER.</p>

        <H>11. Indemnification</H>
        <p>You agree to defend, indemnify, and hold harmless Atlas Design Institute, its affiliates, officers, directors, employees, agents, licensors, and service providers from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to: your violation of this EULA; your use or misuse of the Service; your violation of any third party's rights (including privacy, publicity, or intellectual property rights); your violation of any applicable law or regulation; any content you submit, post, or transmit through the Service; any claim that your use of the Service caused damage to any third party.</p>

        <H>12. Termination</H>
        <p>This EULA is effective until terminated. Licensor may terminate this EULA and your access to the Service at any time, with or without cause, with or without notice, for any reason including but not limited to: violation of this EULA, Terms of Service, or Acceptable Use Policy; non-payment of subscription fees; request by law enforcement; suspected fraudulent, abusive, or illegal activity. Upon termination: your license to use the Service immediately ceases; all content and data you have submitted may be deleted after 30 days; provisions of this EULA that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnification, and limitations of liability.</p>

        <H>13. Export Controls</H>
        <p>You acknowledge that the Service may be subject to export controls and sanctions laws of the United States, European Union, Turkey, and other jurisdictions. You represent that: you are not located in a country subject to a comprehensive embargo by the United States government; you are not listed on any United States government list of prohibited or restricted parties. You agree not to export, re-export, or transfer the Service in violation of applicable export control laws.</p>

        <H>14. Governing Law and Dispute Resolution</H>
        <p>This EULA shall be governed by and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of laws principles. Any dispute arising out of or relating to this EULA or the Service shall be resolved exclusively through: (a) first, good-faith negotiation between the parties; (b) if negotiation fails, binding arbitration administered by the Istanbul Arbitration Centre under its rules then in effect. You waive any right to participate in class actions or class arbitrations. Notwithstanding the foregoing, Licensor reserves the right to seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights.</p>

        <H>15. Severability</H>
        <p>If any provision of this EULA is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that this EULA shall otherwise remain in full force and effect and enforceable.</p>

        <H>16. Entire Agreement</H>
        <p>This EULA, together with the Terms of Service, Privacy Policy, Acceptable Use Policy, Refund Policy, Cookie Policy, Disclaimer, and Explicit Content Statement, constitutes the entire agreement between you and Licensor regarding the Service and supersedes all prior or contemporaneous agreements, understandings, and communications.</p>

        <H>17. Changes to This EULA</H>
        <p>Licensor may modify this EULA at any time. Material changes will be communicated via email or through the Service with at least thirty (30) days' notice. Your continued use of the Service after the effective date of any modifications constitutes acceptance of the modified EULA. If you do not agree to the modified terms, you must cease use of the Service.</p>

        <H>18. Contact</H>
        <p>Legal notices: atlasalpaytr@gmail.com — Atlas Design Institute — Istanbul, Turkey</p>

        <p style={{marginTop:40,padding:"16px 20px",background:"rgba(196,162,101,0.05)",border:"1px solid rgba(196,162,101,0.15)",borderRadius:4,fontSize:13}}><strong style={{color:C.gold,fontWeight:400}}>BY CLICKING "I AGREE" AT SIGNUP OR BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS EULA, UNDERSTAND IT, AND AGREE TO BE BOUND BY ITS TERMS.</strong></p>
      </div>
    </div>
  </div>;
}
