import { createClient } from "@/lib/supabase-server";
import { geminiCPIRQuestions } from "@/lib/gemini";
import { NextResponse } from "next/server";
export const maxDuration = 60;

const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID || "mvzvdjrq";

// GET: list all CPIR assessments (results visible to employer only)
export async function GET() {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const { data } = await s.from("cpir_results").select("*").eq("org_id", user.id).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return NextResponse.json([], { status: 500 }); }
}

// POST: handle actions
export async function POST(req) {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { action } = body;

    // Master views the question set (read-only preview)
    if (action === "preview_questions") {
      const questions = await geminiCPIRQuestions();
      if (!questions) return NextResponse.json({ error: "Failed to generate questions" }, { status: 502 });
      return NextResponse.json({ questions });
    }

    // Master assigns test to employee (by email)
    if (action === "assign") {
      const { employeeName, employeeEmail, department } = body;
      if (!employeeEmail?.trim()) return NextResponse.json({ error: "Employee email required" }, { status: 400 });

      // Generate fresh question set for this employee
      const questions = await geminiCPIRQuestions();
      if (!questions) return NextResponse.json({ error: "Question generation failed" }, { status: 502 });

      // Generate unique token
      const token = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();

      // Store in DB
      const { data, error } = await s.from("cpir_results").insert({
        org_id: user.id,
        employee_name: employeeName || employeeEmail,
        department: department || null,
        assessment_code: token,
        dimensions: { questions, assigned_at: new Date().toISOString(), employee_email: employeeEmail },
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Email the employee via Formspree
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://atlasspy.com";
      const testUrl = `${baseUrl}/cpir/${token}`;
      try {
        await fetch(`https://formspree.io/f/${FORMSPREE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: `Workplace Assessment Request`,
            _replyto: user.email,
            email: employeeEmail,
            to: employeeEmail,
            message: `Hello ${employeeName || ""},\n\nYou have been invited to complete a brief workplace engagement assessment.\n\nThe assessment takes approximately 5-8 minutes. Your responses are confidential.\n\nAccess your assessment here: ${testUrl}\n\nThank you.`,
            assessment_link: testUrl,
          })
        });
      } catch (e) { console.error("Email notification failed:", e); }

      return NextResponse.json({ success: true, token, assessmentUrl: testUrl });
    }

    // Delete a test
    if (action === "delete") {
      const { id } = body;
      await s.from("cpir_results").delete().eq("id", id).eq("org_id", user.id);
      return NextResponse.json({ success: true });
    }

    // Get single result (full report)
    if (action === "view") {
      const { id } = body;
      const { data } = await s.from("cpir_results").select("*").eq("id", id).eq("org_id", user.id).single();
      return NextResponse.json(data || { error: "Not found" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
