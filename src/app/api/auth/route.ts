import { NextRequest, NextResponse } from "next/server";
import { verifySitePassword } from "@/lib/admin-settings";

const COOKIE_NAME = "hyponova-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ok = await verifySitePassword(String(body.password ?? ""));

  if (ok) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
}
