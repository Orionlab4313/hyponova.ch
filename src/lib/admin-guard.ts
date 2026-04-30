import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "./admin-session";

const FULL_COOKIE = "hyponova-admin-session";

export function isAdminAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(FULL_COOKIE)?.value;
  const payload = verifyAdminToken(token);
  return !!(payload && payload.stage === "full");
}

/**
 * Wirft eine 401-Response zurueck, wenn der Request nicht als Admin
 * authentifiziert ist. Verwendung am Anfang jeder Admin-API-Route:
 *
 *   const guard = requireAdmin(request);
 *   if (guard) return guard;
 *
 * Wenn null zurueckkommt, ist der Request authentifiziert.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
