"use client";
import Link from "next/link";
const C={bg:"#09090b",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";
const H=({children})=><h2 style={{fontSize:18,fontFamily:serif,fontWeight:400,color:C.text,marginTop:32,marginBottom:12}}>{children}</h2>;

export default function RefundPage(){
  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans}}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} a{color:${C.gold}} @media(max-width:768px){.lp{padding:20px!important}}`}</style>
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 60px"}}>
      <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"baseline",gap:3}}><span style={{fontSize:22,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span><span style={{fontSize:7,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span></Link>
      <Link href="/" style={{fontSize:11,color:C.textDim,textDecoration:"none",fontFamily:mono,letterSpacing:"1px"}}>← Back</Link>
    </nav>
    <div className="lp" style={{maxWidth:780,margin:"0 auto",padding:"20px 60px 80px",animation:"fadeIn 0.5s ease"}}>
      <h1 style={{fontSize:32,fontFamily:serif,fontWeight:300,marginBottom:8}}>Refund & Cancellation Policy</h1>
      <p style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:40}}>Last updated: April 2026</p>
      <div style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.85}}>
        <H>1. Free Trial</H>
        <p>New subscribers may be offered a 7-day free trial with full access to the Service. You must provide a valid payment method to start the trial. If you do not cancel before the trial period ends, your subscription will automatically convert to the selected paid plan and your payment method will be charged. You may cancel your trial at any time through your account settings or by contacting us.</p>
        <H>2. Cancellation</H>
        <p>You may cancel your subscription at any time. To cancel: use the subscription management section in your account settings, or contact us at atlasalpaytr@gmail.com. Upon cancellation, you will retain access to the Service until the end of your current billing period. No partial refunds are issued for unused time within a billing period.</p>
        <H>3. Refund Policy</H>
        <p>We offer refunds under the following circumstances: if you cancel within the first 7 days of your initial paid subscription (not including free trial), you are eligible for a full refund. Refund requests made after 7 days of the initial paid subscription will be reviewed on a case-by-case basis. Refunds are NOT available for: partial billing periods after cancellation; accounts terminated for violation of our Terms of Service or Acceptable Use Policy; disputes arising from the accuracy of publicly available data analyzed by the Service.</p>
        <H>4. How to Request a Refund</H>
        <p>To request a refund, email atlasalpaytr@gmail.com with: your account email address, the date of purchase, the reason for the refund request. We will process your request within 5 business days. Approved refunds are issued to the original payment method and may take 5-10 business days to appear on your statement.</p>
        <H>5. Subscription Changes</H>
        <p>You may upgrade or downgrade your subscription at any time. Upgrades take effect immediately and are prorated. Downgrades take effect at the start of the next billing period. Additional seat charges ($15/seat/month for Business accounts) are prorated when seats are added mid-cycle.</p>
        <H>6. Paddle as Merchant of Record</H>
        <p>Payments are processed by Paddle.com, our merchant of record. Paddle handles all billing, invoicing, tax compliance, and payment disputes. For billing inquiries, you may also contact Paddle directly through the receipt email you receive after purchase.</p>
        <H>7. Contact</H>
        <p>Billing and refund inquiries: atlasalpaytr@gmail.com — Atlas Design Institute — Istanbul, Turkey</p>
      </div>
    </div>
  </div>;
}
