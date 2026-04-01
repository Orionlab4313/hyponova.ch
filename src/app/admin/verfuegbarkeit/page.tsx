"use client";

import { useEffect, useState } from "react";

const WEEKDAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

interface AvailabilitySlot {
  day: number;
  start: string;
  end: string;
  active: boolean;
}

interface BlockedEntry {
  id: string;
  date: string;
  reason: string;
  type: "day" | "hours";
  start_time?: string;
  end_time?: string;
}

const DEFAULT_SLOTS: AvailabilitySlot[] = [
  { day: 0, start: "09:00", end: "17:00", active: false },
  { day: 1, start: "09:00", end: "17:00", active: true },
  { day: 2, start: "09:00", end: "17:00", active: true },
  { day: 3, start: "09:00", end: "17:00", active: true },
  { day: 4, start: "09:00", end: "17:00", active: true },
  { day: 5, start: "09:00", end: "17:00", active: true },
  { day: 6, start: "09:00", end: "17:00", active: false },
];

export default function VerfuegbarkeitPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(DEFAULT_SLOTS);
  const [blockedEntries, setBlockedEntries] = useState<BlockedEntry[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newType, setNewType] = useState<"day" | "hours">("day");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("12:00");
  const [saved, setSaved] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    // Load from server API
    fetch("/api/admin/availability")
      .then((r) => r.json())
      .then((data) => {
        if (data.availability) setSlots(data.availability);
        if (data.blocked) setBlockedEntries(data.blocked);
      });

    fetch("/api/admin/appointments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const today = new Date().toISOString().split("T")[0];
          setUpcomingAppointments(data.filter((a: any) => a.date >= today && a.status !== "abgesagt").slice(0, 10));
        }
      });
  }, []);

  function toggleDay(day: number) {
    setSlots(slots.map((s) => s.day === day ? { ...s, active: !s.active } : s));
  }

  function updateSlot(day: number, field: "start" | "end", value: string) {
    setSlots(slots.map((s) => s.day === day ? { ...s, [field]: value } : s));
  }

  function addBlockedEntry() {
    if (!newDate) return;
    const entry: BlockedEntry = {
      id: crypto.randomUUID(),
      date: newDate,
      reason: newReason,
      type: newType,
      ...(newType === "hours" ? { start_time: newStartTime, end_time: newEndTime } : {}),
    };
    setBlockedEntries([...blockedEntries, entry]);
    setNewDate("");
    setNewReason("");
    setNewType("day");
  }

  function removeBlockedEntry(id: string) {
    setBlockedEntries(blockedEntries.filter((b) => b.id !== id));
  }

  async function saveSettings() {
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability: slots, blocked: blockedEntries }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = { padding: "7px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      <div className="admin-stack-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Verfügbare Zeiten für Terminbuchungen verwalten</p>
        <button
          onClick={saveSettings}
          style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, background: saved ? "#22c55e" : "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }}
        >
          {saved ? "✓ Gespeichert" : "Speichern"}
        </button>
      </div>

      <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
        {/* Weekly Availability */}
        <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "12px 14px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>Wöchentliche Verfügbarkeit</h3>
          <div style={{ display: "grid", gap: 6 }}>
            {slots.map((slot) => (
              <div key={slot.day} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, background: slot.active ? "#f0fdf4" : "#f9f9f9", border: `1px solid ${slot.active ? "#bbf7d0" : "#e5e5e5"}`, transition: "all 0.15s" }}>
                <button
                  onClick={() => toggleDay(slot.day)}
                  style={{ width: 32, height: 18, borderRadius: 9, border: "none", background: slot.active ? "#22c55e" : "#ddd", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <span style={{ position: "absolute", top: 2, left: slot.active ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                </button>
                <span style={{ fontSize: 12, fontWeight: 500, width: 80, color: slot.active ? "#1a1a1a" : "#999", flexShrink: 0 }}>
                  {WEEKDAY_NAMES[slot.day]}
                </span>
                {slot.active ? (
                  <div className="admin-stack-mobile" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="time" value={slot.start} onChange={(e) => updateSlot(slot.day, "start", e.target.value)} style={{ ...inputStyle, width: 100 }} />
                    <span style={{ color: "#999", fontSize: 12 }}>bis</span>
                    <input type="time" value={slot.end} onChange={(e) => updateSlot(slot.day, "end", e.target.value)} style={{ ...inputStyle, width: 100 }} />
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#999" }}>Nicht verfügbar</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          {/* Blocked Dates/Hours */}
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "12px 14px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>Blockierte Zeiten</h3>
            <p style={{ fontSize: 11, color: "#888", margin: "0 0 10px" }}>Ganze Tage oder einzelne Stunden blockieren</p>

            {/* Type selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                onClick={() => setNewType("day")}
                style={{ padding: "4px 10px", fontSize: 11, fontWeight: 500, borderRadius: 14, cursor: "pointer", border: newType === "day" ? "none" : "1px solid #ddd", background: newType === "day" ? "#1a1a1a" : "#fff", color: newType === "day" ? "#fff" : "#555" }}
              >
                Ganzer Tag
              </button>
              <button
                onClick={() => setNewType("hours")}
                style={{ padding: "4px 10px", fontSize: 11, fontWeight: 500, borderRadius: 14, cursor: "pointer", border: newType === "hours" ? "none" : "1px solid #ddd", background: newType === "hours" ? "#1a1a1a" : "#fff", color: newType === "hours" ? "#fff" : "#555" }}
              >
                Bestimmte Stunden
              </button>
            </div>

            <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <input type="text" placeholder="Grund (optional)" value={newReason} onChange={(e) => setNewReason(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
              {newType === "hours" && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ color: "#999", fontSize: 12 }}>bis</span>
                  <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
              )}
              <button
                onClick={addBlockedEntry}
                disabled={!newDate}
                style={{ padding: "7px 14px", fontSize: 12, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", opacity: newDate ? 1 : 0.4 }}
              >
                Hinzufügen
              </button>
            </div>

            {blockedEntries.length === 0 ? (
              <p style={{ fontSize: 12, color: "#999" }}>Keine blockierten Zeiten eingetragen</p>
            ) : (
              <div style={{ display: "grid", gap: 4 }}>
                {blockedEntries.sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#fef2f2", borderRadius: 5, border: "1px solid #fecaca" }}>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: "#ef4444" }}>
                        {new Date(b.date + "T00:00:00").toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "long" })}
                      </span>
                      {b.type === "hours" && (
                        <span style={{ color: "#888", marginLeft: 4 }}>
                          {b.start_time} – {b.end_time}
                        </span>
                      )}
                      {b.type === "day" && (
                        <span style={{ fontSize: 10, color: "#999", marginLeft: 4 }}>(ganztägig)</span>
                      )}
                      {b.reason && <span style={{ color: "#999", marginLeft: 6 }}>— {b.reason}</span>}
                    </div>
                    <button onClick={() => removeBlockedEntry(b.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "12px 14px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>Bevorstehende Termine</h3>
            {upcomingAppointments.length === 0 ? (
              <p style={{ fontSize: 12, color: "#999" }}>Keine bevorstehenden Termine</p>
            ) : (
              <div style={{ display: "grid", gap: 4 }}>
                {upcomingAppointments.map((appt: any) => (
                  <div key={appt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{appt.title}</p>
                      <p style={{ fontSize: 11, color: "#888", margin: "1px 0 0" }}>{appt.time_start?.slice(0, 5)} – {appt.time_end?.slice(0, 5)}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "#888" }}>
                      {new Date(appt.date + "T00:00:00").toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
