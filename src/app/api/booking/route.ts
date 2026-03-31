import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const SLOT_DURATION = 60; // minutes

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;

  while (current + duration <= endMin) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    current += duration;
  }
  return slots;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// GET available slots for a given date
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Datum erforderlich" }, { status: 400 });
  }

  // Fetch availability settings from the availability API (in-memory store)
  let availabilitySettings: any[] | null = null;
  let blockedEntries: any[] = [];

  try {
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/admin/availability`);
    const data = await res.json();
    availabilitySettings = data.availability;
    blockedEntries = data.blocked || [];
  } catch {
    // Use defaults if fetch fails
  }

  const DEFAULT_AVAILABILITY = [
    { day: 1, start: "09:00", end: "17:00", active: true },
    { day: 2, start: "09:00", end: "17:00", active: true },
    { day: 3, start: "09:00", end: "17:00", active: true },
    { day: 4, start: "09:00", end: "17:00", active: true },
    { day: 5, start: "09:00", end: "17:00", active: true },
  ];

  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const avail = availabilitySettings
    ? availabilitySettings.find((a: any) => a.day === dayOfWeek && a.active)
    : DEFAULT_AVAILABILITY.find((a) => a.day === dayOfWeek);

  if (!avail) {
    return NextResponse.json({ slots: [], message: "An diesem Tag sind keine Termine verfügbar." });
  }

  // Check if entire day is blocked
  const dayBlocked = blockedEntries.find((b: any) => b.date === date && b.type === "day");
  if (dayBlocked) {
    return NextResponse.json({ slots: [], message: "Dieser Tag ist blockiert." });
  }

  // Generate all possible slots
  const allSlots = generateSlots(avail.start, avail.end, SLOT_DURATION);

  // Get booked appointments for this date
  const supabase = createServiceClient();
  const { data: appointments } = await supabase
    .from("appointments")
    .select("time_start, time_end")
    .eq("date", date)
    .neq("status", "abgesagt");

  const bookedTimes = (appointments || []).map((a: any) => a.time_start?.slice(0, 5));

  // Get blocked hours for this date
  const blockedHours = blockedEntries.filter((b: any) => b.date === date && b.type === "hours");

  // Filter out booked and blocked slots
  const availableSlots = allSlots.filter((slot) => {
    // Already booked?
    if (bookedTimes.includes(slot)) return false;

    // Blocked by hour range?
    const slotMin = timeToMinutes(slot);
    const slotEndMin = slotMin + SLOT_DURATION;

    for (const blocked of blockedHours) {
      const blockStart = timeToMinutes(blocked.start_time);
      const blockEnd = timeToMinutes(blocked.end_time);
      // Overlap check
      if (slotMin < blockEnd && slotEndMin > blockStart) return false;
    }

    return true;
  });

  return NextResponse.json({ slots: availableSlots });
}

// POST book a new appointment
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { date, time, first_name, last_name, email, phone, notes } = body;

  if (!date || !time || !first_name || !last_name || !email) {
    return NextResponse.json({ error: "Bitte füllen Sie alle Pflichtfelder aus." }, { status: 400 });
  }

  // Check if slot is still available
  const { data: existing } = await supabase
    .from("appointments")
    .select("id")
    .eq("date", date)
    .eq("time_start", time + ":00")
    .neq("status", "abgesagt")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Dieser Termin ist leider nicht mehr verfügbar." }, { status: 409 });
  }

  // Create lead
  const { data: lead } = await supabase
    .from("leads")
    .insert({
      first_name,
      last_name,
      email,
      phone: phone || "",
      status: "neu",
      source: "website",
      notes: notes || "",
    })
    .select()
    .single();

  // Calculate end time
  const [h, m] = time.split(":").map(Number);
  const endMin = h * 60 + m + SLOT_DURATION;
  const endTime = `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;

  // Create appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      lead_id: lead?.id || null,
      title: `Beratungsgespräch — ${first_name} ${last_name}`,
      description: notes || "",
      date,
      time_start: time + ":00",
      time_end: endTime + ":00",
      status: "geplant",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(appointment);
}
