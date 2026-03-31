import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Default availability (can be overridden by availability table later)
const DEFAULT_AVAILABILITY = [
  { day: 1, start: "09:00", end: "17:00" }, // Montag
  { day: 2, start: "09:00", end: "17:00" }, // Dienstag
  { day: 3, start: "09:00", end: "17:00" }, // Mittwoch
  { day: 4, start: "09:00", end: "17:00" }, // Donnerstag
  { day: 5, start: "09:00", end: "17:00" }, // Freitag
];

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

// GET available slots for a given date
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Datum erforderlich" }, { status: 400 });
  }

  const dayOfWeek = new Date(date + "T00:00:00").getDay(); // 0=Sun, 1=Mon...
  const availability = DEFAULT_AVAILABILITY.find((a) => a.day === dayOfWeek);

  if (!availability) {
    return NextResponse.json({ slots: [], message: "An diesem Tag sind keine Termine verfügbar." });
  }

  // Get all slots for the day
  const allSlots = generateSlots(availability.start, availability.end, SLOT_DURATION);

  // Get booked appointments for this date
  const supabase = createServiceClient();
  const { data: appointments } = await supabase
    .from("appointments")
    .select("time_start, time_end")
    .eq("date", date)
    .neq("status", "abgesagt");

  const bookedTimes = (appointments || []).map((a: any) => a.time_start?.slice(0, 5));
  const availableSlots = allSlots.filter((s) => !bookedTimes.includes(s));

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

  // Create lead first
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
