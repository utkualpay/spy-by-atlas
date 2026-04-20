"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",critical:"#c45c5c"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const H=({children})=><h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>{children}</h2>;

export default function ExplicitContentPage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>Explicit Content & Conduct Statement</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Mandatory disclosure — Effective upon acceptance at signup</p>

      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <div style={{background:"rgba(196,92,92,0.05)",border:"1px solid rgba(196,92,92,0.2)",borderLeft:`3px solid ${C.critical}`,padding:"18px 22px",borderRadius:4,marginBottom:24}}>
          <div style={{fontSize:11,fontFamily:mono,letterSpacing:"2px",color:C.critical,textTransform:"uppercase",marginBottom:8}}>MANDATORY ACKNOWLEDGMENT</div>
          <p style={{fontSize:13,color:C.text,fontWeight:300,lineHeight:1.6,margin:0}}>Before using Spy by Atlas, you must read and explicitly acknowledge this Explicit Content & Conduct Statement. The Service is a real intelligence platform with real investigative capabilities. Misuse can result in civil liability, criminal prosecution, and permanent account termination.</p>
        </div>

        <H>1. Nature of the Service</H>
        <p>Spy by Atlas provides open-source intelligence (OSINT) capabilities including but not limited to: searching publicly available information about individuals and organizations; analyzing digital footprints and exposure; cross-referencing breach databases; monitoring dark web mentions; generating behavioral and psychological indicator assessments; facilitating data suppression and opt-out workflows. These are powerful investigative capabilities. You, the User, are solely responsible for the ethical and lawful use of these capabilities.</p>

        <H>2. Explicit User Acknowledgments</H>
        <p>By accepting this Statement, you expressly acknowledge and represent that:</p>
        <p style={{paddingLeft:16}}>(a) <strong style={{color:C.text,fontWeight:400}}>You are at least 18 years of age</strong> and have legal capacity to enter into binding agreements.</p>
        <p style={{paddingLeft:16}}>(b) <strong style={{color:C.text,fontWeight:400}}>You understand the Service can generate potentially sensitive intelligence</strong> about real individuals, including information about their locations, relationships, communications patterns, psychological profiles, and vulnerabilities.</p>
        <p style={{paddingLeft:16}}>(c) <strong style={{color:C.text,fontWeight:400}}>You will not use the Service for any illegal purpose</strong>, including but not limited to stalking, harassment, extortion, unauthorized surveillance, illegal discrimination, doxing, or any other conduct that violates applicable laws.</p>
        <p style={{paddingLeft:16}}>(d) <strong style={{color:C.text,fontWeight:400}}>You accept sole responsibility</strong> for ensuring your use of the Service complies with all laws of your jurisdiction and the jurisdictions of any subjects you investigate.</p>
        <p style={{paddingLeft:16}}>(e) <strong style={{color:C.text,fontWeight:400}}>You will not circumvent, disable, or attempt to disable any safety measures, content filters, or ethical use restrictions</strong> built into the Service.</p>
        <p style={{paddingLeft:16}}>(f) <strong style={{color:C.text,fontWeight:400}}>You understand the Service is not a licensed investigation service</strong>, legal advisor, security consultant, or medical/psychological professional. Outputs should not substitute for professional advice.</p>
        <p style={{paddingLeft:16}}>(g) <strong style={{color:C.text,fontWeight:400}}>You accept that AI-generated content may contain errors</strong> and agree not to rely solely on Service outputs for any significant decision.</p>

        <H>3. Prohibited Content and Conduct</H>
        <p>You shall not use the Service in any manner that:</p>
        <p style={{paddingLeft:16}}>• Targets minors in any investigative capacity, except as a legal parent/guardian monitoring your own minor children under the Family module.</p>
        <p style={{paddingLeft:16}}>• Generates intelligence intended to facilitate physical harm, violence, or threats of violence against any person.</p>
        <p style={{paddingLeft:16}}>• Facilitates human trafficking, sexual exploitation, or any offense involving sexual misconduct.</p>
        <p style={{paddingLeft:16}}>• Supports state-sponsored surveillance by entities subject to international sanctions or engaged in human rights violations.</p>
        <p style={{paddingLeft:16}}>• Targets journalists, activists, whistleblowers, dissidents, or protected individuals for the purpose of retaliation or suppression.</p>
        <p style={{paddingLeft:16}}>• Violates attorney-client, doctor-patient, clergy-penitent, or other privileged relationships.</p>
        <p style={{paddingLeft:16}}>• Attempts to identify or investigate individuals who have invoked protected identity status (witness protection, sealed adoption records, sealed court records).</p>
        <p style={{paddingLeft:16}}>• Generates content for the purpose of harassment campaigns, coordinated inauthentic behavior, disinformation, or political manipulation.</p>
        <p style={{paddingLeft:16}}>• Violates privacy rights protected under GDPR, CCPA, HIPAA (if applicable), or equivalent legislation.</p>

        <H>4. Family Module — Child Monitoring Acknowledgment</H>
        <p>If you use the Family module to monitor the social media activity of a minor, you acknowledge and represent:</p>
        <p style={{paddingLeft:16}}>(a) You are the biological parent, adoptive parent, or legal guardian of the minor whose accounts you are monitoring.</p>
        <p style={{paddingLeft:16}}>(b) You have legal authority under the laws of your jurisdiction to monitor the minor's digital activity.</p>
        <p style={{paddingLeft:16}}>(c) The Service only analyzes publicly visible content — no private messages, direct messages, or content behind privacy settings are accessed.</p>
        <p style={{paddingLeft:16}}>(d) You will use findings only for the welfare and safety of the minor, not for punishment, control, or coercion.</p>
        <p style={{paddingLeft:16}}>(e) You will consult with a qualified mental health professional if assessments indicate concerning patterns.</p>

        <H>5. Business & Team Features — Employer Acknowledgment</H>
        <p>If you use Business Premium features including team seats, CPIR assessments, insider threat monitoring, or employee-related intelligence:</p>
        <p style={{paddingLeft:16}}>(a) You represent that you have lawful authority as the employer to conduct such activities under the laws of your jurisdiction and any applicable employment agreements.</p>
        <p style={{paddingLeft:16}}>(b) You acknowledge that employee monitoring requires specific legal compliance in many jurisdictions, including disclosure, consent, and documentation requirements.</p>
        <p style={{paddingLeft:16}}>(c) You agree not to use Service outputs as the sole basis for adverse employment decisions without independent verification and consultation with qualified legal and HR professionals.</p>
        <p style={{paddingLeft:16}}>(d) You will not use the Service in violation of collective bargaining agreements, workplace privacy laws, or anti-discrimination laws.</p>

        <H>6. Reporting Misuse</H>
        <p>If you become aware of misuse of the Service, including by yourself unintentionally, by another user, or by a third party you suspect is abusing the platform, you agree to report it to atlasalpaytr@gmail.com immediately. Licensor reserves the right to cooperate with law enforcement investigations upon valid legal process.</p>

        <H>7. Consequences of Misuse</H>
        <p>Violation of this Statement may result in: immediate suspension or termination of your account without refund; forfeiture of all stored data and reports; civil action by Licensor to recover damages; reporting to law enforcement agencies with jurisdiction; reporting to financial fraud networks and industry blocklists; cooperation with victim civil actions against you.</p>

        <H>8. No Duty to Monitor</H>
        <p>Licensor has no obligation to monitor or review your use of the Service for compliance with this Statement or any law. However, Licensor reserves the absolute right to review, audit, investigate, or terminate any account suspected of misuse, at Licensor's sole discretion, without notice.</p>

        <H>9. Reaffirmation</H>
        <p>Each time you use the Service, you reaffirm all representations and acknowledgments in this Statement. Continued use constitutes ongoing acceptance.</p>

        <div style={{marginTop:40,padding:"18px 22px",background:"rgba(196,92,92,0.05)",border:"1px solid rgba(196,92,92,0.2)",borderRadius:4}}>
          <div style={{fontSize:11,fontFamily:mono,letterSpacing:"2px",color:C.critical,textTransform:"uppercase",marginBottom:10}}>REQUIRED ACCEPTANCE</div>
          <p style={{fontSize:13,color:C.text,fontWeight:300,lineHeight:1.6,margin:0}}>By checking the acceptance box at signup and by using the Service, you certify under penalty of account termination and potential legal consequences that: (i) you have read this Statement in full; (ii) you understand all acknowledgments and restrictions; (iii) you accept sole responsibility for lawful and ethical use of the Service; (iv) you will not use the Service for any prohibited purpose; (v) you agree to be legally bound by these terms.</p>
        </div>
      </div>
    </div>
  </div>;
}
