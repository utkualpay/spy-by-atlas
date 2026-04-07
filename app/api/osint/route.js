import { claudeSearch } from "@/lib/claude";
import { NextResponse } from "next/server";

const PROMPTS = {
  email: (q) => `You are an OSINT intelligence analyst. Conduct a thorough search for the email address "${q}". Search the web for: 1) Any data breaches this email has appeared in 2) Social media profiles and accounts linked to this email 3) Any public records, forum posts, paste site appearances, or website registrations 4) Professional profiles (LinkedIn, GitHub, etc). For each finding provide the source/platform, what data is exposed, a risk rating (critical/high/medium/low), and a direct URL where available. Also provide specific remediation steps for each finding. Be thorough and factual.`,
  username: (q) => `You are an OSINT intelligence analyst. Conduct a thorough search for the username "${q}" across the internet. Search for: 1) Social media accounts using this username (Twitter/X, Reddit, Instagram, GitHub, TikTok, Discord, etc) 2) Forum accounts and posts 3) Gaming profiles 4) Any other web presence. For each finding provide the platform, URL, what information is visible, and a risk rating. Be factual.`,
  domain: (q) => `You are an OSINT intelligence analyst. Conduct a thorough investigation of the domain "${q}". Search for: 1) WHOIS registration data 2) DNS records and subdomains 3) Technologies used 4) Historical data 5) Any security vulnerabilities or incidents 6) Associated email addresses 7) SSL certificate information. Provide findings with risk ratings. Be factual.`,
  phone: (q) => `You are an OSINT intelligence analyst. Research the phone number "${q}". Search for: 1) Associated accounts or profiles 2) Caller ID services or public listings 3) Data broker presence 4) Any breach appearances. Provide findings with risk ratings. Be factual.`,
  ip: (q) => `You are an OSINT intelligence analyst. Investigate the IP address "${q}". Search for: 1) Geolocation data 2) Associated domains 3) Blacklist status 4) Open ports or services 5) Any abuse reports. Provide findings with risk ratings. Be factual.`,
  company: (q) => `You are an OSINT intelligence analyst. Research the company "${q}". Search for: 1) Corporate structure and key personnel 2) Recent news and press 3) Data breaches or security incidents 4) Patent filings and IP 5) Financial indicators 6) Employee reviews and internal culture signals 7) Domain and technology footprint. Provide findings with risk ratings. Be factual and thorough.`,
};

export async function POST(req) {
  try {
    const { query, type } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });
    const promptFn = PROMPTS[type] || PROMPTS.email;
    const analysis = await claudeSearch(promptFn(query));
    if (!analysis) return NextResponse.json({ error: "Search failed" }, { status: 502 });
    return NextResponse.json({ analysis, timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
