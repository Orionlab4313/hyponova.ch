import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { updateAdminSettings } from "@/lib/admin-settings";

/**
 * Schaltet den Webseiten-Passwort-Schutz an oder aus.
 * Aenderung wirkt innerhalb von max 30 Sekunden (Middleware-Cache).
 */
export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const enabled = body.enabled === true || body.enabled === "true";
  await updateAdminSettings({ site_protection_enabled: enabled });
  return NextResponse.json({ success: true, site_protection_enabled: enabled });
}
