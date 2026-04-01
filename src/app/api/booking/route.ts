import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getAvailability, getBlockedEntries } from "@/lib/availability-store";
import { sendBookingConfirmation } from "@/lib/infomaniak-email";
import { createCalendarEvent } from "@/lib/infomaniak-calendar";
import { createContact } from "@/lib/infomaniak-contacts";

const SLOT_DURATION = 60;

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Datum erforderlich" }, { status: 400 });

  const [availabilitySettings, blockedEntries] = await Promise.all([
    getAvailability(),
    getBlockedEntries(),
  ]);

  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const avail = availabilitySettings.find((a) => a.day === dayOfWeek && a.active);
  if (!avail) return NextResponse.json({ slots: [], available: false });

  const dayBlocked = blockedEntries.find((b) => b.date === date && b.type === "day");
  if (dayBlocked) return NextResponse.json({ slots: [], available: false });

  const allSlots = generateSlots(avail.start, avail.end, SLOT_DURATION);

  const supabase = createServiceClient();
  const { data: appointments } = await supabase
    .from("appointments")
    .select("time_start")
    .eq("date", date)
    .neq("status", "abgesagt");

  const bookedTimes = (appointments || []).map((a: any) => a.time_start?.slice(0, 5));
  const blockedHours = blockedEntries.filter((b) => b.date === date && b.type === "hours");

  const availableSlots = allSlots.filter((slot) => {
    if (bookedTimes.includes(slot)) return false;
    const slotMin = timeToMinutes(slot);
    const slotEndMin = slotMin + SLOT_DURATION;
    for (const blocked of blockedHours) {
      if (!blocked.start_time || !blocked.end_time) continue;
      const blockStart = timeToMinutes(blocked.start_time);
      const blockEnd = timeToMinutes(blocked.end_time);
      if (slotMin < blockEnd && slotEndMin > blockStart) return false;
    }
    return true;
  });

  return NextResponse.json({ slots: availableSlots, available: true });
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { date, time, first_name, last_name, email, phone, notes } = body;

  if (!date || !time || !first_name || !last_name || !email) {
    return NextResponse.json({ error: "Bitte füllen Sie alle Pflichtfelder aus." }, { status: 400 });
  }

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

  const { data: lead } = await supabase
    .from("leads")
    .insert({ first_name, last_name, email, phone: phone || "", status: "neu", source: "website", notes: notes || "" })
    .select()
    .single();

  const [h, m] = time.split(":").map(Number);
  const endMin = h * 60 + m + SLOT_DURATION;
  const endTime = `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      lead_id: lead?.id || null,
      title: `Beratungsgespräch - ${first_name} ${last_name}`,
      description: notes || "",
      date,
      time_start: time + ":00",
      time_end: endTime + ":00",
      status: "geplant",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Directly call integrations (no internal fetch)
  try {
    await Promise.all([
      sendBookingConfirmation({
        to: email,
        firstName: first_name,
        lastName: last_name,
        date,
        timeStart: time,
        timeEnd: endTime,
      }),
      createCalendarEvent({
        uid: appointment.id,
        summary: `Beratungsgespräch - ${first_name} ${last_name}`,
        description: `Kunde: ${first_name} ${last_name}\nE-Mail: ${email}\nTelefon: ${phone || "-"}\n\n${notes || ""}`,
        date,
        timeStart: time,
        timeEnd: endTime,
        attendeeName: `${first_name} ${last_name}`,
        attendeeEmail: email,
      }),
      createContact({
        uid: lead?.id || appointment.id,
        firstName: first_name,
        lastName: last_name,
        email,
        phone: phone || undefined,
        note: `Quelle: Website\nTerminbuchung: ${date}`,
      }),
    ]);
  } catch (err) {
    console.error("Integration error (non-blocking):", err);
  }

  return NextResponse.json(appointment);
}
