import { NextRequest, NextResponse } from "next/server";
import { getAvailability, getBlockedEntries, setAvailability, setBlockedEntries } from "@/lib/availability-store";

export async function GET() {
  const [availability, blocked] = await Promise.all([
    getAvailability(),
    getBlockedEntries(),
  ]);
  return NextResponse.json({ availability, blocked });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const promises: Promise<void>[] = [];
  if (body.availability) promises.push(setAvailability(body.availability));
  if (body.blocked !== undefined) promises.push(setBlockedEntries(body.blocked));
  await Promise.all(promises);
  return NextResponse.json({ success: true });
}
