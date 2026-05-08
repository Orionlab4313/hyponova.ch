import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAdminSettings, setAdminPassword } from "@/lib/admin-settings";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const TOKEN_TTL_MIN = 15;

const RL_BUCKET = "admin-pw-reset";
const RL_MAX = 20;
const RL_WINDOW = 60 * 60; // 1h

/**
 * POST /api/admin/settings/admin-password
 *  body: { action: "request" }   → erzeugt Token + sendet Email
 *  body: { action: "confirm", token, newPassword }
 */
export async function POST(request: NextRequest) {
  const { action, token, newPassword } = await request.json();

  if (action === "request") {
    const ip = clientIp(request.headers);
    const limit = await checkRateLimit({
      bucket: RL_BUCKET,
      key: ip,
      max: RL_MAX,
      windowSeconds: RL_WINDOW,
    });
    if (!limit.ok) {
      // Echtes Limit-Feedback, sonst denkt der User die Email kommt und sie kommt nie.
      return NextResponse.json(
        {
          error: `Zu viele Reset-Anfragen. Bitte in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten erneut versuchen.`,
        },
        { status: 429 }
      );
    }

    // Spam-Schutz: pro 60 Sekunden hoechstens 1 ausstehendes Token (DB-side).
    const sb = createServiceClient();
    const { data: recent } = await sb
      .from("admin_password_reset_tokens")
      .select("created_at")
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recent && recent.length > 0) {
      const ageSec = (Date.now() - new Date(recent[0].created_at).getTime()) / 1000;
      if (ageSec < 60) {
        return NextResponse.json({
          success: true,
          ttlMinutes: TOKEN_TTL_MIN,
        });
      }
    }

    const settings = await getAdminSettings();
    const newToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000).toISOString();

    const { error } = await sb
      .from("admin_password_reset_tokens")
      .insert({ token: newToken, expires_at: expiresAt });
    if (error) {
      return NextResponse.json({ error: "DB-Fehler" }, { status: 500 });
    }

    // Email via on-booking Edge Function senden
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "hyponova.ch";
    const confirmUrl = `${proto}://${host}/admin/einstellungen/passwort-bestaetigen?token=${newToken}`;

    const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/on-booking`;
    const fnRes = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: "admin-password-reset",
        email: settings.notification_email,
        confirmUrl,
        ttlMinutes: TOKEN_TTL_MIN,
      }),
    });

    if (!fnRes.ok) {
      // Fuer angemeldete Sessions geben wir den Fehler durch.
      if (isAdminAuthenticated(request)) {
        const text = await fnRes.text().catch(() => "");
        return NextResponse.json(
          { error: `E-Mail-Versand fehlgeschlagen: ${text}` },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true, ttlMinutes: TOKEN_TTL_MIN });
    }

    // Sensitive Info (sentTo) nur an angemeldete Sessions zurueckgeben
    if (isAdminAuthenticated(request)) {
      return NextResponse.json({
        success: true,
        sentTo: settings.notification_email,
        ttlMinutes: TOKEN_TTL_MIN,
      });
    }
    return NextResponse.json({ success: true, ttlMinutes: TOKEN_TTL_MIN });
  }

  if (action === "confirm") {
    if (!token || !newPassword || String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "Token oder Passwort ungültig (mindestens 8 Zeichen)" },
        { status: 400 }
      );
    }
    const sb = createServiceClient();
    const { data: row, error } = await sb
      .from("admin_password_reset_tokens")
      .select("*")
      .eq("token", String(token))
      .single();
    if (error || !row) {
      return NextResponse.json({ error: "Token unbekannt" }, { status: 400 });
    }
    if (row.used) {
      return NextResponse.json({ error: "Token bereits verwendet" }, { status: 400 });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Token abgelaufen" }, { status: 400 });
    }

    await setAdminPassword(String(newPassword));
    await sb
      .from("admin_password_reset_tokens")
      .update({ used: true })
      .eq("token", String(token));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}
