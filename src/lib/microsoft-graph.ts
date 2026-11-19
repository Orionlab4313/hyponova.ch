import { createServiceClient } from "./supabase";
import { decryptSecret, encryptSecret } from "./crypto-helper";

/**
 * Microsoft Graph API Wrapper fuer HYPONOVA Booking System
 * --------------------------------------------------------
 * Authentifizierung: OAuth 2.0 Authorization Code Flow (Delegated)
 *  - Simon meldet sich einmal in /admin/einstellungen an
 *  - Wir speichern Refresh-Token verschluesselt in admin_settings
 *  - Bei Bedarf tauschen wir Refresh-Token gegen Access-Token (gueltig 60-90 Min)
 *
 * Erstellt Online-Meetings via Calendar Events (POST /me/events) mit
 * isOnlineMeeting=true. Das gibt uns einen Teams Join-Link UND legt das
 * Meeting in Simons Outlook-Kalender ab.
 *
 * Alternative: POST /me/onlineMeetings, erstellt nur den Join-Link, ohne
 * Calendar-Event. Wir nehmen Calendar-Events damit Simon den Termin
 * automatisch in Outlook sieht.
 */

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export interface MicrosoftConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  userEmail: string | null;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

// In-Memory-Cache fuer Access-Token waehrend der Edge-Function-Lifetime.
// Wenn die Function recyclet wird ist der Cache weg, dann holen wir neu via Refresh.
let tokenCache: CachedToken | null = null;

/**
 * Liest die Microsoft-Config aus admin_settings und entschluesselt Secrets.
 * Gibt null zurueck wenn nicht konfiguriert.
 */
export async function getMicrosoftConfig(): Promise<MicrosoftConfig | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("admin_settings")
    .select(
      "microsoft_tenant_id, microsoft_client_id, microsoft_client_secret_encrypted, microsoft_refresh_token_encrypted, microsoft_user_email",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;
  if (
    !data.microsoft_tenant_id ||
    !data.microsoft_client_id ||
    !data.microsoft_client_secret_encrypted ||
    !data.microsoft_refresh_token_encrypted
  ) {
    return null;
  }

  const clientSecret = decryptSecret(data.microsoft_client_secret_encrypted);
  const refreshToken = decryptSecret(data.microsoft_refresh_token_encrypted);
  if (!clientSecret || !refreshToken) return null;

  return {
    tenantId: data.microsoft_tenant_id,
    clientId: data.microsoft_client_id,
    clientSecret,
    refreshToken,
    userEmail: data.microsoft_user_email || null,
  };
}

/**
 * Tauscht Refresh-Token gegen Access-Token. Cached den Token in-memory.
 * Wenn Microsoft uns einen neuen Refresh-Token gibt (Sliding-Refresh), speichern
 * wir den auch ab.
 */
export async function getAccessToken(
  config: MicrosoftConfig,
  opts: { force?: boolean } = {},
): Promise<string> {
  // Cache-Hit (Token gueltig fuer >60 Sekunden)
  if (!opts.force && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
    scope: "openid profile offline_access User.Read Calendars.ReadWrite OnlineMeetings.ReadWrite",
  });

  const r = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    tokenCache = null;
    const message = `Microsoft token refresh failed: HTTP ${r.status}, ${errText.slice(0, 300)}`;
    await recordMicrosoftHealth(message);
    throw new Error(message);
  }

  const data = (await r.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  // Microsoft kann uns einen neuen Refresh-Token zurueckgeben (Token-Rotation).
  // Wenn ja: überschreibe in der DB. Zusammen mit dem Health-Stempel in einem Update.
  const update: Record<string, unknown> = {
    microsoft_last_check_at: new Date().toISOString(),
    microsoft_last_error: null,
  };
  if (data.refresh_token && data.refresh_token !== config.refreshToken) {
    update.microsoft_refresh_token_encrypted = encryptSecret(data.refresh_token);
    update.updated_at = new Date().toISOString();
  }
  const sb = createServiceClient();
  const { error: saveErr } = await sb.from("admin_settings").update(update).eq("id", 1);
  if (saveErr) console.error("Microsoft token/health save failed:", saveErr.message);

  return data.access_token;
}

