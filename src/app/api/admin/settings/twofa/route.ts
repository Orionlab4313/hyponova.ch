import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import {
  getAdminSettings,
  getTotpSecret,
  setTotpSecret,
  updateAdminSettings,
  verifyAdminPassword,
} from "@/lib/admin-settings";
import { requireAdmin } from "@/lib/admin-guard";

const BACKUP_CODE_BYTES = 10; // 80 Bits Entropy pro Code
const BCRYPT_COST = 12;

/**
 * POST /api/admin/settings/twofa
 *   { action: "init" }                                  → liefert Secret + QR
 *   { action: "enable", secret, code }                  → aktiviert + liefert Backup-Codes
 *   { action: "disable", adminPassword, code }          → deaktiviert
 */
export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const body = await request.json();
  const action = body.action;

  if (action === "init") {
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    const totp = new OTPAuth.TOTP({
      issuer: "HYPONOVA",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const otpauthUrl = totp.toString();
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
    return NextResponse.json({ secret, qrDataUrl });
  }

  if (action === "enable") {
    const { secret, code } = body;
    if (!secret || !code) {
      return NextResponse.json({ error: "Secret oder Code fehlt" }, { status: 400 });
    }
    const totp = new OTPAuth.TOTP({
      issuer: "HYPONOVA",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(String(secret)),
    });
    const delta = totp.validate({ token: String(code), window: 1 });
    if (delta === null) {
      return NextResponse.json({ error: "Code falsch" }, { status: 400 });
    }

    // 8 Backup-Codes generieren, anzeigen, gehasht speichern
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const c = randomBytes(BACKUP_CODE_BYTES).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-");
      plainCodes.push(c);
      hashedCodes.push(await bcrypt.hash(c, BCRYPT_COST));
    }

    await setTotpSecret(String(secret));
    await updateAdminSettings({
      totp_enabled: true,
      backup_codes: hashedCodes,
    });

    return NextResponse.json({ success: true, backupCodes: plainCodes });
  }

  if (action === "disable") {
    const { adminPassword, code } = body;
    const ok = await verifyAdminPassword(String(adminPassword || ""));
    if (!ok) {
      return NextResponse.json({ error: "Admin-Passwort falsch" }, { status: 401 });
    }
    const totpSecret = await getTotpSecret();
    if (totpSecret) {
      const totp = new OTPAuth.TOTP({
        issuer: "HYPONOVA",
        label: "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(totpSecret),
      });
      const delta = totp.validate({ token: String(code || ""), window: 1 });
      if (delta === null) {
        return NextResponse.json({ error: "Code falsch" }, { status: 400 });
      }
    }
    await setTotpSecret(null);
    await updateAdminSettings({
      totp_enabled: false,
      backup_codes: [],
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}
