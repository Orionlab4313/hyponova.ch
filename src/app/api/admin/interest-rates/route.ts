import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED = ["saron_marge", "fixed_5y", "fixed_7y", "fixed_10y"] as const;

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("interest_rates")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    return NextResponse.json(data || null);
  } catch (err) {
    console.error("admin interest-rates GET:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const updates: Record<string, number | null> = {};
    for (const key of ALLOWED) {
      if (key in body) {
        const v = body[key];
        if (v === null || v === "") {
          updates[key] = null;
        } else {
          const num = Number(v);
          if (Number.isNaN(num) || num < 0 || num > 100) {
            return NextResponse.json({ error: `${key} muss eine Zahl zwischen 0 und 100 sein` }, { status: 400 });
          }
          updates[key] = Math.round(num * 100) / 100;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Keine Aenderungen" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("interest_rates")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      console.error("admin interest-rates PATCH DB:", error);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("admin interest-rates PATCH:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
