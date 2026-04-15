import { geminiGeospatial } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { location, context } = await req.json();
    if (!location?.trim()) return NextResponse.json({ error: "Location required" }, { status: 400 });
    const analysis = await geminiGeospatial(location, context);
    if (!analysis) return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
    try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) await s.from("reports").insert({ user_id: user.id, type: "threat_assessment", title: `GEOINT: ${location}`, subject: location, content: analysis, classification: "CONFIDENTIAL" }); } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
