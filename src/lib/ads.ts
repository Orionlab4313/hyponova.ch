/**
 * Werbung / Google Tag: gemeinsame Helfer für Admin-API, Public-API und Client.
 * Es wird NIE ein fremdes Snippet gespeichert oder ausgeführt, nur die ID.
 * Das Skript bauen wir selbst, die ID wird überall strikt geprüft.
 */

export const GOOGLE_TAG_ID_PATTERN = /^(AW|G|GT)-[A-Z0-9]{4,20}$/;

export function isValidGoogleTagId(value: unknown): value is string {
  return typeof value === "string" && GOOGLE_TAG_ID_PATTERN.test(value);
}

/**
 * Holt die Tag-ID aus einer Eingabe. Akzeptiert die nackte ID ("AW-123"),
 * Kleinschreibung, oder das ganze Snippet aus der Google-Ads-Mail.
 * Gibt null zurück, wenn nichts Brauchbares drin ist.
 */
export function extractGoogleTagId(input: string): string | null {
  const text = (input || "").trim();
  if (!text) return null;
  const match = text.toUpperCase().match(/(?:^|[^A-Z0-9])((?:AW|GT|G)-[A-Z0-9]{4,20})(?![A-Z0-9-])/);
  if (!match) return null;
  return isValidGoogleTagId(match[1]) ? match[1] : null;
}

/** Cookie, in dem die Entscheidung des Besuchers liegt. */
export const CONSENT_COOKIE = "hyponova-cookie-consent";
/** Werte: "all" = Werbe-Cookies erlaubt, "necessary" = abgelehnt, "1" = alter Hinweis-Banner. */
export type ConsentValue = "all" | "necessary";

/** Event, mit dem der Footer-Link den Banner wieder öffnet. */
export const OPEN_CONSENT_EVENT = "hyponova:open-cookie-settings";

/** Seiten, auf denen nie ein Werbe-Tag läuft (Admin, Kunden-Upload mit Token). */
export function isAdsExcludedPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/upload");
}
