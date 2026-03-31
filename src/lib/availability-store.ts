// Shared in-memory store for availability settings
// Used by both the admin availability API and the booking API

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

// Module-level state (shared across API routes in same process)
let availability: AvailabilitySlot[] = DEFAULT_AVAILABILITY;
let blockedEntries: BlockedEntry[] = [];

export function getAvailability() {
  return availability;
}

export function getBlockedEntries() {
  return blockedEntries;
}

export function setAvailability(data: AvailabilitySlot[]) {
  availability = data;
}

export function setBlockedEntries(data: BlockedEntry[]) {
  blockedEntries = data;
}
