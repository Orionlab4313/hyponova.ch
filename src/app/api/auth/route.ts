import { NextRequest, NextResponse } from "next/server";
import { verifySitePassword } from "@/lib/admin-settings";
import { signAdminToken } from "@/lib/admin-session";
import { checkRateLimit, clientIp, resetRateLimit } from "@/lib/rate-limit";

const COOKIE_NAME = "hyponova-auth";
const COOKIE_TTL = 60 * 60 * 24 * 30; // 30d

const RL_BUCKET = "site-login";
const RL_MAX = 12;
const RL_WINDOW = 15 * 60;

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({
    bucket: RL_BUCKET,
    key: ip,
    max: RL_MAX,
    windowSeconds: RL_WINDOW,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Zu viele Versuche. Bitte in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten erneut versuchen.` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const ok = await verifySitePassword(String(body.password ?? ""));

  if (ok) {
    await resetRateLimit(RL_BUCKET, ip);
    const token = signAdminToken("site", COOKIE_TTL);
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_TTL,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
}
