// Persistent availability storage using Supabase contact_requests table
// Stores settings as a special system record to avoid needing new tables

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

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { day: 0, start: "09:00", end: "17:00", active: false },
  { day: 1, start: "09:00", end: "17:00", active: true },
  { day: 2, start: "09:00", end: "17:00", active: true },
  { day: 3, start: "09:00", end: "17:00", active: true },
  { day: 4, start: "09:00", end: "17:00", active: true },
  { day: 5, start: "09:00", end: "17:00", active: true },
  { day: 6, start: "09:00", end: "17:00", active: false },
];

const SETTINGS_KEY = "__SYSTEM_AVAILABILITY__";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function getAvailability(): Promise<AvailabilitySlot[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("contact_requests")
      .select("message")
      .eq("first_name", SETTINGS_KEY)
      .eq("email", "availability")
      .single();

    if (data?.message) {
      return JSON.parse(data.message);
    }
  } catch {}
  return DEFAULT_AVAILABILITY;
}

export async function getBlockedEntries(): Promise<BlockedEntry[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("contact_requests")
      .select("message")
      .eq("first_name", SETTINGS_KEY)
      .eq("email", "blocked")
      .single();

    if (data?.message) {
      return JSON.parse(data.message);
    }
  } catch {}
  return [];
}

export async function setAvailability(slots: AvailabilitySlot[]) {
  const supabase = getSupabase();
  const json = JSON.stringify(slots);

  // Try update first
  const { data: existing } = await supabase
    .from("contact_requests")
    .select("id")
    .eq("first_name", SETTINGS_KEY)
    .eq("email", "availability")
    .single();

  if (existing) {
    await supabase
      .from("contact_requests")
      .update({ message: json })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("contact_requests")
      .insert({
        first_name: SETTINGS_KEY,
        last_name: "SETTINGS",
        email: "availability",
        subject: "system",
        message: json,
      });
  }
}

export async function setBlockedEntries(entries: BlockedEntry[]) {
  const supabase = getSupabase();
  const json = JSON.stringify(entries);

  const { data: existing } = await supabase
    .from("contact_requests")
    .select("id")
    .eq("first_name", SETTINGS_KEY)
    .eq("email", "blocked")
    .single();

  if (existing) {
    await supabase
      .from("contact_requests")
      .update({ message: json })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("contact_requests")
      .insert({
        first_name: SETTINGS_KEY,
        last_name: "SETTINGS",
        email: "blocked",
        subject: "system",
        message: json,
      });
  }
}
