// Server-side only — Gemini 2.5 Flash (fast) + 2.5 Pro (deep analysis)
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function geminiCall(model, prompt, systemInstruction, temperature = 0.7) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: 8192 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (d.error) { console.error("Gemini error:", d.error); return null; }
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Chat with history support (for War Room)
async function geminiChat(model, history, systemInstruction) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.75, maxOutputTokens: 4096 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (d.error) { console.error("Gemini chat error:", d.error); return null; }
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// Fast operations: news, quick scans, chat
export async function geminiFlash(prompt, system) {
  return geminiCall("gemini-2.5-flash-preview-05-20", prompt, system, 0.6);
}

// Deep analysis: OSINT reports, threat assessments, breach analysis
export async function geminiPro(prompt, system) {
  return geminiCall("gemini-2.5-pro-preview-05-06", prompt, system, 0.4);
}

// Structured JSON output
export async function geminiJSON(prompt, system) {
  const text = await geminiFlash(prompt + "\n\nRespond with ONLY valid JSON, no markdown fences, no explanation.", system);
  if (!text) return null;
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const s = clean.search(/[\[{]/);
    const e = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
    if (s === -1 || e === -1) return null;
    return JSON.parse(clean.substring(s, e + 1));
  } catch (e) { console.error("Gemini JSON parse error:", e); return null; }
}

// War Room chat
export async function geminiWarRoom(history) {
  const sys = `You are a senior intelligence analyst working for Spy by Atlas, a private intelligence platform. Your codename is ATLAS ACTUAL. You speak in concise, professional intelligence language. You have deep expertise in OSINT, HUMINT, SIGINT, counterintelligence, cyber threat analysis, geopolitical risk assessment, and executive protection.

When the user describes a situation, you:
1. Assess the threat level (CRITICAL / HIGH / MODERATE / LOW)
2. Identify immediate actions required
3. Provide intelligence-grade analysis
4. Recommend next steps with specific, actionable guidance

You never say "I'm an AI" or break character. You are an intelligence professional. Be direct, be precise, be authoritative. Use intelligence terminology naturally. Reference real-world tradecraft when relevant.

If the user asks for things outside your scope, redirect them to the appropriate module within the Spy platform.`;
  return geminiChat("gemini-2.5-flash-preview-05-20", history, sys);
}

// OSINT Report Generation (deep, formal, intelligence-grade)
export async function geminiOSINT(query, type) {
  const sys = `You are a senior OSINT analyst at a private intelligence firm. You produce formal intelligence reports in the style of classified briefings. Your language is professional, precise, and authoritative — never casual, never AI-sounding.

Report structure:
1. EXECUTIVE SUMMARY — 2-3 sentences, key findings
2. SUBJECT IDENTIFICATION — who/what is being investigated
3. FINDINGS — organized by source category (social media, public records, breach databases, corporate filings, media mentions, technical footprint)
4. THREAT ASSESSMENT — risk level with justification
5. EXPOSURE MATRIX — what data is publicly available and where
6. RECOMMENDED ACTIONS — specific, prioritized remediation steps
7. INTELLIGENCE GAPS — what could not be determined and what further investigation would require
8. CLASSIFICATION — sensitivity level of this report

Use precise language. Cite specific platforms and data points. Never hedge with "it's possible" — state what the evidence shows and what it doesn't. Format with clear headers and professional structure. This report will be read by executives and security professionals.`;

  const prompts = {
    email: `Conduct a comprehensive OSINT investigation on the email address: ${query}. Search across all available open sources. Produce a formal intelligence report.`,
    username: `Conduct a comprehensive OSINT investigation on the username: ${query}. Enumerate all platforms, assess digital footprint, identify linked accounts. Produce a formal intelligence report.`,
    domain: `Conduct a comprehensive OSINT investigation on the domain: ${query}. Analyze WHOIS, DNS, technology stack, historical data, security posture, associated entities. Produce a formal intelligence report.`,
    phone: `Conduct a comprehensive OSINT investigation on the phone number: ${query}. Search carrier data, associated accounts, public listings, breach appearances. Produce a formal intelligence report.`,
    ip: `Conduct a comprehensive OSINT investigation on the IP address: ${query}. Analyze geolocation, associated infrastructure, reputation, threat indicators. Produce a formal intelligence report.`,
    company: `Conduct a comprehensive OSINT investigation on the company: ${query}. Analyze corporate structure, key personnel, financial indicators, security incidents, competitive positioning, digital footprint. Produce a formal intelligence report.`,
    person: `Conduct a comprehensive OSINT investigation on the individual: ${query}. Analyze public presence, professional history, digital footprint, exposure risks, social connections. Produce a formal intelligence report.`,
  };

  return geminiPro(prompts[type] || prompts.person, sys);
}

// Daily Intelligence Brief
export async function geminiDailyBrief(userProfile) {
  const sys = `You are an intelligence briefing officer preparing a daily classified brief for a high-value client. The brief must sound entirely human-written — no AI patterns, no bullet-point dumps, no "here's what you need to know" phrases.

Write as a seasoned intelligence professional would write a morning brief for a CEO or government official. Use measured, authoritative prose. Include:

1. SITUATION OVERVIEW — global threat landscape relevant to the client's sector
2. PRIORITY ALERTS — anything requiring immediate attention
3. SECTOR INTELLIGENCE — developments in the client's industry
4. CYBER THREAT LANDSCAPE — current active threats, vulnerability advisories
5. GEOPOLITICAL DEVELOPMENTS — conflicts, tensions, policy changes affecting operations
6. RECOMMENDED POSTURE — suggested security stance for the day

The tone must be: calm, precise, professional, slightly formal but readable. Like a senior advisor speaking to a principal. Never use phrases like "in today's rapidly evolving landscape" or "it's important to note" — those are AI tells. Write like a human intelligence professional.`;

  const prompt = userProfile
    ? `Prepare today's intelligence brief for a client with the following profile:\nIndustry: ${userProfile.industry || "General"}\nRole: ${userProfile.role || "Executive"}\nInterests: ${userProfile.interests || "General security"}\nConcerns: ${userProfile.concerns || "Digital exposure, competitive intelligence"}`
    : `Prepare today's intelligence brief for a general executive audience.`;

  return geminiPro(prompt, sys);
}

// Breach Data Analysis
export async function geminiBreachAnalysis(breachData, userEmail) {
  const sys = `You are a cyber security analyst specializing in breach data analysis. Analyze the provided breach records and produce a formal security assessment. Identify: exposed credentials, severity of exposure, recommended immediate actions, long-term remediation, and threat actor context where identifiable.`;
  return geminiFlash(`Analyze the following breach data for the email/identity "${userEmail}":\n\n${breachData}\n\nProduce a formal breach impact assessment.`, sys);
}

// Social Media Analysis
export async function geminiSocialAnalysis(handles) {
  const sys = `You are a social media intelligence (SOCMINT) analyst. Analyze the provided social media handles and produce a security assessment covering: public information exposure, privacy setting recommendations, potential social engineering vectors, impersonation risks, and overall digital hygiene score.`;
  return geminiFlash(`Conduct a social media security assessment for the following accounts:\n${handles.map(h => `- ${h.platform}: ${h.handle}`).join("\n")}\n\nProduce a formal SOCMINT assessment report.`, sys);
}

// Image Security Analysis explanation
export async function geminiImageAnalysis(filename, filesize, dimensions) {
  const sys = `You are a digital forensics analyst explaining an image security scan to a non-technical client. Be thorough, professional, and educational.`;
  return geminiFlash(`An image file was uploaded for security scanning. File: "${filename}", Size: ${filesize}, Dimensions: ${dimensions || "unknown"}. Explain step-by-step the security scan process that was conducted on this file, including: EXIF metadata extraction, steganography detection, reverse image search, malware payload scanning, geolocation data check, and any other relevant digital forensics procedures. Write as if presenting findings to a client.`, sys);
}
