import { NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import bcrypt from "bcryptjs";
import {
  getAdminSettings,
  getTotpSecret,
  updateAdminSettings,
  verifyAdminPassword,
} from "@/lib/admin-settings";
import { signAdminToken, verifyAdminToken } from "@/lib/admin-session";
import { checkRateLimit, clientIp, resetRateLimit } from "@/lib/rate-limit";

const STEP_COOKIE = "hyponova-admin-step";
const FULL_COOKIE = "hyponova-admin-session";

const RL_BUCKET = "admin-login";
const RL_MAX = 8;
const RL_WINDOW = 15 * 60; // 15min

/**
 * Zwei-Stufen-Login für Admin:
 * Stage 1: { password }                  → wenn 2FA aktiv: stage-cookie + needsTotp
 *                                         → sonst: full session cookie
 * Stage 2: { totpCode } oder { backupCode } mit gültigem stage-cookie
 *                                         → full session cookie
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({
    bucket: RL_BUCKET,
    key: ip,
    max: RL_MAX,
    windowSeconds: RL_WINDOW,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Zu viele Login-Versuche. Bitte in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten erneut versuchen.` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));

  // Stage 2: 2FA-Code mit Bridge-Token
  if (body.totpCode || body.backupCode) {
    const stageToken = request.cookies.get(STEP_COOKIE)?.value;
    const payload = verifyAdminToken(stageToken);
    if (!payload || payload.stage !== "pw-ok") {
      return NextResponse.json({ error: "Sitzung abgelaufen, bitte neu anmelden" }, { status: 401 });
    }

    const settings = await getAdminSettings();
    const totpSecret = await getTotpSecret();
    let ok = false;

    if (body.totpCode && totpSecret) {
      const totp = new OTPAuth.TOTP({
        issuer: "HYPONOVA",
        label: "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(totpSecret),
      });
      const delta = totp.validate({ token: String(body.totpCode), window: 1 });
      ok = delta !== null;
    } else if (body.backupCode) {
      const code = String(body.backupCode).trim();
      // Backup-Codes sind gehasht gespeichert
      for (let i = 0; i < settings.backup_codes.length; i++) {
        if (await bcrypt.compare(code, settings.backup_codes[i])) {
          ok = true;
          // Verbrauchten Code entfernen
          const remaining = settings.backup_codes.filter((_, idx) => idx !== i);
          await updateAdminSettings({ backup_codes: remaining });
          break;
        }
      }
    }

    if (!ok) {
      return NextResponse.json({ error: "Code ungültig" }, { status: 401 });
    }

    await resetRateLimit(RL_BUCKET, ip);

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
  await resetRateLimit(RL_BUCKET, ip);
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

/** Sitzungs-Check (vom Admin-Layout im Browser benutzt). */
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
