"use client";

import { useEffect, useState } from "react";

const WEEKDAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

interface AvailabilitySlot { day: number; start: string; end: string; active: boolean; slot_index: number; }
interface BlockedEntry { id: string; date: string; reason: string; type: "day" | "hours"; start_time?: string; end_time?: string; }

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const mondayFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < mondayFirst; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function VerfuegbarkeitPage() {
  const [tab, setTab] = useState<"zeiten" | "kalender">("zeiten");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedEntries, setBlockedEntries] = useState<BlockedEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kalender state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [blockReason, setBlockReason] = useState("");
  const [showBlockModal, setShowBlockModal] = useState<string | null>(null);
  const [blockType, setBlockType] = useState<"day" | "hours">("day");
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("12:00");

  useEffect(() => {
    fetch("/api/admin/availability")
      .then((r) => r.json())
      .then((data) => {
        if (data.availability) setSlots(data.availability);
        if (data.blocked) setBlockedEntries(data.blocked);
        setLoading(false);
      });
  }, []);

  function toggleDay(day: number, slotIndex: number) {
    setSlots(slots.map((s) => s.day === day && s.slot_index === slotIndex ? { ...s, active: !s.active } : s));
  }
  function updateSlot(day: number, slotIndex: number, field: "start" | "end", value: string) {
    setSlots(slots.map((s) => s.day === day && s.slot_index === slotIndex ? { ...s, [field]: value } : s));
  }

  // Group slots by day
  const days = [0, 1, 2, 3, 4, 5, 6];
  function getSlotsForDay(day: number) {
    return slots.filter((s) => s.day === day).sort((a, b) => a.slot_index - b.slot_index);
  }

  function addBlockedEntry(date: string) {
    const entry: BlockedEntry = {
      id: crypto.randomUUID(),
      date,
      reason: blockReason,
      type: blockType,
      ...(blockType === "hours" ? { start_time: blockStartTime, end_time: blockEndTime } : {}),
    };
    setBlockedEntries([...blockedEntries, entry]);
    setShowBlockModal(null);
    setBlockReason("");
    setBlockType("day");
  }

  function removeBlocked(id: string) {
    setBlockedEntries(blockedEntries.filter((b) => b.id !== id));
  }

  function isDateBlocked(dateStr: string): BlockedEntry | undefined {
    return blockedEntries.find((b) => b.date === dateStr && b.type === "day");
  }

  function getBlockedHours(dateStr: string): BlockedEntry[] {
    return blockedEntries.filter((b) => b.date === dateStr && b.type === "hours");
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

  const today = new Date().toISOString().split("T")[0];
  const calDays = getCalendarDays(calYear, calMonth);

  function getDateStr(day: number) {
    return `${calYear}-${(calMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  const inputStyle = { padding: "7px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none", boxSizing: "border-box" as const };

  if (loading) return <p style={{ fontSize: 13, color: "#999" }}>Laden...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setTab("zeiten")} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, borderRadius: 14, cursor: "pointer", border: tab === "zeiten" ? "none" : "1px solid #ddd", background: tab === "zeiten" ? "#1a1a1a" : "#fff", color: tab === "zeiten" ? "#fff" : "#555" }}>Öffnungszeiten</button>
          <button onClick={() => setTab("kalender")} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, borderRadius: 14, cursor: "pointer", border: tab === "kalender" ? "none" : "1px solid #ddd", background: tab === "kalender" ? "#1a1a1a" : "#fff", color: tab === "kalender" ? "#fff" : "#555" }}>Kalender</button>
        </div>
        <button onClick={saveSettings} style={{ padding: "6px 16px", fontSize: 12, fontWeight: 500, background: saved ? "#22c55e" : "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", transition: "background 0.2s" }}>
          {saved ? "✓ Gespeichert" : "Speichern"}
        </button>
      </div>

      {/* TAB: Öffnungszeiten */}
      {tab === "zeiten" && (
        <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "12px 14px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>Wöchentliche Verfügbarkeit</h3>
            <div style={{ display: "grid", gap: 6 }}>
              {days.map((day) => {
                const daySlots = getSlotsForDay(day);
                const mainSlot = daySlots[0];
                const pauseSlot = daySlots[1];
                if (!mainSlot) return null;
                const anyActive = daySlots.some((s) => s.active);

                return (
                  <div key={day} style={{ padding: "8px 10px", borderRadius: 6, background: anyActive ? "#f0fdf4" : "#f9f9f9", border: `1px solid ${anyActive ? "#bbf7d0" : "#e5e5e5"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => {
                        // Toggle main slot, if deactivating, also deactivate pause
                        if (mainSlot.active) {
                          setSlots(slots.map((s) => s.day === day ? { ...s, active: false } : s));
                        } else {
                          toggleDay(day, 0);
                        }
                      }} style={{ width: 32, height: 18, borderRadius: 9, border: "none", background: mainSlot.active ? "#22c55e" : "#ddd", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                        <span style={{ position: "absolute", top: 2, left: mainSlot.active ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                      </button>
                      <span style={{ fontSize: 12, fontWeight: 500, width: 80, color: anyActive ? "#1a1a1a" : "#999", flexShrink: 0 }}>{WEEKDAY_NAMES[day]}</span>
                      {mainSlot.active ? (
                        <div className="admin-stack-mobile" style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                          <input type="time" value={mainSlot.start} onChange={(e) => updateSlot(day, 0, "start", e.target.value)} style={{ ...inputStyle, width: 90 }} />
                          <span style={{ color: "#999", fontSize: 11 }}>-</span>
                          <input type="time" value={mainSlot.end} onChange={(e) => updateSlot(day, 0, "end", e.target.value)} style={{ ...inputStyle, width: 90 }} />
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>Nicht verfügbar</span>
                      )}
                    </div>

                    {/* Pause / zweites Zeitfenster */}
                    {mainSlot.active && pauseSlot && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, paddingLeft: 40 }}>
                        {pauseSlot.active ? (
                          <>
                            <span style={{ fontSize: 11, color: "#888", width: 80, flexShrink: 0 }}>+ Nachmittag</span>
                            <div className="admin-stack-mobile" style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                              <input type="time" value={pauseSlot.start} onChange={(e) => updateSlot(day, 1, "start", e.target.value)} style={{ ...inputStyle, width: 90 }} />
                              <span style={{ color: "#999", fontSize: 11 }}>-</span>
                              <input type="time" value={pauseSlot.end} onChange={(e) => updateSlot(day, 1, "end", e.target.value)} style={{ ...inputStyle, width: 90 }} />
                              <button onClick={() => toggleDay(day, 1)} style={{ fontSize: 14, color: "#999", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                            </div>
                          </>
                        ) : (
                          <button onClick={() => toggleDay(day, 1)} style={{ fontSize: 11, color: "#c8553d", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}>+ Pause hinzufügen</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blockierte Zeiten Liste */}
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "12px 14px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>Blockierte Zeiten</h3>
            {blockedEntries.length === 0 ? (
              <p style={{ fontSize: 12, color: "#999" }}>Keine blockierten Zeiten. Wechseln Sie zum Kalender-Tab um Tage zu blockieren.</p>
            ) : (
              <div style={{ display: "grid", gap: 4 }}>
                {blockedEntries.sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#fef2f2", borderRadius: 5, border: "1px solid #fecaca" }}>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: "#ef4444" }}>
                        {new Date(b.date + "T00:00:00").toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "long" })}
                      </span>
                      {b.type === "hours" && <span style={{ color: "#888", marginLeft: 4 }}>{b.start_time} - {b.end_time}</span>}
                      {b.type === "day" && <span style={{ fontSize: 10, color: "#999", marginLeft: 4 }}>(ganztägig)</span>}
                      {b.reason && <span style={{ color: "#999", marginLeft: 6 }}>, {b.reason}</span>}
                    </div>
                    <button onClick={() => removeBlocked(b.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Kalender */}
      {tab === "kalender" && (
        <div>
          {/* Kalender Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 5, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>←</button>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{MONTHS[calMonth]} {calYear}</h3>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 5, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>→</button>
            <button onClick={() => { setCalMonth(new Date().getMonth()); setCalYear(new Date().getFullYear()); }} style={{ fontSize: 11, color: "#c8553d", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Heute</button>
          </div>

          {/* Kalender Grid */}
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderBottom: "1px solid #e5e5e5" }}>
              {WEEKDAYS_SHORT.map((d) => (
                <div key={d} style={{ padding: "6px 0", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
              {calDays.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} style={{ minHeight: 60, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }} />;

                const dateStr = getDateStr(day);
                const d = new Date(calYear, calMonth, day);
                const dayOfWeek = d.getDay();
                const isPast = dateStr < today;
                const slot = slots.find((s) => s.day === dayOfWeek);
                const isInactive = !slot?.active;
                const blocked = isDateBlocked(dateStr);
                const blockedHrs = getBlockedHours(dateStr);
                const isToday = dateStr === today;

                return (
                  <div
                    key={day}
                    onClick={() => { if (!isPast) setShowBlockModal(dateStr); }}
                    style={{
                      minHeight: 60,
                      padding: 4,
                      borderRight: "1px solid #f0f0f0",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: isPast ? "default" : "pointer",
                      background: blocked ? "#fef2f2" : isInactive ? "#f9f9f9" : "#fff",
                      opacity: isPast ? 0.4 : 1,
                      transition: "background 0.1s",
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: isToday ? 700 : 400,
                      background: isToday ? "#c8553d" : "transparent",
                      color: isToday ? "#fff" : blocked ? "#ef4444" : isInactive ? "#ccc" : "#1a1a1a",
                      marginBottom: 1,
                    }}>
                      {day}
                    </div>
                    {blocked && (
                      <div style={{ fontSize: 8, padding: "1px 3px", background: "#fecaca", color: "#ef4444", borderRadius: 2, fontWeight: 600 }}>
                        BLOCKIERT
                      </div>
                    )}
                    {blockedHrs.map((bh) => (
                      <div key={bh.id} style={{ fontSize: 8, padding: "1px 3px", background: "#fed7aa", color: "#ea580c", borderRadius: 2, fontWeight: 500, marginTop: 1 }}>
                        {bh.start_time}-{bh.end_time}
                      </div>
                    ))}
                    {isInactive && !blocked && (
                      <div style={{ fontSize: 8, color: "#ccc" }}>geschl.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legende */}
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "#888" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 2 }} /> Verfügbar</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: 2 }} /> Geschlossen</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2 }} /> Blockiert</div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="admin-modal" style={{ background: "#fff", borderRadius: 10, padding: 20, width: "100%", maxWidth: "min(400px, calc(100vw - 32px))" }}>
            {isDateBlocked(showBlockModal) ? (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px" }}>Tag entsperren</h3>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
                  {new Date(showBlockModal + "T00:00:00").toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { const b = isDateBlocked(showBlockModal); if (b) removeBlocked(b.id); setShowBlockModal(null); }} style={{ flex: 1, padding: 9, fontSize: 13, fontWeight: 500, background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Entsperren</button>
                  <button onClick={() => setShowBlockModal(null)} style={{ padding: "9px 16px", fontSize: 13, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}>Abbrechen</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>Tag blockieren</h3>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
                  {new Date(showBlockModal + "T00:00:00").toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>

                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <button onClick={() => setBlockType("day")} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 500, borderRadius: 14, cursor: "pointer", border: blockType === "day" ? "none" : "1px solid #ddd", background: blockType === "day" ? "#1a1a1a" : "#fff", color: blockType === "day" ? "#fff" : "#555" }}>Ganzer Tag</button>
                  <button onClick={() => setBlockType("hours")} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 500, borderRadius: 14, cursor: "pointer", border: blockType === "hours" ? "none" : "1px solid #ddd", background: blockType === "hours" ? "#1a1a1a" : "#fff", color: blockType === "hours" ? "#fff" : "#555" }}>Bestimmte Stunden</button>
                </div>

                {blockType === "hours" && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
                    <input type="time" value={blockStartTime} onChange={(e) => setBlockStartTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <span style={{ color: "#999", fontSize: 12 }}>bis</span>
                    <input type="time" value={blockEndTime} onChange={(e) => setBlockEndTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                )}

                <input type="text" placeholder="Grund (optional)" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: 10 }} />

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => addBlockedEntry(showBlockModal)} style={{ flex: 1, padding: 9, fontSize: 13, fontWeight: 500, background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Blockieren</button>
                  <button onClick={() => setShowBlockModal(null)} style={{ padding: "9px 16px", fontSize: 13, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}>Abbrechen</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
