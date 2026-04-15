import { geminiDarkWeb } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { query, queryType } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
    const analysis = await geminiDarkWeb(query, queryType || "entity");
    if (!analysis) return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
    try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) await s.from("reports").insert({ user_id: user.id, type: "osint", title: `Dark Web Intel: ${query}`, subject: query, content: analysis, classification: "RESTRICTED" }); } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