/**
 * Schreibt den Zustand der Microsoft-Verbindung in admin_settings.
 * error = null heisst gesund. Das Admin-UI liest diese Felder, damit eine
 * abgelaufene Verbindung nicht mehr wochenlang unbemerkt bleibt.
 */
export async function recordMicrosoftHealth(error: string | null): Promise<void> {
  try {
    const sb = createServiceClient();
    await sb
      .from("admin_settings")
      .update({
        microsoft_last_check_at: new Date().toISOString(),
        microsoft_last_error: error ? error.slice(0, 500) : null,
      })
      .eq("id", 1);
  } catch (e) {
    console.error("recordMicrosoftHealth failed:", e);
  }
}

/**
 * Keep-Alive: erzwingt einen Token-Refresh. Ein Refresh-Token verfällt bei
 * Microsoft nach 90 Tagen ohne Nutzung. Ohne Buchungen in dieser Zeit war die
 * Verbindung danach tot (Vorfall November 2026). Der tägliche Cron ruft das
 * auf, hält das Token frisch und meldet einen Ausfall sofort im Admin.
 */
export async function checkMicrosoftConnection(): Promise<
  { configured: false } | { configured: true; ok: boolean; error?: string }
> {
  const config = await getMicrosoftConfig();
  if (!config) return { configured: false };
  try {
    await getAccessToken(config, { force: true });
    return { configured: true, ok: true };
  } catch (e) {
    return { configured: true, ok: false, error: String(e).slice(0, 500) };
  }
}

/**
 * Reicht Teams-Links für künftige Termine nach, die ohne Link gebucht wurden
 * (z.B. während die Verbindung abgelaufen war). Der Kunde ist Teilnehmer des
 * Outlook-Termins und bekommt die Einladung mit Beitreten-Button von Microsoft.
 */
export async function backfillMissingTeamsLinks(): Promise<number> {
  const sb = createServiceClient();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zurich" }).format(new Date());
  const { data: rows, error } = await sb
    .from("appointments")
    .select("id, date, time_start, time_end, status, leads(first_name, last_name, email, phone)")
    .is("teams_join_url", null)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(20);
  if (error || !rows) return 0;

  let fixed = 0;
  for (const row of rows) {
    if (row.status !== "geplant") continue;
    const lead = (Array.isArray(row.leads) ? row.leads[0] : row.leads) as
      | { first_name?: string; last_name?: string; email?: string; phone?: string }
      | null;
    if (!lead?.email) continue;
    const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
    const start = String(row.time_start).slice(0, 5);
    const end = String(row.time_end).slice(0, 5);
    const meeting = await createOnlineMeeting({
      subject: `Beratungsgespräch ${name}, HYPONOVA`,
      startIso: `${row.date}T${start}:00`,
      endIso: `${row.date}T${end}:00`,
      timeZone: "Europe/Zurich",
      attendees: [{ email: lead.email, name: name || lead.email }],
      bodyText: `Kostenloses Beratungsgespräch mit HYPONOVA GmbH.\nKunde: ${name}\nE-Mail: ${lead.email}\nTelefon: ${lead.phone || "-"}`,
    }).catch(() => null);
    if (!meeting) continue;
    await sb
      .from("appointments")
      .update({
        teams_join_url: meeting.joinUrl,
        teams_meeting_id: meeting.eventId,
        teams_online_meeting_id: meeting.onlineMeetingId,
      })
      .eq("id", row.id);
    fixed++;
  }
  return fixed;
}

/**
 * Helper: Generischer Graph-API-Call mit Token + Error-Handling.
 */
