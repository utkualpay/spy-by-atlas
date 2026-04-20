import { createClient } from "@supabase/supabase-js";
import { geminiCPIRAnalyze } from "@/lib/gemini";
import { NextResponse } from "next/server";
export const maxDuration = 60;

// Public route — accessed by employees via unique link (no auth required)
// Uses service role key for elevated DB access

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// GET: fetch test by token (for employee to view questions)
export async function GET(req, { params }) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    const sb = getAdmin();
    const { data, error } = await sb.from("cpir_results").select("*").eq("assessment_code", token).single();
    if (error || !data) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    if (data.answers && Object.keys(data.answers).length > 0) return NextResponse.json({ error: "Assessment already completed" }, { status: 410 });

    // Fetch employer info
    const { data: employer } = await sb.from("profiles").select("full_name, email, company").eq("id", data.org_id).single();
    return NextResponse.json({
      token,
      employee_name: data.employee_name,
      employer_name: employer?.company || employer?.full_name || "Your employer",
      questions: data.dimensions?.questions || [],
    });
  } catch (e) {
    return NextResponse.json({ error: "Error loading assessment" }, { status: 500 });
  }
}

// POST: submit answers from employee
export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const { answers } = await req.json();
    if (!token || !answers) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    const sb = getAdmin();

    const { data: test, error: fetchErr } = await sb.from("cpir_results").select("*").eq("assessment_code", token).single();
    if (fetchErr || !test) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    if (test.answers && Object.keys(test.answers).length > 0) return NextResponse.json({ error: "Already submitted" }, { status: 410 });

    // AI-analyze the responses
    const questions = test.dimensions?.questions || [];
    const analysis = await geminiCPIRAnalyze(questions, answers, test.employee_name);

    // Save results
    await sb.from("cpir_results").update({
      answers,
      risk_label: "ANALYZED",
      dimensions: { ...test.dimensions, analysis_text: analysis, submitted_at: new Date().toISOString() }
    }).eq("assessment_code", token);

    // Also save a report for the employer
    await sb.from("reports").insert({
      user_id: test.org_id,
      type: "custom",
      title: `CPIR Results: ${test.employee_name}`,
      subject: test.employee_name,
      content: analysis,
      classification: "CONFIDENTIAL",
      metadata: { cpir_token: token, completed_at: new Date().toISOString() }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
