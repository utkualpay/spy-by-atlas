import { geminiFlash } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { handles, childName } = await req.json();
    const analysis = await geminiFlash(
      `Conduct a child safety social media assessment for: ${childName || "Minor"}\nAccounts: ${handles?.map(h => `${h.platform}: ${h.handle}`).join(", ") || "Not specified"}\n\nAnalyze for: 1) Cyberbullying indicators 2) Predatory contact patterns 3) Toxic interaction signals 4) Age-inappropriate content exposure 5) Location sharing risks 6) Contact with unknown adults 7) Mental health warning signs in public posts 8) Privacy setting recommendations. Do NOT reproduce any private messages. Produce a parental safety assessment with alert levels (GREEN/YELLOW/RED) per category.`,
      "You are a child safety analyst. Produce formal safety assessments for parents. Be sensitive but thorough. Never reproduce private content."
    );
    if (!analysis) return NextResponse.json({ error: "Assessment failed" }, { status: 502 });
    try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) await s.from("reports").insert({ user_id: user.id, type: "social_media", title: `Child Safety: ${childName || "Minor"}`, content: analysis, classification: "RESTRICTED" }); } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
