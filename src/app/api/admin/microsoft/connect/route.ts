import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";
import { buildAuthorizeUrl } from "@/lib/microsoft-graph";

/**
 * Initiiert den OAuth-Flow zu Microsoft Identity Platform.
 *
 * Workflow:
 * 1. Admin klickt "Mit Microsoft verbinden" in /admin/einstellungen
 * 2. Wir laden Tenant-ID + Client-ID aus admin_settings
 * 3. Generieren CSRF-State, speichern in HttpOnly-Cookie
 * 4. Redirect zu Microsoft-Login mit Scopes
 * 5. Microsoft redirected zurueck zu /api/admin/microsoft/callback
 */
export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const sb = createServiceClient();
    const { data: settings } = await sb
      .from("admin_settings")
      .select("microsoft_tenant_id, microsoft_client_id")
      .eq("id", 1)
      .maybeSingle();

    if (!settings?.microsoft_tenant_id || !settings?.microsoft_client_id) {
      return NextResponse.json(
        { error: "Microsoft-App-Credentials sind in der DB nicht hinterlegt." },
        { status: 500 },
      );
    }

    const host = request.headers.get("host") || "hyponova.ch";
    const proto = host.includes("localhost") ? "http" : "https";
    const redirectUri = `${proto}://${host}/api/admin/microsoft/callback`;

    const state = randomBytes(16).toString("hex");
    const authorizeUrl = buildAuthorizeUrl(
      settings.microsoft_tenant_id,
      settings.microsoft_client_id,
      redirectUri,
      state,
    );

    const res = NextResponse.redirect(authorizeUrl);
    // CSRF-State im HttpOnly-Cookie ablegen, 10 Min TTL
    res.cookies.set("ms_oauth_state", state, {
      httpOnly: true,
      secure: proto === "https",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch (err) {
    console.error("Microsoft connect error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
