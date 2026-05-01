import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase";

const DEFAULT_TTL_DAYS = 30;
const TOKEN_BYTES = 24; // 192 Bits Entropy

export interface UploadTokenRow {
  token: string;
  lead_id: string;
  submission_id: string | null;
  expires_at: string;
  created_at: string;
}

/**
 * Erzeugt einen neuen Upload-Token fuer einen Lead.
 * Default-Gueltigkeit 30 Tage (lang genug damit Kunden Zeit haben Dokumente zusammen zu sammeln).
 */
export async function createUploadToken(opts: {
  leadId: string;
  submissionId?: string | null;
  ttlDays?: number;
}): Promise<UploadTokenRow> {
  const sb = createServiceClient();
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const ttlDays = opts.ttlDays ?? DEFAULT_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await sb
    .from("lead_upload_tokens")
    .insert({
      token,
      lead_id: opts.leadId,
      submission_id: opts.submissionId ?? null,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw new Error(`createUploadToken: ${error.message}`);
  return data as UploadTokenRow;
}

/**
 * Validiert einen Token. Gibt das Row zurueck wenn gueltig, sonst null.
 * Tolerant gegen Race-Conditions: ein abgelaufener Token wird als invalid behandelt
 * aber NICHT geloescht (ein Cron koennte das spaeter aufraeumen).
 */
export async function verifyUploadToken(token: string): Promise<UploadTokenRow | null> {
  if (!token || token.length < 20) return null;
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lead_upload_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  return data as UploadTokenRow;
}

/** Loescht abgelaufene Tokens — kann via Cron-Job aufgerufen werden. */
export async function pruneExpiredTokens(): Promise<number> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lead_upload_tokens")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("token");
  if (error) {
    console.error("pruneExpiredTokens:", error.message);
    return 0;
  }
  return (data || []).length;
}

/** Hilfsfunktion: baut die Public-URL fuer den Upload. */
export function buildUploadUrl(host: string, token: string, lang: "de" | "en" = "de"): string {
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}/upload/${token}${lang === "en" ? "?lang=en" : ""}`;
}
