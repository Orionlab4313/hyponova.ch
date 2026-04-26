import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAdminSettings, setAdminPassword } from "@/lib/admin-settings";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";

const TOKEN_TTL_MIN = 15;

/**
 * POST /api/admin/settings/admin-password
 *  body: { action: "request" }   → erzeugt Token + sendet Email
 *  body: { action: "confirm", token, newPassword }
 */
export async function POST(request: NextRequest) {
  const { action, token, newPassword } = await request.json();

  if (action === "request") {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getAdminSettings();
    const sb = createServiceClient();

    const newToken = randomBytes(24).toString("hex");
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
      const text = await fnRes.text().catch(() => "");
      return NextResponse.json(
        { error: `E-Mail-Versand fehlgeschlagen: ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentTo: settings.notification_email,
      ttlMinutes: TOKEN_TTL_MIN,
    });
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
