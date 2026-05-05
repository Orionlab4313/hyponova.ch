import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getMicrosoftConfig, getAccessToken } from "@/lib/microsoft-graph";

/**
 * Diagnose-Endpunkt mit voller Microsoft-Fehler-Transparenz.
 * Macht die Graph-Calls hier direkt (statt via Library) damit wir Status-Codes
 * und Microsoft-Error-Bodies sehen koennen.
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

  // Step 2: Token-Refresh — direkter Call, voller Error
  let accessToken: string;
  try {
    accessToken = await getAccessToken(config);
    steps.push({
      step: "Access-Token holen",
      ok: true,
      detail: `Token: ${accessToken.slice(0, 20)}… (Länge: ${accessToken.length})`,
    });
  } catch (e) {
    steps.push({
      step: "Access-Token holen",
      ok: false,
      detail: String(e).slice(0, 500),
    });
    return NextResponse.json({ success: false, steps });
  }

  // Step 3: /me Endpoint testen (User-Info)
  try {
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,displayName", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meBody = await meRes.text();
    if (meRes.ok) {
      steps.push({
        step: "/me Endpoint",
        ok: true,
        detail: `HTTP ${meRes.status} — ${meBody.slice(0, 200)}`,
      });
    } else {
      steps.push({
        step: "/me Endpoint",
        ok: false,
        detail: `HTTP ${meRes.status} — ${meBody.slice(0, 500)}`,
      });
    }
  } catch (e) {
    steps.push({ step: "/me Endpoint", ok: false, detail: String(e).slice(0, 300) });
  }

  // Step 4: Test-Meeting via /me/events erstellen — VOLLER Error-Body bei Fehler
  let eventId: string | null = null;
  let joinUrl: string | null = null;
  try {
    const start = new Date(Date.now() + 10 * 60_000);
    const end = new Date(start.getTime() + 30 * 60_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const isoLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    const eventBody = {
      subject: "HYPONOVA Test (wird gleich gelöscht)",
      start: { dateTime: isoLocal(start), timeZone: "Europe/Zurich" },
      end: { dateTime: isoLocal(end), timeZone: "Europe/Zurich" },
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
      body: { contentType: "text", content: "Diagnose-Test." },
    };

    const eventRes = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventBody),
    });

    const eventText = await eventRes.text();

    if (!eventRes.ok) {
      steps.push({
        step: "/me/events POST (Test-Meeting)",
        ok: false,
        detail: `HTTP ${eventRes.status} — Microsoft sagt: ${eventText.slice(0, 800)}`,
      });
      return NextResponse.json({ success: false, steps });
    }

    const event = JSON.parse(eventText);
    eventId = event.id;
    joinUrl = event.onlineMeeting?.joinUrl || event.onlineMeetingUrl || null;

    if (!joinUrl) {
      steps.push({
        step: "/me/events POST (Test-Meeting)",
        ok: false,
        detail: `HTTP 201, aber KEIN onlineMeeting.joinUrl in Response. event.onlineMeeting=${JSON.stringify(event.onlineMeeting)} | onlineMeetingProvider=${event.onlineMeetingProvider} | isOnlineMeeting=${event.isOnlineMeeting}`,
      });
    } else {
      steps.push({
        step: "/me/events POST (Test-Meeting)",
        ok: true,
        detail: `Event ID: ${eventId} | Join URL: ${joinUrl}`,
      });
    }
  } catch (e) {
    steps.push({
      step: "/me/events POST (Test-Meeting)",
      ok: false,
      detail: String(e).slice(0, 500),
    });
    return NextResponse.json({ success: false, steps });
  }

  // Step 5: Cleanup
  if (eventId) {
    try {
      const delRes = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (delRes.ok || delRes.status === 404) {
        steps.push({
          step: "Test-Meeting cleanup",
          ok: true,
          detail: `HTTP ${delRes.status} — Event aus Outlook entfernt.`,
        });
      } else {
        const delText = await delRes.text();
        steps.push({
          step: "Test-Meeting cleanup",
          ok: false,
          detail: `HTTP ${delRes.status} — ${delText.slice(0, 300)}. Event-ID ${eventId} manuell löschen.`,
        });
      }
    } catch (e) {
      steps.push({ step: "Test-Meeting cleanup", ok: false, detail: String(e).slice(0, 300) });
    }
  }

  const allOk = steps.every((s) => s.ok);
  return NextResponse.json({ success: allOk, steps, joinUrl });
}
