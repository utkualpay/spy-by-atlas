import { geminiIdentityVerify } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { name, additionalData } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const analysis = await geminiIdentityVerify(name, additionalData);
    if (!analysis) return NextResponse.json({ error: "Verification failed" }, { status: 502 });
    try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) await s.from("reports").insert({ user_id: user.id, type: "osint", title: `Identity Verification: ${name}`, subject: name, content: analysis, classification: "CONFIDENTIAL" }); } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
