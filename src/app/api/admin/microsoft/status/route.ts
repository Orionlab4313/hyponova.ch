import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";

/**
 * Status-Endpunkt fuers Admin-UI: zeigt ob Microsoft Teams verbunden ist
 * und mit welcher Email.
 */
export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const sb = createServiceClient();
  const { data } = await sb
    .from("admin_settings")
    .select(
      "microsoft_tenant_id, microsoft_client_id, microsoft_client_secret_encrypted, microsoft_refresh_token_encrypted, microsoft_user_email, microsoft_connected_at, microsoft_last_check_at, microsoft_last_error",
    )
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({
    app_configured: !!(
      data?.microsoft_tenant_id &&
      data?.microsoft_client_id &&
      data?.microsoft_client_secret_encrypted
    ),
    connected: !!data?.microsoft_refresh_token_encrypted,
    user_email: data?.microsoft_user_email || null,
    connected_at: data?.microsoft_connected_at || null,
    last_check_at: data?.microsoft_last_check_at || null,
    // Gesetzt, wenn der letzte Token-Refresh scheiterte (Verbindung abgelaufen oder widerrufen)
    last_error: data?.microsoft_last_error || null,
  });
}
