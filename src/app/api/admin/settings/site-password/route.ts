import { NextRequest, NextResponse } from "next/server";
import { setSitePassword, verifyAdminPassword } from "@/lib/admin-settings";
import { isAdminAuthenticated } from "@/lib/admin-guard";

/** Webseiten-Passwort ändern (Admin-authed, zur Sicherheit zusätzlich Admin-PW prüfen). */
export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { adminPassword, newPassword } = await request.json();
  if (!newPassword || String(newPassword).length < 6) {
    return NextResponse.json(
      { error: "Neues Passwort muss mindestens 6 Zeichen haben" },
      { status: 400 }
    );
  }
  const ok = await verifyAdminPassword(String(adminPassword || ""));
  if (!ok) {
    return NextResponse.json({ error: "Admin-Passwort falsch" }, { status: 401 });
  }
  await setSitePassword(String(newPassword));
  return NextResponse.json({ success: true });
}
