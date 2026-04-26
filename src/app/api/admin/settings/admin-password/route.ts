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
    // Erlaubt sowohl angemeldete Admin-Sessions (aus den Einstellungen)
    // als auch nicht angemeldete "Passwort vergessen"-Anfragen vom Login-Screen.
    // Spam-Schutz: pro 60 Sekunden hoechstens 1 ausstehendes Token.
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
        // Generische Antwort, damit Angreifer keine Info bekommen
        return NextResponse.json({
          success: true,
          ttlMinutes: TOKEN_TTL_MIN,
        });
      }
    }

    const settings = await getAdminSettings();
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
      // Fuer nicht angemeldete Anfragen geben wir trotzdem generischen Erfolg zurueck.
      // Fuer angemeldete Admin-Anfragen koennen wir den Fehler durchreichen, damit
      // der Admin in den Einstellungen sieht, dass etwas schiefging.
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
