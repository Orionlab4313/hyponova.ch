import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { isValidGoogleTagId } from "@/lib/ads";

/**
 * Oeffentliche, nicht-sensible Site-Settings fuer das Frontend.
 * Sichtbarkeit der Terminseite plus die aktive Google-Tag-ID (steht ohnehin
 * im Seitenquelltext, ist also kein Geheimnis). Keine Secrets, kein Auth.
 */
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("termin_page_visible, google_tag_id, google_tag_enabled")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("public settings GET error:", error.message);
      // Fail-open für die Terminseite, fail-closed für Werbung: im Zweifel kein Tag.
      return NextResponse.json({ termin_page_visible: true, google_tag_id: null });
    }
    const tagId =
      data?.google_tag_enabled === true && isValidGoogleTagId(data.google_tag_id)
        ? data.google_tag_id
        : null;
    return NextResponse.json({
      termin_page_visible: data?.termin_page_visible !== false,
      google_tag_id: tagId,
    });
  } catch (err) {
    console.error("public settings GET threw:", err);
    return NextResponse.json({ termin_page_visible: true, google_tag_id: null });
  }
}
