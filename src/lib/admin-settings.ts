import bcrypt from "bcryptjs";
import { createServiceClient } from "./supabase";

/**
 * Admin Settings Layer
 * --------------------
 * Liest Hashes und 2FA-Konfiguration aus der DB.
 * Faellt auf process.env zurueck, wenn die DB-Hashes leer sind
 * (z.B. unmittelbar nach dem Migrations-Apply).
 *
 * Diese Modul ist NUR fuer Server-Code gedacht (API-Routes, Middleware
 * funktioniert in Next.js Edge-Runtime und MUSS bcryptjs vermeiden,
 * darum gibt es eine separate Plain-Text-Funktion fuer die Site-PW-Pruefung
 * via Cookie-Hash-Kompatibilitaetsmodus).
 */

export type AdminSettings = {
  id: number;
  site_password_hash: string | null;
  admin_password_hash: string;
  totp_secret: string | null;
  totp_enabled: boolean;
  backup_codes: string[];
  notification_email: string;
  updated_at: string;
};

const ENV_FALLBACK_SITE_PW = "Möhlin4313";
const ENV_FALLBACK_ADMIN_PW = process.env.ADMIN_PASSWORD || "HypoAdmin2026!";

export async function getAdminSettings(): Promise<AdminSettings> {
  const sb = createServiceClient();
  const { data, error } = await sb.from("admin_settings").select("*").eq("id", 1).single();
  if (error || !data) {
    throw new Error("Admin Settings nicht gefunden – Migration applied?");
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
    if (s.site_password_hash) {
      return bcrypt.compareSync(input, s.site_password_hash);
    }
  } catch {
    // DB unreachable - falle auf Env-Default zurueck
  }
  return input === ENV_FALLBACK_SITE_PW;
}

export async function setSitePassword(plain: string) {
  const hash = bcrypt.hashSync(plain, 10);
  await updateAdminSettings({ site_password_hash: hash });
}

/* ---------- Admin Password ---------- */

export async function verifyAdminPassword(input: string): Promise<boolean> {
  try {
    const s = await getAdminSettings();
    if (s.admin_password_hash) {
      return bcrypt.compareSync(input, s.admin_password_hash);
    }
  } catch {
    // DB unreachable - Fallback
  }
  return input === ENV_FALLBACK_ADMIN_PW;
}

export async function setAdminPassword(plain: string) {
  const hash = bcrypt.hashSync(plain, 10);
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
