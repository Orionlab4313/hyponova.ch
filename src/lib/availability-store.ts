// Persistent availability storage using Supabase tables
import { createClient } from "@supabase/supabase-js";

export interface AvailabilitySlot {
  day: number;
  start: string;
  end: string;
  active: boolean;
}

export interface BlockedEntry {
  id: string;
  date: string;
  reason: string;
  type: "day" | "hours";
  start_time?: string;
  end_time?: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { day: 0, start: "09:00", end: "17:00", active: false },
  { day: 1, start: "09:00", end: "17:00", active: true },
  { day: 2, start: "09:00", end: "17:00", active: true },
  { day: 3, start: "09:00", end: "17:00", active: true },
  { day: 4, start: "09:00", end: "17:00", active: true },
  { day: 5, start: "09:00", end: "17:00", active: true },
  { day: 6, start: "09:00", end: "17:00", active: false },
];

export async function getAvailability(): Promise<AvailabilitySlot[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("availability")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (data && data.length > 0) {
      return data.map((r: any) => ({
        day: r.day_of_week,
        start: r.start_time?.slice(0, 5) || "09:00",
        end: r.end_time?.slice(0, 5) || "17:00",
        active: r.is_active,
      }));
    }
  } catch {}
  return DEFAULT_AVAILABILITY;
}

export async function getBlockedEntries(): Promise<BlockedEntry[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true });

    if (data) {
      return data.map((r: any) => ({
        id: r.id,
        date: r.date,
        reason: r.reason || "",
        type: r.block_type || "day",
        start_time: r.start_time?.slice(0, 5),
        end_time: r.end_time?.slice(0, 5),
      }));
    }
  } catch {}
  return [];
}

export async function setAvailability(slots: AvailabilitySlot[]) {
  const supabase = getSupabase();
  for (const slot of slots) {
    await supabase
      .from("availability")
      .update({
        start_time: slot.start + ":00",
        end_time: slot.end + ":00",
        is_active: slot.active,
      })
      .eq("day_of_week", slot.day);
  }
}

export async function setBlockedEntries(entries: BlockedEntry[]) {
  const supabase = getSupabase();
  // Delete all existing and re-insert
  await supabase.from("blocked_dates").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (entries.length > 0) {
    await supabase.from("blocked_dates").insert(
      entries.map((e) => ({
        date: e.date,
        start_time: e.type === "hours" && e.start_time ? e.start_time + ":00" : null,
        end_time: e.type === "hours" && e.end_time ? e.end_time + ":00" : null,
        block_type: e.type,
        reason: e.reason || null,
      }))
    );
  }
}
