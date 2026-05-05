import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { updateOnlineMeeting, deleteOnlineMeeting } from "@/lib/microsoft-graph";

const ALLOWED_FIELDS = [
  "lead_id",
  "title",
  "description",
  "date",
  "time_start",
  "time_end",
  "status",
] as const;

function pickAllowed(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) out[k] = body[k];
  }
  return out;
}

export async function GET(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, leads(first_name, last_name, email, phone)")
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const body = await request.json();
  const insert = pickAllowed(body);
  const { data, error } = await supabase.from("appointments").insert(insert).select().single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  // Vorherige Daten holen — fuer Microsoft-Meeting-Update
  const { data: previous } = await supabase
    .from("appointments")
    .select("date, time_start, time_end, teams_meeting_id, lead_id")
    .eq("id", id)
    .maybeSingle();

  const updates = pickAllowed(body);
  const { data, error } = await supabase.from("appointments").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });

  // Wenn Datum/Zeit geaendert wurde UND Microsoft-Meeting existiert -> Meeting verschieben
  const dateChanged = body.date && body.date !== previous?.date;
  const timeChanged =
    (body.time_start && body.time_start !== previous?.time_start) ||
    (body.time_end && body.time_end !== previous?.time_end);

  if (previous?.teams_meeting_id && (dateChanged || timeChanged)) {
    try {
      const newDate = body.date || previous.date;
      const newStart = (body.time_start || previous.time_start || "").slice(0, 5);
      const newEnd = (body.time_end || previous.time_end || "").slice(0, 5);
      await updateOnlineMeeting({
        eventId: previous.teams_meeting_id,
        startIso: `${newDate}T${newStart}:00`,
        endIso: `${newDate}T${newEnd}:00`,
        timeZone: "Europe/Zurich",
      });
    } catch (e) {
      console.error("Teams meeting update failed:", e);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const supabase = createServiceClient();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  // Microsoft-Meeting-ID vorher holen
  const { data: previous } = await supabase
    .from("appointments")
    .select("teams_meeting_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });

  // Best-effort: Microsoft-Meeting auch loeschen (Outlook-Kalender + Teams-Link)
  if (previous?.teams_meeting_id) {
    try {
      await deleteOnlineMeeting(previous.teams_meeting_id);
    } catch (e) {
      console.error("Teams meeting delete failed:", e);
    }
  }

  return NextResponse.json({ success: true });
}
