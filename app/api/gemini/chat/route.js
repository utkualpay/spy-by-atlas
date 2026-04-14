import { geminiWarRoom } from "@/lib/gemini";
import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { history } = await req.json();
    if (!history?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });
    const reply = await geminiWarRoom(history);
    if (!reply) return NextResponse.json({ error: "Intelligence analyst unavailable. Retry." }, { status: 502 });
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: "Connection error" }, { status: 500 });
  }
}
