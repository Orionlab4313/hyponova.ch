import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";
import { decryptSecret, encryptSecret } from "@/lib/crypto-helper";
import { exchangeCodeForTokens, fetchMicrosoftUserEmail } from "@/lib/microsoft-graph";

/**
 * OAuth-Callback von Microsoft Identity Platform.
 * Tauscht den Authorization-Code gegen ein Refresh-Token + Access-Token.
 * Speichert Refresh-Token verschluesselt in admin_settings.
 *
 * Wird aufgerufen mit ?code=...&state=...
 */
export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // CSRF-Check via Cookie
  const cookieState = request.cookies.get("ms_oauth_state")?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/einstellungen?ms_error=${encodeURIComponent(errorDescription || error)}`, request.url),
    );
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/admin/einstellungen?ms_error=invalid_state", request.url),
    );
  }

  try {
    const sb = createServiceClient();
    const { data: settings } = await sb
      .from("admin_settings")
      .select("microsoft_tenant_id, microsoft_client_id, microsoft_client_secret_encrypted")
      .eq("id", 1)
      .maybeSingle();

    if (
      !settings?.microsoft_tenant_id ||
      !settings?.microsoft_client_id ||
      !settings?.microsoft_client_secret_encrypted
    ) {
      return NextResponse.redirect(
        new URL("/admin/einstellungen?ms_error=app_not_configured", request.url),
      );
    }

    const clientSecret = decryptSecret(settings.microsoft_client_secret_encrypted);
    if (!clientSecret) {
      return NextResponse.redirect(
        new URL("/admin/einstellungen?ms_error=secret_decrypt_failed", request.url),
      );
    }

    const host = request.headers.get("host") || "hyponova.ch";
    const proto = host.includes("localhost") ? "http" : "https";
    const redirectUri = `${proto}://${host}/api/admin/microsoft/callback`;

    const tokens = await exchangeCodeForTokens(
      settings.microsoft_tenant_id,
      settings.microsoft_client_id,
      clientSecret,
      code,
      redirectUri,
    );

    const userEmail = await fetchMicrosoftUserEmail(tokens.access_token);

    await sb
      .from("admin_settings")
      .update({
        microsoft_refresh_token_encrypted: encryptSecret(tokens.refresh_token),
        microsoft_user_email: userEmail,
        microsoft_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    const res = NextResponse.redirect(
      new URL("/admin/einstellungen?ms_success=1", request.url),
    );
    res.cookies.delete("ms_oauth_state");
    return res;
  } catch (err) {
    console.error("Microsoft callback error:", err);
    return NextResponse.redirect(
      new URL(
        `/admin/einstellungen?ms_error=${encodeURIComponent(String(err).slice(0, 200))}`,
        request.url,
      ),
    );
  }
}
