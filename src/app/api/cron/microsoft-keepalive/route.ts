import { NextRequest, NextResponse } from "next/server";
import { checkMicrosoftConnection } from "@/lib/microsoft-graph";

/**
 * GET /api/cron/microsoft-keepalive
 *
 * Läuft täglich um 04:00 UTC über Vercel Cron (siehe vercel.json).
 * Erneuert das Microsoft-Token, auch wenn wochenlang kein Termin gebucht wird.
 * Hintergrund: Ein Refresh-Token verfällt nach 90 Tagen ohne Nutzung. Danach
 * kamen Bestätigungen ohne Teams-Link (Vorfall November 2026).
 * Das Ergebnis landet in admin_settings und wird im Admin angezeigt.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;

  if (process.env.CRON_SECRET) {
    if (authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const result = await checkMicrosoftConnection();
  if (!result.configured) {
    return NextResponse.json({ success: true, skipped: "not_connected" });
  }
  if (!result.ok) {
    console.error("microsoft-keepalive: Verbindung defekt:", result.error);
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
