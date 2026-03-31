import { NextRequest, NextResponse } from "next/server";
import { getAvailability, getBlockedEntries, setAvailability, setBlockedEntries } from "@/lib/availability-store";

export async function GET() {
  return NextResponse.json({
    availability: getAvailability(),
    blocked: getBlockedEntries(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.availability) setAvailability(body.availability);
  if (body.blocked !== undefined) setBlockedEntries(body.blocked);
  return NextResponse.json({ success: true });
}
