"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const C={bg:"#09090b",bgCard:"#131316",bgInput:"#18181c",border:"#1f1f25",text:"#e4e0d9",textSec:"#9d9890",textDim:"#5c5854",gold:"#c4a265",goldDim:"rgba(196,162,101,0.10)",low:"#6b9e7a"};
const mono="'IBM Plex Mono',monospace",serif="'Cormorant Garamond',serif",sans="'Raleway',sans-serif";

export default function CPIRPublicPage(){
  const params=useParams();
  const token=params.token;
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState("");
  const[test,setTest]=useState(null);
  const[answers,setAnswers]=useState({});
  const[step,setStep]=useState(0); // 0=intro, 1=questions, 2=done
  const[submitting,setSubmitting]=useState(false);
  const[submitted,setSubmitted]=useState(false);

  useEffect(()=>{
    fetch(`/api/cpir/${token}`).then(r=>r.json()).then(d=>{
      if(d.error){setError(d.error);}else{setTest(d);}
      setLoading(false);
    }).catch(()=>{setError("Assessment not found or expired.");setLoading(false);});
  },[token]);

  const submitTest=async()=>{
    setSubmitting(true);
    try{
      const r=await fetch(`/api/cpir/${token}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers})});
      const d=await r.json();
      if(d.error){setError(d.error);}else{setSubmitted(true);setStep(2);}
    }catch(e){setError("Submission failed.");}
    setSubmitting(false);
  };

  const allAnswered=test?.questions?.every(q=>answers[q.id]!==undefined);

  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:sans,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
    <div style={{maxWidth:680,width:"100%",animation:"fadeIn 0.5s ease"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{display:"inline-flex",alignItems:"baseline",gap:3,marginBottom:12}}>
          <span style={{fontSize:28,fontFamily:serif,fontWeight:300,color:C.gold,letterSpacing:"3px"}}>Spy</span>
          <span style={{fontSize:8,color:C.textDim,fontFamily:mono,letterSpacing:"1.5px"}}>by Atlas</span>
        </div>
        <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.textDim,textTransform:"uppercase"}}>Confidential Assessment</div>
      </div>

      {loading&&<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:40,textAlign:"center"}}>
        <div style={{fontSize:11,fontFamily:mono,color:C.gold,letterSpacing:"2px"}}>LOADING...</div>
      </div>}

      {error&&!loading&&<div style={{background:C.bgCard,border:"1px solid rgba(196,92,92,0.3)",borderRadius:4,padding:40,textAlign:"center"}}>
        <div style={{fontSize:22,fontFamily:serif,fontWeight:300,marginBottom:12}}>Assessment Unavailable</div>
        <p style={{fontSize:13,color:C.textDim,fontWeight:200}}>{error}</p>
      </div>}

      {test&&step===0&&!submitted&&<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:36,animation:"fadeIn 0.4s ease"}}>
        <h1 style={{fontSize:26,fontFamily:serif,fontWeight:300,marginBottom:8}}>Workplace Assessment</h1>
        <p style={{fontSize:13,color:C.textDim,fontFamily:mono,marginBottom:20}}>Requested by: {test.employer_name||"Your employer"}</p>

        <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:16}}>Hello {test.employee_name||"there"},</p>
        <p style={{fontSize:14,color:C.textSec,fontWeight:200,lineHeight:1.7,marginBottom:16}}>You have been invited to complete a brief workplace engagement assessment. This helps your organization understand team wellbeing and work environment factors.</p>

        <div style={{padding:"16px 20px",background:C.goldDim,border:`1px solid ${C.gold}30`,borderRadius:4,marginBottom:20}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"1.5px",color:C.gold,textTransform:"uppercase",marginBottom:8}}>Assessment Details</div>
          <div style={{fontSize:12,color:C.textSec,fontWeight:200,lineHeight:1.6}}>
            • Approximately 5-8 minutes to complete<br/>
            • {test.questions?.length||15} questions on a 5-point scale<br/>
            • Your responses are confidential and submitted directly to your organization<br/>
            • There are no right or wrong answers — respond honestly
          </div>
        </div>

        <button onClick={()=>setStep(1)} style={{width:"100%",padding:"16px 24px",border:`1px solid ${C.gold}`,borderRadius:3,background:C.goldDim,color:C.gold,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>Begin Assessment</button>
      </div>}

      {test&&step===1&&!submitted&&<div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:4,padding:28,animation:"fadeIn 0.4s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:10,fontFamily:mono,letterSpacing:"2px",color:C.gold,textTransform:"uppercase"}}>Questions</div>
          <div style={{fontSize:11,fontFamily:mono,color:C.textDim}}>{Object.keys(answers).length} / {test.questions?.length||0} answered</div>
        </div>

        <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden",marginBottom:24}}>
          <div style={{height:"100%",background:C.gold,width:`${(Object.keys(answers).length/(test.questions?.length||1))*100}%`,transition:"width 0.3s"}}/>
        </div>

        {test.questions?.map((q,i)=><div key={q.id} style={{marginBottom:28,paddingBottom:20,borderBottom:i<(test.questions.length-1)?`1px solid ${C.border}`:"none"}}>
          <div style={{fontSize:11,fontFamily:mono,color:C.textDim,marginBottom:8}}>Question {i+1}</div>
          <div style={{fontSize:15,color:C.text,fontWeight:300,lineHeight:1.5,marginBottom:14}}>{q.text}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["1","Strongly Disagree"],["2","Disagree"],["3","Neutral"],["4","Agree"],["5","Strongly Agree"]].map(([v,lbl])=>
              <button key={v} onClick={()=>setAnswers({...answers,[q.id]:v})} style={{padding:"8px 14px",border:`1px solid ${answers[q.id]===v?C.gold:C.border}`,borderRadius:3,background:answers[q.id]===v?C.goldDim:"transparent",color:answers[q.id]===v?C.gold:C.textSec,fontSize:11,fontFamily:sans,cursor:"pointer",fontWeight:answers[q.id]===v?500:300,flex:"1 1 auto",minWidth:"120px"}}>{lbl}</button>
            )}
          </div>
        </div>)}

        <button onClick={submitTest} disabled={!allAnswered||submitting} style={{width:"100%",padding:"16px 24px",border:`1px solid ${allAnswered?C.gold:C.border}`,borderRadius:3,background:allAnswered?C.goldDim:"transparent",color:allAnswered?C.gold:C.textDim,fontSize:11,fontFamily:mono,letterSpacing:"2px",textTransform:"uppercase",cursor:allAnswered?"pointer":"default",fontWeight:500,opacity:submitting?.5:1}}>{submitting?"Submitting...":allAnswered?"Submit Assessment":`Answer all ${test.questions?.length||0} questions to continue`}</button>
      </div>}

      {submitted&&<div style={{background:C.bgCard,border:"1px solid rgba(107,158,122,0.3)",borderRadius:4,padding:40,textAlign:"center",animation:"fadeIn 0.4s ease"}}>
        <div style={{fontSize:40,color:C.low,marginBottom:16}}>✓</div>
        <h2 style={{fontSize:22,fontFamily:serif,fontWeight:300,marginBottom:12}}>Assessment Complete</h2>
        <p style={{fontSize:13,color:C.textDim,fontWeight:200,lineHeight:1.6}}>Thank you for taking the time to complete this assessment. Your responses have been submitted confidentially. You may close this window.</p>
      </div>}

      <div style={{textAlign:"center",marginTop:30,fontSize:10,fontFamily:mono,color:C.textDim,letterSpacing:"1px"}}>SECURE SUBMISSION — SPY BY ATLAS</div>
    </div>
  </div>;
}