async function graphFetch(
  config: MicrosoftConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken(config);
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export interface CreateMeetingInput {
  subject: string;
  startIso: string; // z.B. "2026-05-10T10:00:00"
  endIso: string;
  timeZone?: string; // default "Europe/Zurich"
  attendees?: { email: string; name?: string }[];
  bodyText?: string;
}

export interface CreatedMeeting {
  eventId: string; // Outlook Calendar Event ID
  onlineMeetingId: string; // Teams Online-Meeting ID (separat)
  joinUrl: string; // Teams Join-URL
  joinUrlHtml: string; // HTML-Block fuer Email-Embed
}

/**
 * 2-Schritt-Ansatz fuer Teams Online Meetings:
 *
 * 1) POST /me/onlineMeetings -> garantiert einen frischen Teams Join-Link.
 *    Funktioniert immer, unabhaengig von Mailbox-Settings.
 *
 * 2) POST /me/events -> Outlook-Kalendereintrag mit dem Join-Link im Body.
 *    Setzt isOnlineMeeting NICHT mehr (das wird bei manchen Mailboxen
 *    stumm ignoriert wenn defaultOnlineMeetingProvider=unknown ist).
 *
 * Dieser Ansatz war noetig weil der frueher genutzte 1-Schritt-Weg
 * (events mit isOnlineMeeting=true) bei frisch erstellten M365-Tenants
 * einfach false zurueckkam, ohne Fehler.
 */
export async function createOnlineMeeting(input: CreateMeetingInput): Promise<CreatedMeeting | null> {
  const config = await getMicrosoftConfig();
  if (!config) return null;

  const tz = input.timeZone || "Europe/Zurich";

  // ISO mit Timezone-Suffix berechnen, Online Meetings API braucht ISO 8601
  // mit Timezone-Offset (nicht das events-Format mit separater timeZone-Property).
  const offset = computeIsoOffset(tz, input.startIso);
  const startIsoTz = `${input.startIso}${offset}`;
  const endIsoTz = `${input.endIso}${offset}`;

  // ---------- Step 1: Online Meeting erstellen ----------
  const meetingBody = {
    startDateTime: startIsoTz,
    endDateTime: endIsoTz,
    subject: input.subject,
  };

  const meetingRes = await graphFetch(config, "/me/onlineMeetings", {
    method: "POST",
    body: JSON.stringify(meetingBody),
  });

  if (!meetingRes.ok) {
    const errText = await meetingRes.text().catch(() => "");
    console.error("createOnlineMeeting Step 1 (/me/onlineMeetings) failed:", meetingRes.status, errText.slice(0, 500));
    return null;
  }

  const meeting = (await meetingRes.json()) as {
    id: string;
    joinWebUrl?: string;
    joinUrl?: string;
  };

  const joinUrl = meeting.joinWebUrl || meeting.joinUrl || "";
  if (!joinUrl) {
    console.error("createOnlineMeeting Step 1: kein joinWebUrl in Response", meeting);
    return null;
  }

  // ---------- Step 2: Calendar Event mit Join-Link im Body ----------
  // URL nicht als Plain-Text, nur als klickbarer Button. Wer den Link kopieren
  // will, macht Rechtsklick auf den Button -> "Link kopieren".
  const eventHtmlBody = `${input.bodyText ? `<p>${escapeHtml(input.bodyText).replace(/\n/g, "<br>")}</p><br>` : ""}<p><strong>Microsoft Teams Meeting</strong></p><p><a href="${joinUrl}" style="display:inline-block;background:#5059c9;color:#fff;text-decoration:none;padding:10px 18px;font-size:14px;font-weight:600;border-radius:4px;">Teams Meeting beitreten</a></p>`;

  const eventBody = {
    subject: input.subject,
    start: { dateTime: input.startIso, timeZone: tz },
    end: { dateTime: input.endIso, timeZone: tz },
    body: { contentType: "html", content: eventHtmlBody },
    location: { displayName: "Microsoft Teams" },
    attendees: (input.attendees || []).map((a) => ({
      emailAddress: { address: a.email, name: a.name || a.email },
      type: "required",
    })),
  };

  const eventRes = await graphFetch(config, "/me/events", {
    method: "POST",
    body: JSON.stringify(eventBody),
  });

  if (!eventRes.ok) {
    const errText = await eventRes.text().catch(() => "");
    console.error("createOnlineMeeting Step 2 (/me/events) failed:", eventRes.status, errText.slice(0, 500));
    // Online Meeting wieder loeschen, wir haben es ja schon erstellt
    await fetch(`${GRAPH_BASE}/me/onlineMeetings/${meeting.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${await getAccessToken(config)}` },
    }).catch(() => {});
    return null;
  }

  const event = (await eventRes.json()) as { id: string };

  return {
    eventId: event.id,
    onlineMeetingId: meeting.id,
    joinUrl,
    joinUrlHtml: joinUrl,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Berechnet den ISO 8601 Timezone-Offset (z.B. "+02:00") fuer eine Zone
 * zu einem bestimmten Zeitpunkt, wichtig wegen Sommer-/Winterzeit.
 */
function computeIsoOffset(tz: string, isoLocal: string): string {
  try {
    const date = new Date(isoLocal);
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longOffset",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value || "GMT+02:00";
    // "GMT+02:00" -> "+02:00"
    const m = offsetPart.match(/GMT([+-]\d{2}:\d{2})/);
    return m ? m[1] : "+02:00";
  } catch {
    return "+02:00";
  }
}

export interface UpdateMeetingInput {
  eventId: string;
  startIso: string;
  endIso: string;
  timeZone?: string;
  subject?: string;
}

/** Verschiebt ein Meeting (Reschedule). */
export async function updateOnlineMeeting(input: UpdateMeetingInput): Promise<boolean> {
  const config = await getMicrosoftConfig();
  if (!config) return false;

  const tz = input.timeZone || "Europe/Zurich";
  const body: Record<string, unknown> = {
    start: { dateTime: input.startIso, timeZone: tz },
    end: { dateTime: input.endIso, timeZone: tz },
  };
  if (input.subject) body.subject = input.subject;

  const r = await graphFetch(config, `/me/events/${input.eventId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    console.error("Microsoft Graph updateOnlineMeeting failed:", r.status, errText.slice(0, 300));
    return false;
  }
  return true;
}

/**
 * Loescht das Calendar Event UND das zugehoerige OnlineMeeting (idempotent).
 * Beide IDs muss man uebergeben, wir speichern sie in appointments.
 */
export async function deleteOnlineMeeting(eventId: string, onlineMeetingId?: string | null): Promise<boolean> {
  const config = await getMicrosoftConfig();
  if (!config) return false;

  let allOk = true;

  // Calendar Event
  if (eventId) {
    const r = await graphFetch(config, `/me/events/${eventId}`, { method: "DELETE" });
    if (!r.ok && r.status !== 404) {
      const errText = await r.text().catch(() => "");
      console.error("delete /me/events failed:", r.status, errText.slice(0, 300));
      allOk = false;
    }
  }

  // Online Meeting (separat, falls wir's beim Cancel auch loeschen wollen)
  if (onlineMeetingId) {
    const r = await graphFetch(config, `/me/onlineMeetings/${onlineMeetingId}`, { method: "DELETE" });
    if (!r.ok && r.status !== 404) {
      const errText = await r.text().catch(() => "");
      console.error("delete /me/onlineMeetings failed:", r.status, errText.slice(0, 300));
      allOk = false;
    }
  }

  return allOk;
}

/* ---------- OAuth-Flow Helpers ---------- */

export const OAUTH_SCOPES = [
  "openid",
  "profile",
  "offline_access",
  "User.Read",
  "Calendars.ReadWrite",
  "OnlineMeetings.ReadWrite",
].join(" ");

export function buildAuthorizeUrl(
  tenantId: string,
  clientId: string,
  redirectUri: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: OAUTH_SCOPES,
    state,
    prompt: "select_account",
  });
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export async function exchangeCodeForTokens(
  tenantId: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
): Promise<OAuthTokenResponse> {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    scope: OAUTH_SCOPES,
  });

  const r = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(`Token exchange failed: ${r.status} ${errText.slice(0, 300)}`);
  }

  return (await r.json()) as OAuthTokenResponse;
}

/** Liest die Microsoft-Email aus dem Access-Token via /me-Endpoint. */
export async function fetchMicrosoftUserEmail(accessToken: string): Promise<string | null> {
  const r = await fetch(`${GRAPH_BASE}/me?$select=mail,userPrincipalName`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const data = (await r.json()) as { mail?: string; userPrincipalName?: string };
  return data.mail || data.userPrincipalName || null;
}
