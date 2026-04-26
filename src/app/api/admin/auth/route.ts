import { NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import bcrypt from "bcryptjs";
import { getAdminSettings, verifyAdminPassword, updateAdminSettings } from "@/lib/admin-settings";
import { signAdminToken, verifyAdminToken } from "@/lib/admin-session";

const STEP_COOKIE = "hyponova-admin-step";
const FULL_COOKIE = "hyponova-admin-session";

/**
 * Zwei-Stufen-Login fuer Admin:
 * Stage 1: { password }                  → wenn 2FA aktiv: stage-cookie + needsTotp
 *                                         → sonst: full session cookie
 * Stage 2: { totpCode } oder { backupCode } mit gueltigem stage-cookie
 *                                         → full session cookie
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Stage 2: 2FA-Code mit Bridge-Token
  if (body.totpCode || body.backupCode) {
    const stageToken = request.cookies.get(STEP_COOKIE)?.value;
    const payload = verifyAdminToken(stageToken);
    if (!payload || payload.stage !== "pw-ok") {
      return NextResponse.json({ error: "Session abgelaufen, bitte neu anmelden" }, { status: 401 });
    }

    const settings = await getAdminSettings();
    let ok = false;

    if (body.totpCode && settings.totp_secret) {
      const totp = new OTPAuth.TOTP({
        issuer: "HYPONOVA",
        label: "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(settings.totp_secret),
      });
      const delta = totp.validate({ token: String(body.totpCode), window: 1 });
      ok = delta !== null;
    } else if (body.backupCode) {
      const code = String(body.backupCode).trim();
      // Backup-Codes sind gehashed gespeichert
      for (let i = 0; i < settings.backup_codes.length; i++) {
        if (bcrypt.compareSync(code, settings.backup_codes[i])) {
          ok = true;
          // Verbrauchten Code entfernen
          const remaining = settings.backup_codes.filter((_, idx) => idx !== i);
          await updateAdminSettings({ backup_codes: remaining });
          break;
        }
      }
    }

    if (!ok) {
      return NextResponse.json({ error: "Code ungueltig" }, { status: 401 });
    }

    const fullToken = signAdminToken("full", 60 * 60 * 8); // 8h
    const res = NextResponse.json({ success: true });
    res.cookies.set(FULL_COOKIE, fullToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    res.cookies.set(STEP_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  }

  // Stage 1: Passwort
  const password = String(body.password ?? "");
  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "Falsches Passwort" }, { status: 401 });
  }

  const settings = await getAdminSettings();
  if (settings.totp_enabled && settings.totp_secret) {
    const stageToken = signAdminToken("pw-ok", 5 * 60); // 5min
    const res = NextResponse.json({ success: true, needsTotp: true });
    res.cookies.set(STEP_COOKIE, stageToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 5 * 60,
      path: "/",
    });
    return res;
  }

  // 2FA nicht aktiv → direkt full session
  const fullToken = signAdminToken("full", 60 * 60 * 8);
  const res = NextResponse.json({ success: true });
  res.cookies.set(FULL_COOKIE, fullToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}

/** Session-Check (vom Admin-Layout im Browser benutzt). */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(FULL_COOKIE)?.value;
  const payload = verifyAdminToken(token);
  if (!payload || payload.stage !== "full") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

/** Logout */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(FULL_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(STEP_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
