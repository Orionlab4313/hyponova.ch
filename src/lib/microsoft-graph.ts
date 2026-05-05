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
 * Alternative: POST /me/onlineMeetings — erstellt nur den Join-Link, ohne
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
// Wenn die Function recyclet wird ist der Cache weg — dann holen wir neu via Refresh.
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
export async function getAccessToken(config: MicrosoftConfig): Promise<string> {
  // Cache-Hit (Token gueltig fuer >60 Sekunden)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
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
    throw new Error(`Microsoft token refresh failed: HTTP ${r.status} — ${errText.slice(0, 200)}`);
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
  // Wenn ja: ueberschreibe in der DB.
  if (data.refresh_token && data.refresh_token !== config.refreshToken) {
    const sb = createServiceClient();
    await sb
      .from("admin_settings")
      .update({
        microsoft_refresh_token_encrypted: encryptSecret(data.refresh_token),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
  }

  return data.access_token;
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
  joinUrl: string; // Teams Join-URL
  joinUrlHtml: string; // HTML-Block fuer Email-Embed
}

/**
 * Erstellt ein Online-Meeting (Outlook Calendar Event mit Teams) im Postfach
 * des verbundenen Microsoft-Users (Simon).
 *
 * Returns: eventId + joinUrl. eventId speichern wir in der appointments-Tabelle,
 * damit wir spaeter updaten/loeschen koennen.
 */
export async function createOnlineMeeting(input: CreateMeetingInput): Promise<CreatedMeeting | null> {
  const config = await getMicrosoftConfig();
  if (!config) return null;

  const tz = input.timeZone || "Europe/Zurich";

  const body = {
    subject: input.subject,
    start: { dateTime: input.startIso, timeZone: tz },
    end: { dateTime: input.endIso, timeZone: tz },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
    body: input.bodyText
      ? { contentType: "text", content: input.bodyText }
      : undefined,
    attendees: (input.attendees || []).map((a) => ({
      emailAddress: { address: a.email, name: a.name || a.email },
      type: "required",
    })),
  };

  const r = await graphFetch(config, "/me/events", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    console.error("Microsoft Graph createOnlineMeeting failed:", r.status, errText.slice(0, 300));
    return null;
  }

  const data = (await r.json()) as {
    id: string;
    onlineMeeting?: { joinUrl?: string };
    onlineMeetingUrl?: string;
  };

  const joinUrl = data.onlineMeeting?.joinUrl || data.onlineMeetingUrl || "";
  if (!joinUrl) {
    console.error("Microsoft Graph: kein joinUrl in Response", data);
    return null;
  }

  return {
    eventId: data.id,
    joinUrl,
    joinUrlHtml: joinUrl,
  };
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

/** Loescht ein Meeting (Cancel). Returns true auch wenn Event nicht mehr existiert (idempotent). */
export async function deleteOnlineMeeting(eventId: string): Promise<boolean> {
  const config = await getMicrosoftConfig();
  if (!config) return false;

  const r = await graphFetch(config, `/me/events/${eventId}`, { method: "DELETE" });

  // 204 = success, 404 = bereits weg (auch ok), alles andere = Fehler
  if (r.ok || r.status === 404) return true;

  const errText = await r.text().catch(() => "");
  console.error("Microsoft Graph deleteOnlineMeeting failed:", r.status, errText.slice(0, 300));
  return false;
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
