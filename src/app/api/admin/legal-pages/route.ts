import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Legal-pages GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
