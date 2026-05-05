import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getMicrosoftConfig,
  createOnlineMeeting,
  deleteOnlineMeeting,
} from "@/lib/microsoft-graph";

/**
 * Diagnose-Endpunkt: Testet die Microsoft Graph Integration end-to-end.
 * 1. Liest Config aus DB
 * 2. Erstellt Test-Meeting (5 Min in der Zukunft)
 * 3. Loescht es sofort wieder
 * 4. Gibt detaillierten Status zurueck
 *
 * Wird vom Admin-UI ueber den "Test"-Button aufgerufen.
 */
export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const steps: { step: string; ok: boolean; detail?: string }[] = [];

  // Step 1: Config aus DB lesen
  let config;
  try {
    config = await getMicrosoftConfig();
    if (!config) {
      steps.push({
        step: "Config aus DB lesen",
        ok: false,
        detail: "getMicrosoftConfig() returned null. Möglicherweise: Refresh-Token fehlt, Secret konnte nicht entschlüsselt werden, oder Connection nie abgeschlossen.",
      });
      return NextResponse.json({ success: false, steps });
    }
    steps.push({
      step: "Config aus DB lesen",
      ok: true,
      detail: `User: ${config.userEmail || "?"}, Tenant: ${config.tenantId.slice(0, 8)}…`,
    });
  } catch (e) {
    steps.push({ step: "Config aus DB lesen", ok: false, detail: String(e) });
    return NextResponse.json({ success: false, steps });
  }

  // Step 2: Test-Meeting erstellen (5 Min in der Zukunft, 30 Min Dauer)
  let eventId: string | null = null;
  let joinUrl: string | null = null;
  try {
    const start = new Date(Date.now() + 5 * 60_000);
    const end = new Date(start.getTime() + 30 * 60_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const isoLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    const meeting = await createOnlineMeeting({
      subject: "HYPONOVA Test-Meeting (wird automatisch gelöscht)",
      startIso: isoLocal(start),
      endIso: isoLocal(end),
      timeZone: "Europe/Zurich",
      bodyText: "Diagnose-Test — wird sofort wieder gelöscht.",
    });

    if (!meeting) {
      steps.push({
        step: "Test-Meeting erstellen",
        ok: false,
        detail:
          "createOnlineMeeting() returned null. Mögliche Ursachen: " +
          "(a) Token-Refresh fehlgeschlagen, " +
          "(b) Microsoft Graph Permission-Problem, " +
          "(c) /me/events Endpoint nicht erreichbar. " +
          "Prüfe Vercel-Function-Logs für Details.",
      });
      return NextResponse.json({ success: false, steps });
    }

    eventId = meeting.eventId;
    joinUrl = meeting.joinUrl;
    steps.push({
      step: "Test-Meeting erstellen",
      ok: true,
      detail: `Event-ID: ${eventId.slice(0, 20)}…, Join-URL: ${joinUrl.slice(0, 60)}…`,
    });
  } catch (e) {
    steps.push({ step: "Test-Meeting erstellen", ok: false, detail: String(e) });
    return NextResponse.json({ success: false, steps });
  }

  // Step 3: Test-Meeting wieder loeschen (Cleanup)
  try {
    const deleted = await deleteOnlineMeeting(eventId);
    if (deleted) {
      steps.push({ step: "Test-Meeting cleanup", ok: true, detail: "Aus Outlook gelöscht." });
    } else {
      steps.push({
        step: "Test-Meeting cleanup",
        ok: false,
        detail: `Konnte Meeting nicht löschen — manuell aus Outlook entfernen (Event-ID: ${eventId})`,
      });
    }
  } catch (e) {
    steps.push({ step: "Test-Meeting cleanup", ok: false, detail: String(e) });
  }

  return NextResponse.json({ success: true, steps, joinUrl });
}
