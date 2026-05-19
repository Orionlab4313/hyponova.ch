/**
 * Prefill-Tokens fuer Daten-Handoff zwischen Workflows.
 * Beispiel: Neukauf-Fragebogen -> Email mit Termin-Link -> /termin?prefill=<token>
 *           Termin-Page liest Token, holt Lead-Daten, autofills Form.
 *
 * Token wird nach Verwendung invalidiert (one-shot).
 * Expires nach 24h.
 */
import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase";

export type PrefillSource = "neukauf" | "abloesung" | "kontakt" | "termin";

export type PrefillLead = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
};

/**
 * Generiert einen neuen Prefill-Token fuer einen Lead.
 * Token ist 32 hex-Zeichen (128 bit), unguessable.
 */
export async function createPrefillToken(
  leadId: string,
  source: PrefillSource = "neukauf"
): Promise<string> {
  const token = randomBytes(16).toString("hex");
  const sb = createServiceClient();

  const { error } = await sb.from("prefill_tokens").insert({
    token,
    lead_id: leadId,
    source,
  });

  if (error) {
    throw new Error(`Prefill-Token konnte nicht angelegt werden: ${error.message}`);
  }

  return token;
}

/**
 * Liest Lead-Daten via Prefill-Token.
 * Returns null wenn Token nicht existiert, abgelaufen ist oder bereits verwendet wurde.
 */
export async function readPrefillToken(token: string): Promise<PrefillLead | null> {
  if (!token || typeof token !== "string" || token.length !== 32) {
    return null;
  }

  const sb = createServiceClient();

  const { data: tokenRow } = await sb
    .from("prefill_tokens")
    .select("lead_id, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) return null;
  if (tokenRow.used_at) return null;
  if (new Date(tokenRow.expires_at) < new Date()) return null;

  const { data: lead } = await sb
    .from("leads")
    .select("first_name, last_name, email, phone")
    .eq("id", tokenRow.lead_id)
    .maybeSingle();

  if (!lead) return null;

  return {
    first_name: lead.first_name || "",
    last_name: lead.last_name || "",
    email: lead.email || "",
    phone: lead.phone || null,
  };
}

/**
 * Markiert einen Token als verwendet (one-shot).
 * Nicht-kritisch: wenn Update fehlschlaegt, log und weiter.
 */
export async function invalidatePrefillToken(token: string): Promise<void> {
  if (!token) return;
  const sb = createServiceClient();
  const { error } = await sb
    .from("prefill_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token)
    .is("used_at", null);
  if (error) {
    console.warn("[prefill-tokens] invalidate failed:", error.message);
  }
}
