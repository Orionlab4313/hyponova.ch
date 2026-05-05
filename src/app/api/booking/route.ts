import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getAvailability, getBlockedEntries } from "@/lib/availability-store";
import { triggerIntegration } from "@/lib/integrations";
import { createOnlineMeeting } from "@/lib/microsoft-graph";

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
  const activeSlots = availabilitySettings.filter((a) => a.day === dayOfWeek && a.active);
  if (activeSlots.length === 0) return NextResponse.json({ slots: [], available: false });

  const dayBlocked = blockedEntries.find((b) => b.date === date && b.type === "day");
  if (dayBlocked) return NextResponse.json({ slots: [], available: false });

  // Generate slots from all active time ranges for this day
  let allSlots: string[] = [];
  for (const avail of activeSlots) {
    allSlots = allSlots.concat(generateSlots(avail.start, avail.end, SLOT_DURATION));
  }
  // Remove duplicates and sort
  allSlots = [...new Set(allSlots)].sort();

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
      if (slotMin < timeToMinutes(blocked.end_time) && slotEndMin > timeToMinutes(blocked.start_time)) return false;
    }
    return true;
  });

  return NextResponse.json({ slots: availableSlots, available: true });
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { date, time, first_name, last_name, email, phone, notes, lang } = body;

  if (!date || !time || !first_name || !last_name || !email) {
    return NextResponse.json({ error: "Bitte füllen Sie alle Pflichtfelder aus." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("appointments").select("id").eq("date", date).eq("time_start", time + ":00").neq("status", "abgesagt").limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Dieser Termin ist leider nicht mehr verfügbar." }, { status: 409 });
  }

  const { data: lead } = await supabase
    .from("leads")
    .insert({ first_name, last_name, email, phone: phone || "", status: "neu", source: "website", notes: notes || "" })
    .select().single();

  const [h, m] = time.split(":").map(Number);
  const endMin = h * 60 + m + SLOT_DURATION;
  const endTime = `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      lead_id: lead?.id || null,
      title: `Beratungsgespräch - ${first_name} ${last_name}`,
      description: notes || "", date,
      time_start: time + ":00", time_end: endTime + ":00",
      status: "geplant",
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Microsoft Teams Online-Meeting erstellen (non-blocking — wenn fehlschlaegt,
  // wird der Termin trotzdem ohne Teams-Link gebucht, Email warnt nicht).
  // Best-effort: Wenn Microsoft-Konto nicht verbunden ist -> null, alles laeuft normal weiter.
  let teamsJoinUrl: string | null = null;
  let teamsMeetingId: string | null = null;
  try {
    const startIso = `${date}T${time}:00`;
    const endIso = `${date}T${endTime}:00`;
    const meeting = await createOnlineMeeting({
      subject: `Beratungsgespräch ${first_name} ${last_name} — HYPONOVA`,
      startIso,
      endIso,
      timeZone: "Europe/Zurich",
      attendees: [{ email, name: `${first_name} ${last_name}` }],
      bodyText: `Kostenloses Beratungsgespräch mit HYPONOVA GmbH.\nKunde: ${first_name} ${last_name}\nE-Mail: ${email}\nTelefon: ${phone || "-"}${notes ? "\n\nNotizen: " + notes : ""}`,
    });

    if (meeting) {
      teamsJoinUrl = meeting.joinUrl;
      teamsMeetingId = meeting.eventId;
      // Termin in DB updaten mit Teams-Daten
      await supabase
        .from("appointments")
        .update({
          teams_join_url: teamsJoinUrl,
          teams_meeting_id: teamsMeetingId,
        })
        .eq("id", appointment.id);
    }
  } catch (msErr) {
    console.error("Teams meeting creation failed (continuing without):", msErr);
  }

  // Trigger Supabase Edge Function (non-blocking) — Email + ICS bekommen Teams-URL mit
  triggerIntegration({
    action: "create",
    appointment: { ...appointment, teams_join_url: teamsJoinUrl, teams_meeting_id: teamsMeetingId },
    lead,
    lang: lang || "de",
  });

  return NextResponse.json({ ...appointment, teams_join_url: teamsJoinUrl });
}
