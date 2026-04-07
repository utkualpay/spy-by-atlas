import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });

    const { data } = await supabase
      .from("cpir_results")
      .select("*")
      .eq("org_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { error } = await supabase.from("cpir_results").insert({
      org_id: user.id,
      employee_name: body.name,
      department: body.dept,
      assessment_code: body.code,
      dimensions: body.dims,
      risk_score: body.risk,
      risk_label: body.riskLabel,
      answers: body.answers,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
