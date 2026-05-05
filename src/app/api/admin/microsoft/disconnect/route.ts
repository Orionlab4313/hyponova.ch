import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createServiceClient } from "@/lib/supabase";

/**
 * Loescht den gespeicherten Refresh-Token. Tenant-ID + Client-ID + Secret
 * bleiben erhalten — nur die User-Verknuepfung wird entfernt.
 */
export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const sb = createServiceClient();
    await sb
      .from("admin_settings")
      .update({
        microsoft_refresh_token_encrypted: null,
        microsoft_user_email: null,
        microsoft_connected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Microsoft disconnect error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
