import { NextRequest } from "next/server";
import { verifyAdminToken } from "./admin-session";

const FULL_COOKIE = "hyponova-admin-session";

export function isAdminAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(FULL_COOKIE)?.value;
  const payload = verifyAdminToken(token);
  return !!(payload && payload.stage === "full");
}
