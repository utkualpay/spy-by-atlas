import { claudeSearch } from "@/lib/claude";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const PROMPTS = {
  email: (q) => `You are an OSINT intelligence analyst. Conduct a thorough search for the email address "${q}". Search for: 1) Data breaches 2) Social media profiles 3) Public records, forum posts, paste sites 4) Professional profiles. For each finding provide source, data exposed, risk rating (critical/high/medium/low), URL. Provide remediation. Be thorough and factual.`,
  username: (q) => `You are an OSINT intelligence analyst. Search for the username "${q}" across: social media, forums, gaming profiles, web presence. Provide platform, URL, visible info, risk rating. Be factual.`,
  domain: (q) => `You are an OSINT intelligence analyst. Investigate domain "${q}": WHOIS, DNS, technologies, vulnerabilities, SSL, associated emails. Provide risk ratings. Be factual.`,
  phone: (q) => `You are an OSINT intelligence analyst. Research phone "${q}": associated profiles, caller ID, data brokers, breaches. Provide risk ratings. Be factual.`,
  ip: (q) => `You are an OSINT intelligence analyst. Investigate IP "${q}": geolocation, domains, blacklists, open ports, abuse reports. Provide risk ratings. Be factual.`,
  company: (q) => `You are an OSINT intelligence analyst. Research company "${q}": structure, key personnel, news, breaches, patents, financials, employee reviews, domain footprint. Provide risk ratings. Be thorough.`,
};

export async function POST(req) {
  try {
    const { query, type } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
    const promptFn = PROMPTS[type] || PROMPTS.email;
    const analysis = await claudeSearch(promptFn(query));
    if (!analysis) return NextResponse.json({ error: "Search failed. Verify ANTHROPIC_API_KEY is set." }, { status: 502 });
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
