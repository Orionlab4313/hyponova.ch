import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * Public Download-Proxy fuer Dokument-Vorlagen.
 *
 * Statt die Supabase-Storage-URL nach aussen zu zeigen
 * (https://xxx.supabase.co/storage/v1/object/...) leiten wir alle Downloads
 * ueber einen sauberen hyponova.ch-Pfad: /api/public/vorlagen/<id>/download
 *
 * Vorteile:
 * - Branded URL in Bestaetigungs-Emails und Customer-Seiten
 * - Original-Dateiname als Content-Disposition (statt Storage-Hash)
 * - Spaeter koennen wir Download-Tracking ergaenzen ohne API-Bruch
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const langParam = url.searchParams.get("lang");
    const wantEn = langParam === "en";

    const supabase = createServiceClient();

    const { data: vorlage, error } = await supabase
      .from("dokument_vorlagen")
      .select("file_url, file_name, file_url_en, file_name_en, active")
      .eq("id", id)
      .maybeSingle();

    if (error || !vorlage) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    if (!vorlage.active) {
      return NextResponse.json({ error: "Vorlage nicht verfügbar" }, { status: 404 });
    }

    // Wenn EN angefragt und EN-File vorhanden, EN ausliefern, sonst DE-Fallback.
    const useEn = wantEn && Boolean(vorlage.file_url_en);
    const targetUrl = useEn ? vorlage.file_url_en! : vorlage.file_url;
    const targetName = useEn ? (vorlage.file_name_en || "template.pdf") : (vorlage.file_name || "vorlage.pdf");

    // Datei aus Supabase Storage laden und als Stream weiterleiten
    const fileRes = await fetch(targetUrl);
    if (!fileRes.ok || !fileRes.body) {
      return NextResponse.json({ error: "Datei konnte nicht geladen werden" }, { status: 502 });
    }

    const safeFilename = targetName.replace(/["\\]/g, "");

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Vorlage download error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
