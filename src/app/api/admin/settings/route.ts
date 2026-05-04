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
    site_protection_enabled: s.site_protection_enabled,
    teams_meeting_url: s.teams_meeting_url || "",
  });
}

/** Aktualisiert nicht-sicherheitskritische Settings (Teams-Link etc.). */
export async function PATCH(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { teams_meeting_url } = body;
    const sb = (await import("@/lib/supabase")).createServiceClient();

    const updates: Record<string, unknown> = {};
    if (typeof teams_meeting_url === "string") {
      const trimmed = teams_meeting_url.trim();
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return NextResponse.json({ error: "Teams-Link muss mit https:// beginnen" }, { status: 400 });
      }
      updates.teams_meeting_url = trimmed || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Keine Aenderungen" }, { status: 400 });
    }

    const { error } = await sb.from("admin_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
