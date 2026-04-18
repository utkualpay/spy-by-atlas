import { geminiPro } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { destination, flight, hotel, dates, purpose } = await req.json();
    if (!destination?.trim()) return NextResponse.json({ error: "Destination required" }, { status: 400 });
    const analysis = await geminiPro(
      `Produce a pre-travel intelligence briefing for:\nDestination: ${destination}\nFlight: ${flight || "Not specified"}\nHotel: ${hotel || "Not specified"}\nDates: ${dates || "Not specified"}\nPurpose: ${purpose || "Business"}\n\nCover: 1) Kinetic threat assessment (terrorism, crime, civil unrest) 2) Cyber threat landscape (Wi-Fi intercept risks at the hotel/airport, surveillance concerns) 3) Geopolitical situation affecting the destination 4) Health/medical considerations 5) Local law enforcement reliability 6) Communications security recommendations 7) Emergency contacts and safe havens 8) Transportation security (airport, ground transport) 9) Hotel security assessment 10) Cultural/legal considerations that affect security posture. Produce a formal pre-travel security dossier.`,
      "You are a travel security analyst producing formal pre-travel briefings for high-value individuals. Be specific and actionable."
    );
    if (!analysis) return NextResponse.json({ error: "Briefing failed" }, { status: 502 });
    try { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (user) await s.from("reports").insert({ user_id: user.id, type: "custom", title: `Travel Brief: ${destination}`, subject: destination, content: analysis, classification: "CONFIDENTIAL" }); } catch (e) {}
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
