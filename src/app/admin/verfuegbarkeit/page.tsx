"use client";

import { useEffect, useState } from "react";

const WEEKDAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

interface AvailabilitySlot {
  day: number;
  start: string;
  end: string;
  active: boolean;
}

interface BlockedDate {
  date: string;
  reason: string;
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
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [saved, setSaved] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    // Load saved availability from localStorage
    const savedSlots = localStorage.getItem("hyponova-availability");
    if (savedSlots) setSlots(JSON.parse(savedSlots));

    const savedBlocked = localStorage.getItem("hyponova-blocked-dates");
    if (savedBlocked) setBlockedDates(JSON.parse(savedBlocked));

    // Load upcoming appointments
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

  function addBlockedDate() {
    if (!newBlockedDate) return;
    setBlockedDates([...blockedDates, { date: newBlockedDate, reason: newBlockedReason }]);
    setNewBlockedDate("");
    setNewBlockedReason("");
  }

  function removeBlockedDate(date: string) {
    setBlockedDates(blockedDates.filter((b) => b.date !== date));
  }

  function saveSettings() {
    localStorage.setItem("hyponova-availability", JSON.stringify(slots));
    localStorage.setItem("hyponova-blocked-dates", JSON.stringify(blockedDates));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = { padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Verwalten Sie Ihre verfügbaren Zeiten für Terminbuchungen</p>
        </div>
        <button
          onClick={saveSettings}
          style={{
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 500,
            background: saved ? "#22c55e" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {saved ? "✓ Gespeichert" : "Speichern"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Weekly Availability */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, margin: "0 0 20px" }}>Wöchentliche Verfügbarkeit</h3>

          <div style={{ display: "grid", gap: 12 }}>
            {slots.map((slot) => (
              <div
                key={slot.day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: slot.active ? "#f0fdf4" : "#f9f9f9",
                  border: `1px solid ${slot.active ? "#bbf7d0" : "#e5e5e5"}`,
                  transition: "all 0.15s",
                }}
              >
                <button
                  onClick={() => toggleDay(slot.day)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    border: "none",
                    background: slot.active ? "#22c55e" : "#ddd",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: 2,
                    left: slot.active ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }} />
                </button>

                <span style={{ fontSize: 14, fontWeight: 500, width: 100, color: slot.active ? "#1a1a1a" : "#999" }}>
                  {WEEKDAY_NAMES[slot.day]}
                </span>

                {slot.active ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateSlot(slot.day, "start", e.target.value)}
                      style={{ ...inputStyle, width: 110 }}
                    />
                    <span style={{ color: "#999", fontSize: 13 }}>bis</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateSlot(slot.day, "end", e.target.value)}
                      style={{ ...inputStyle, width: 110 }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "#999" }}>Nicht verfügbar</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 12, background: "#fffbeb", borderRadius: 8, border: "1px solid #fef08a" }}>
            <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>
              Hinweis: Termine dauern je 60 Minuten. Die Verfügbarkeit wird aktuell lokal gespeichert.
              Für persistente Speicherung wird die Datenbank-Tabelle benötigt.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          {/* Blocked Dates */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Blockierte Tage</h3>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>Ferien, Feiertage oder andere Abwesenheiten</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="text"
                placeholder="Grund (optional)"
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addBlockedDate}
                disabled={!newBlockedDate}
                style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: newBlockedDate ? 1 : 0.4 }}
              >
                +
              </button>
            </div>

            {blockedDates.length === 0 ? (
              <p style={{ fontSize: 13, color: "#999" }}>Keine blockierten Tage eingetragen</p>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {blockedDates.sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                  <div key={b.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#ef4444" }}>
                        {new Date(b.date + "T00:00:00").toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "long" })}
                      </span>
                      {b.reason && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>— {b.reason}</span>}
                    </div>
                    <button onClick={() => removeBlockedDate(b.date)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments Preview */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Bevorstehende Termine</h3>
            {upcomingAppointments.length === 0 ? (
              <p style={{ fontSize: 13, color: "#999" }}>Keine bevorstehenden Termine</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {upcomingAppointments.map((appt: any) => (
                  <div key={appt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{appt.title}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
                        {appt.time_start?.slice(0, 5)} – {appt.time_end?.slice(0, 5)}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: "#888" }}>
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
