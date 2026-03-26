import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = "Möhlin4313";
const COOKIE_NAME = "hyponova-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.password === SITE_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 Tage
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
}
