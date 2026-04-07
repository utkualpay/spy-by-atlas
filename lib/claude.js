// Server-side only — never import this from client components
export async function claudeSearch(prompt) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d = await r.json();
    if (d.error) {
      console.error("Claude API error:", d.error);
      return null;
    }
    return d.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
  } catch (e) {
    console.error("Claude API error:", e);
    return null;
  }
}

export async function claudeJSON(prompt) {
  const text = await claudeSearch(prompt);
  if (!text) return null;
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const s = clean.search(/[\[{]/);
    const e = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
    if (s === -1 || e === -1) return null;
    return JSON.parse(clean.substring(s, e + 1));
  } catch (e) {
    console.error("JSON parse error:", e);
    return null;
  }
}
