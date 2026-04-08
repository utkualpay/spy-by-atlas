import { claudeSearch } from "@/lib/claude";
import { NextResponse } from "next/server";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { target } = await req.json();
    if (!target?.trim()) return NextResponse.json({ error: "Target required" }, { status: 400 });
    const analysis = await claudeSearch(`You are an executive protection analyst. Assess exposure for "${target}": public appearances, exposed personal info, data brokers, negative press, physical security concerns, digital attack surface. Risk rate each finding. Provide protection recommendations. Be thorough.`);
    if (!analysis) return NextResponse.json({ error: "Assessment failed" }, { status: 502 });
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
