import { NextRequest, NextResponse } from "next/server";
import { readPrefillToken } from "@/lib/prefill-tokens";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RL_BUCKET = "public-prefill";
const RL_MAX = 30;
const RL_WINDOW = 60 * 5; // 5 Min

/**
 * GET /api/public/prefill?token=<32-hex>
 * Liest Lead-Daten via Prefill-Token fuer Termin-Form Auto-Fill.
 * Returns: { first_name, last_name, email, phone } oder 404.
 */
export async function GET(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = await checkRateLimit({
    bucket: RL_BUCKET,
    key: ip,
    max: RL_MAX,
    windowSeconds: RL_WINDOW,
  });
  if (!limit.ok) {
    return NextResponse.json({ error: "Zu viele Anfragen" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token fehlt" }, { status: 400 });
  }

  const lead = await readPrefillToken(token);

  if (!lead) {
    return NextResponse.json(
      { error: "Token ungültig, abgelaufen oder bereits verwendet" },
      { status: 404 }
    );
  }

  return NextResponse.json(lead);
}
