import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";
import { encryptSecret } from "@/lib/crypto-helper";

/**
 * Speichert / aktualisiert die Microsoft Azure App-Credentials.
 *
 * Wird vom Admin-UI aufgerufen wenn er die App-Registrierung neu konfiguriert
 * (z.B. wenn das Client-Secret nach 24 Monaten rotiert werden muss).
 *
 * Wenn nur das Secret aktualisiert wird, kann tenant_id/client_id leer bleiben
 * (dann wird nur das Secret ueberschrieben).
 */
export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { tenant_id, client_id, client_secret } = body;

    const updates: Record<string, unknown> = {};

    if (tenant_id !== undefined) {
      const t = String(tenant_id || "").trim();
      if (t && !/^[0-9a-f-]{36}$/i.test(t)) {
        return NextResponse.json({ error: "Tenant ID hat ungueltiges Format" }, { status: 400 });
      }
      updates.microsoft_tenant_id = t || null;
    }

    if (client_id !== undefined) {
      const c = String(client_id || "").trim();
      if (c && !/^[0-9a-f-]{36}$/i.test(c)) {
        return NextResponse.json({ error: "Client ID hat ungueltiges Format" }, { status: 400 });
      }
      updates.microsoft_client_id = c || null;
    }

    if (client_secret !== undefined) {
      const s = String(client_secret || "").trim();
      if (s) {
        updates.microsoft_client_secret_encrypted = encryptSecret(s);
        // Wenn Secret neu gesetzt wird, alten Refresh-Token invalidieren
        // (Token gilt nicht mehr fuer neue App-Credentials).
        updates.microsoft_refresh_token_encrypted = null;
        updates.microsoft_user_email = null;
        updates.microsoft_connected_at = null;
      } else {
        // Leerer String = Secret loeschen
        updates.microsoft_client_secret_encrypted = null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Keine Aenderungen" }, { status: 400 });
    }

    const sb = createServiceClient();
    const { error } = await sb
      .from("admin_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      console.error("Microsoft config update error:", error);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Microsoft config error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
