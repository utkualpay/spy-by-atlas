import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    const s = await createClient(); const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action, documentName, recipients, tokenType } = await req.json();
    if (action === "generate") {
      const tokens = (recipients || []).map((r, i) => ({
        user_id: user.id,
        token_id: `HT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}-${i}`.toUpperCase(),
        document_name: documentName || "Unnamed",
        recipient: r,
        token_type: tokenType || "document",
      }));
      const { data } = await s.from("honeytokens").insert(tokens).select();
      return NextResponse.json({ tokens: data || tokens });
    }
    if (action === "list") {
      const { data } = await s.from("honeytokens").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return NextResponse.json(data || []);
    }
    if (action === "trigger") {
      const { tokenId, details } = await req.json();
      await s.from("honeytokens").update({ triggered: true, triggered_at: new Date().toISOString(), triggered_details: details }).eq("token_id", tokenId).eq("user_id", user.id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
