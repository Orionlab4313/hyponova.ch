import { NextRequest, NextResponse } from "next/server";
import { getAdminSettings } from "@/lib/admin-settings";
import { isAdminAuthenticated } from "@/lib/admin-guard";

/** Liest aktuellen Settings-Status (ohne Hashes/Secrets). */
export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await getAdminSettings();
  return NextResponse.json({
    notification_email: s.notification_email,
    totp_enabled: s.totp_enabled,
    backup_codes_count: s.backup_codes.length,
    site_password_set: !!s.site_password_hash,
    admin_password_set: !!s.admin_password_hash,
  });
}
