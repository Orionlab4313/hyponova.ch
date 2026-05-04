import bcrypt from "bcryptjs";
import { createServiceClient } from "./supabase";

/**
 * Admin Settings Layer
 * --------------------
 * Liest Hashes und 2FA-Konfiguration aus der DB.
 *
 * KEIN Fallback auf hartkodierte Defaults — das war ein Sicherheitsrisiko.
 * Das initiale Passwort muss via Migration oder einmaligem Setup gesetzt werden.
 *
 * Dieses Modul ist NUR für Server-Code gedacht (API-Routes).
 */

import { decryptSecret, encryptSecret } from "./crypto-helper";

export type AdminSettings = {
  id: number;
  site_password_hash: string | null;
  admin_password_hash: string;
  totp_secret: string | null;
  totp_enabled: boolean;
  backup_codes: string[];
  notification_email: string;
  site_protection_enabled: boolean;
  // Microsoft Teams Personal/Standing Meeting URL — wird in
  // Termin-Bestaetigungs-Emails inkludiert wenn gesetzt.
  teams_meeting_url: string | null;
  updated_at: string;
};

const BCRYPT_COST = 12;

export async function getAdminSettings(): Promise<AdminSettings> {
  const sb = createServiceClient();
  const { data, error } = await sb.from("admin_settings").select("*").eq("id", 1).single();
  if (error || !data) {
    throw new Error("Admin-Settings nicht gefunden – Migration angewandt?");
  }
  return data as AdminSettings;
}

export async function updateAdminSettings(patch: Partial<AdminSettings>) {
  const sb = createServiceClient();
  const { error } = await sb
    .from("admin_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

/* ---------- Site Password ---------- */

export async function verifySitePassword(input: string): Promise<boolean> {
  try {
    const s = await getAdminSettings();
    if (!s.site_password_hash) return false;
    return await bcrypt.compare(input, s.site_password_hash);
  } catch {
    return false;
  }
}

export async function setSitePassword(plain: string) {
  const hash = await bcrypt.hash(plain, BCRYPT_COST);
  await updateAdminSettings({ site_password_hash: hash });
}

/* ---------- Admin Password ---------- */

export async function verifyAdminPassword(input: string): Promise<boolean> {
  try {
    const s = await getAdminSettings();
    if (!s.admin_password_hash) return false;
    return await bcrypt.compare(input, s.admin_password_hash);
  } catch {
    return false;
  }
}

export async function setAdminPassword(plain: string) {
  const hash = await bcrypt.hash(plain, BCRYPT_COST);
  await updateAdminSettings({ admin_password_hash: hash });
}

/* ---------- 2FA / TOTP ---------- */

export async function isTotpEnabled(): Promise<boolean> {
  try {
    const s = await getAdminSettings();
    return s.totp_enabled === true && !!s.totp_secret;
  } catch {
    return false;
  }
}

/** Liefert das entschluesselte TOTP-Secret oder null. */
export async function getTotpSecret(): Promise<string | null> {
  const s = await getAdminSettings();
  if (!s.totp_secret) return null;
  return decryptSecret(s.totp_secret);
}

/** Speichert das TOTP-Secret verschluesselt. */
export async function setTotpSecret(plainSecret: string | null) {
  const enc = plainSecret ? encryptSecret(plainSecret) : null;
  await updateAdminSettings({ totp_secret: enc });
}
