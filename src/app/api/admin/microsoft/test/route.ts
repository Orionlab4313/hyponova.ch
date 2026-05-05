import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getMicrosoftConfig, getAccessToken } from "@/lib/microsoft-graph";

/**
 * Diagnose-Endpoint mit voller Microsoft-Fehler-Transparenz.
 * Testet die NEUE 2-Step-Logik: /me/onlineMeetings + /me/events.
 */
export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const steps: { step: string; ok: boolean; detail?: string }[] = [];

  // Step 1: Config aus DB lesen
  const config = await getMicrosoftConfig();
  if (!config) {
    steps.push({
      step: "Config aus DB lesen",
      ok: false,
      detail: "getMicrosoftConfig() returned null. Refresh-Token fehlt oder Decrypt schlug fehl.",
    });
    return NextResponse.json({ success: false, steps });
  }
  steps.push({
    step: "Config aus DB lesen",
    ok: true,
    detail: `User: ${config.userEmail || "?"}, Tenant: ${config.tenantId.slice(0, 8)}…`,
  });

  // Step 2: Access-Token holen
  let accessToken: string;
  try {
    accessToken = await getAccessToken(config);
    steps.push({
      step: "Access-Token holen",
      ok: true,
      detail: `Token-Länge: ${accessToken.length} chars`,
    });
  } catch (e) {
    steps.push({
      step: "Access-Token holen",
      ok: false,
      detail: String(e).slice(0, 500),
    });
    return NextResponse.json({ success: false, steps });
  }

  // ZEIT-BERECHNUNG: 10 Min in der Zukunft, 30 Min Dauer
  const start = new Date(Date.now() + 10 * 60_000);
  const end = new Date(start.getTime() + 30 * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoLocal = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

  // ISO mit Timezone-Offset fuer Online Meetings API
  const offsetMin = -start.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMin);
  const offsetStr = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
  const startIsoTz = `${isoLocal(start)}${offsetStr}`;
  const endIsoTz = `${isoLocal(end)}${offsetStr}`;

  // Step 3: POST /me/onlineMeetings (NEUER ANSATZ)
  let onlineMeetingId: string | null = null;
  let joinUrl: string | null = null;
  try {
    const meetingRes = await fetch("https://graph.microsoft.com/v1.0/me/onlineMeetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDateTime: startIsoTz,
        endDateTime: endIsoTz,
        subject: "HYPONOVA Test (wird gleich gelöscht)",
      }),
    });

    const meetingText = await meetingRes.text();

    if (!meetingRes.ok) {
      steps.push({
        step: "POST /me/onlineMeetings",
        ok: false,
        detail: `HTTP ${meetingRes.status} — Microsoft sagt: ${meetingText.slice(0, 800)}`,
      });
      return NextResponse.json({ success: false, steps });
    }

    const meeting = JSON.parse(meetingText);
    onlineMeetingId = meeting.id;
    joinUrl = meeting.joinWebUrl || meeting.joinUrl || null;

    if (!joinUrl) {
      steps.push({
        step: "POST /me/onlineMeetings",
        ok: false,
        detail: `HTTP 201, aber kein joinWebUrl in Response. Response: ${meetingText.slice(0, 500)}`,
      });
    } else {
      steps.push({
        step: "POST /me/onlineMeetings",
        ok: true,
        detail: `✓ Frischer Teams-Link erstellt: ${joinUrl}`,
      });
    }
  } catch (e) {
    steps.push({
      step: "POST /me/onlineMeetings",
      ok: false,
      detail: String(e).slice(0, 500),
    });
    return NextResponse.json({ success: false, steps });
  }

  // Step 4: POST /me/events (Calendar-Eintrag mit Link im Body)
  let eventId: string | null = null;
  if (joinUrl) {
    try {
      const eventRes = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "HYPONOVA Test (wird gleich gelöscht)",
          start: { dateTime: isoLocal(start), timeZone: "Europe/Zurich" },
          end: { dateTime: isoLocal(end), timeZone: "Europe/Zurich" },
          body: {
            contentType: "html",
            content: `<p>Diagnose-Test.</p><p><strong>Microsoft Teams:</strong> <a href="${joinUrl}">Beitreten</a></p>`,
          },
          location: { displayName: "Microsoft Teams" },
        }),
      });

      const eventText = await eventRes.text();

      if (!eventRes.ok) {
        steps.push({
          step: "POST /me/events",
          ok: false,
          detail: `HTTP ${eventRes.status} — Microsoft sagt: ${eventText.slice(0, 800)}`,
        });
      } else {
        const event = JSON.parse(eventText);
        eventId = event.id;
        steps.push({
          step: "POST /me/events",
          ok: true,
          detail: `✓ Outlook-Kalendereintrag erstellt: ${eventId}`,
        });
      }
    } catch (e) {
      steps.push({
        step: "POST /me/events",
        ok: false,
        detail: String(e).slice(0, 500),
      });
    }
  }

  // Step 5: Cleanup — beide löschen
  let cleanupOk = true;
  if (eventId) {
    try {
      const r = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok && r.status !== 404) cleanupOk = false;
    } catch {
      cleanupOk = false;
    }
  }
  if (onlineMeetingId) {
    try {
      const r = await fetch(`https://graph.microsoft.com/v1.0/me/onlineMeetings/${onlineMeetingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok && r.status !== 404) cleanupOk = false;
    } catch {
      cleanupOk = false;
    }
  }
  steps.push({
    step: "Cleanup (Event + Meeting)",
    ok: cleanupOk,
    detail: cleanupOk ? "Beides aus Outlook entfernt." : "Cleanup fehlgeschlagen — manuell aus Outlook löschen.",
  });

  const allOk = steps.every((s) => s.ok);
  return NextResponse.json({ success: allOk, steps, joinUrl });
}
