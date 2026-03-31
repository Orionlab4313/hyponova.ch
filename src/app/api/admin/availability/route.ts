import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Store availability in a simple key-value approach using Supabase
// Falls back to defaults if nothing is saved yet

const DEFAULT_AVAILABILITY = [
  { day: 0, start: "09:00", end: "17:00", active: false },
  { day: 1, start: "09:00", end: "17:00", active: true },
  { day: 2, start: "09:00", end: "17:00", active: true },
  { day: 3, start: "09:00", end: "17:00", active: true },
  { day: 4, start: "09:00", end: "17:00", active: true },
  { day: 5, start: "09:00", end: "17:00", active: true },
  { day: 6, start: "09:00", end: "17:00", active: false },
];

// In-memory store (persists across requests in same server instance)
let savedAvailability: any[] | null = null;
let savedBlocked: any[] | null = null;

export async function GET() {
  return NextResponse.json({
    availability: savedAvailability || DEFAULT_AVAILABILITY,
    blocked: savedBlocked || [],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.availability) savedAvailability = body.availability;
  if (body.blocked !== undefined) savedBlocked = body.blocked;
  return NextResponse.json({ success: true });
}
