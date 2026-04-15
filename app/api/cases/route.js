import { geminiCaseAnalysis } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { caseData } = await req.json();
    if (!caseData?.trim()) return NextResponse.json({ error: "Case data required" }, { status: 400 });
    const analysis = await geminiCaseAnalysis(caseData);
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
