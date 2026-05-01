import { NextRequest, NextResponse } from "next/server";
import { pruneExpiredTokens } from "@/lib/upload-tokens";

/**
 * GET /api/cron/prune-tokens
 *
 * Wird taeglich um 03:00 UTC von Vercel Cron aufgerufen (siehe vercel.json).
 * Loescht alle abgelaufenen Customer-Upload-Tokens aus der DB.
 *
 * Schutz: Vercel Cron sendet einen Authorization-Header mit dem
 * CRON_SECRET. Andere Quellen werden mit 401 abgelehnt.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;

  // In Production muss CRON_SECRET gesetzt sein und uebereinstimmen
  if (process.env.CRON_SECRET) {
    if (authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.VERCEL_ENV === "production") {
    // CRON_SECRET fehlt in Production → fail-closed
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  try {
    const deleted = await pruneExpiredTokens();
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error("prune-tokens cron error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
