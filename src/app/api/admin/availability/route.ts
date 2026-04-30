import { NextRequest, NextResponse } from "next/server";
import { getAvailability, getBlockedEntries, setAvailability, setBlockedEntries } from "@/lib/availability-store";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const [availability, blocked] = await Promise.all([
    getAvailability(),
    getBlockedEntries(),
  ]);
  return NextResponse.json({ availability, blocked });
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const body = await request.json();
  const promises: Promise<void>[] = [];
  if (body.availability) promises.push(setAvailability(body.availability));
  if (body.blocked !== undefined) promises.push(setBlockedEntries(body.blocked));
  await Promise.all(promises);
  return NextResponse.json({ success: true });
}
