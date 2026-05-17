import { NextResponse } from "next/server";
import { getAvailability, getBlockedEntries } from "@/lib/availability-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [availability, blocked] = await Promise.all([
    getAvailability(),
    getBlockedEntries(),
  ]);

  const activeDays = [
    ...new Set(availability.filter((a) => a.active).map((a) => a.day)),
  ];

  const blockedDays = blocked
    .filter((b) => b.type === "day")
    .map((b) => b.date);

  return NextResponse.json(
    { activeDays, blockedDays },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
