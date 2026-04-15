import { geminiPredictive } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { sector, assets } = await req.json();
    if (!sector?.trim()) return NextResponse.json({ error: "Sector required" }, { status: 400 });
    const analysis = await geminiPredictive(sector, assets);
    if (!analysis) return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
    try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) await s.from("reports").insert({ user_id: user.id, type: "threat_assessment", title: `Threat Forecast: ${sector}`, subject: sector, content: analysis, classification: "CONFIDENTIAL" }); } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
