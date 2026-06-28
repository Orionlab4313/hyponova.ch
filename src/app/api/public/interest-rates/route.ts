import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * Liefert die tagesaktuellen Zinssaetze fuer die Homepage.
 * Public, kein Auth. Wird beim Render der Startseite geladen.
 */
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("interest_rates")
      .select("saron_marge, fixed_5y, fixed_7y, fixed_10y, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("interest-rates GET error:", error.message);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    return NextResponse.json(data || null);
  } catch (err) {
    console.error("interest-rates GET threw:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
