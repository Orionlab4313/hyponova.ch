import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * Oeffentliche, nicht-sensible Site-Settings fuer das Frontend.
 * Aktuell nur die Sichtbarkeit der Terminseite. Keine Secrets, kein Auth.
 */
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("termin_page_visible")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("public settings GET error:", error.message);
      // Fail-open: im Zweifel Terminseite anzeigen, damit nichts blockiert wird.
      return NextResponse.json({ termin_page_visible: true });
    }
    return NextResponse.json({ termin_page_visible: data?.termin_page_visible !== false });
  } catch (err) {
    console.error("public settings GET threw:", err);
    return NextResponse.json({ termin_page_visible: true });
  }
}
