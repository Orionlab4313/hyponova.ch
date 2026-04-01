"use client";

import { useEffect, useState } from "react";

interface Appointment {
  id: string;
  lead_id: string | null;
  title: string;
  description: string;
  date: string;
  time_start: string;
  time_end: string;
  status: string;
  created_at: string;
  leads?: { first_name: string; last_name: string; email: string; phone: string };
}

interface Lead { id: string; first_name: string; last_name: string; email: string; phone: string; }

const statusColors: Record<string, string> = {
  geplant: "#3b82f6", bestaetigt: "#22c55e", abgesagt: "#ef4444", abgeschlossen: "#888",
};
const statusLabels: Record<string, string> = {
  geplant: "Geplant", bestaetigt: "Bestätigt", abgesagt: "Abgesagt", abgeschlossen: "Abgeschlossen",
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const mondayFirst = firstDay === 0 ? 6 : firstDay - 1; // Convert Sun=0 to Mon-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < mondayFirst; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function KalenderPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ title: "", description: "", date: "", time_start: "09:00", time_end: "10:00", lead_id: "", status: "geplant" });

  const [syncing, setSyncing] = useState(false);
  const EDGE_FN = "https://dqryxcdwvuborlayjain.supabase.co/functions/v1/on-booking";

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [apptRes, leadRes] = await Promise.all([
      fetch("/api/admin/appointments"),
      fetch("/api/admin/leads"),
    ]);
    const apptData = await apptRes.json();
    const leadData = await leadRes.json();
    if (Array.isArray(apptData)) setAppointments(apptData);
    if (Array.isArray(leadData)) setLeads(leadData);
  }

  function formatDateDE(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  async function triggerIntegration(data: any) {
    setSyncing(true);
    try {
      await fetch(EDGE_FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {}
    setSyncing(false);
  }

  function getLeadForAppt(appt: Appointment): Lead | undefined {
    if (appt.leads) return appt.leads as unknown as Lead;
    if (appt.lead_id) return leads.find((l) => l.id === appt.lead_id);
    return undefined;
  }

  function openCreate(date?: string) {
    setEditingAppt(null);
    setForm({ title: "", description: "", date: date || selectedDate, time_start: "09:00", time_end: "10:00", lead_id: "", status: "geplant" });
    setShowForm(true);
  }

  function openEdit(appt: Appointment) {
    setEditingAppt(appt);
    setForm({
      title: appt.title, description: appt.description || "", date: appt.date,
      time_start: appt.time_start?.slice(0, 5) || "09:00", time_end: appt.time_end?.slice(0, 5) || "10:00",
      lead_id: appt.lead_id || "", status: appt.status,
    });
    setSelectedAppt(null);
    setShowForm(true);
  }

  async function saveAppointment(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, lead_id: form.lead_id || null };

    if (editingAppt) {
      const dateChanged = form.date !== editingAppt.date;
      const timeChanged = form.time_start !== editingAppt.time_start?.slice(0, 5) || form.time_end !== editingAppt.time_end?.slice(0, 5);
      const statusChanged = form.status !== editingAppt.status;

      const res = await fetch("/api/admin/appointments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingAppt.id, ...body }) });
      const updatedAppt = await res.json();
      const lead = getLeadForAppt(editingAppt);

      if (lead?.email && (dateChanged || timeChanged)) {
        await triggerIntegration({ action: "update", appointment: updatedAppt, lead, oldDate: editingAppt.date, oldTime: editingAppt.time_start?.slice(0, 5) });
      } else if (lead?.email && statusChanged && form.status === "abgesagt") {
        await triggerIntegration({ action: "delete", appointment: editingAppt, lead, reason: "Status auf Abgesagt geändert" });
      } else {
        await triggerIntegration({ action: "update", appointment: updatedAppt, lead });
      }
    } else {
      const res = await fetch("/api/admin/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const newAppt = await res.json();
      const lead = form.lead_id ? leads.find((l) => l.id === form.lead_id) : null;
      if (lead) await triggerIntegration({ action: "create", appointment: newAppt, lead });
    }

    setShowForm(false);
    setEditingAppt(null);
    fetchData();
  }

  async function deleteAppointment(appt: Appointment) {
    const reason = prompt("Grund für die Absage (wird dem Kunden mitgeteilt):");
    if (reason === null) return;
    const lead = getLeadForAppt(appt);
    await fetch("/api/admin/appointments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: appt.id }) });
    await triggerIntegration({ action: "delete", appointment: appt, lead, reason: reason || undefined });
    setSelectedAppt(null);
    fetchData();
  }

  // Calendar helpers
  const days = getCalendarDays(currentYear, currentMonth);
  const today = new Date().toISOString().split("T")[0];

  function getDateStr(day: number) {
    return `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  function getAppointmentsForDate(dateStr: string) {
    return appointments.filter((a) => a.date === dateStr && a.status !== "abgesagt");
  }

  function getAppointmentsForDay(day: number) {
    return getAppointmentsForDate(getDateStr(day));
  }

  const selectedDayAppointments = getAppointmentsForDate(selectedDate)
    .sort((a, b) => (a.time_start || "").localeCompare(b.time_start || ""));

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  }

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>←</button>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, textAlign: "center" }}>{MONTHS[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>→</button>
          <button onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); setSelectedDate(today); }} style={{ fontSize: 12, color: "#c8553d", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Heute</button>
        </div>
        <button onClick={() => openCreate()} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          + Termin
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "hidden", marginBottom: 24, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderBottom: "1px solid #e5e5e5" }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {days.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} style={{ minHeight: 60, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }} />;

            const dateStr = getDateStr(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dayAppts = getAppointmentsForDay(day);

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  minHeight: 60,
                  padding: 4,
                  borderRight: "1px solid #f0f0f0",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  background: isSelected ? "#f8f6f4" : "#fff",
                  transition: "background 0.1s",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: isToday ? 700 : 400,
                  background: isToday ? "#c8553d" : "transparent",
                  color: isToday ? "#fff" : isSelected ? "#c8553d" : "#1a1a1a",
                  marginBottom: 2,
                }}>
                  {day}
                </div>
                {dayAppts.slice(0, 2).map((appt) => (
                  <div
                    key={appt.id}
                    style={{
                      fontSize: 9,
                      padding: "1px 3px",
                      marginBottom: 1,
                      borderRadius: 2,
                      background: `${statusColors[appt.status] || "#888"}15`,
                      color: statusColors[appt.status] || "#888",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontWeight: 500,
                      borderLeft: `2px solid ${statusColors[appt.status] || "#888"}`,
                    }}
                  >
                    {appt.time_start?.slice(0, 5)}
                  </div>
                ))}
                {dayAppts.length > 2 && (
                  <div style={{ fontSize: 9, color: "#999" }}>+{dayAppts.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            {formatDateDE(selectedDate)}
          </h3>
          <button onClick={() => openCreate(selectedDate)} style={{ fontSize: 13, color: "#c8553d", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
            + Termin hinzufügen
          </button>
        </div>

        {selectedDayAppointments.length === 0 ? (
          <p style={{ fontSize: 13, color: "#999", margin: 0 }}>Keine Termine an diesem Tag</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {selectedDayAppointments.map((appt) => {
              const lead = getLeadForAppt(appt);
              const isExpanded = selectedAppt?.id === appt.id;

              return (
                <div key={appt.id}>
                  <div
                    onClick={() => setSelectedAppt(isExpanded ? null : appt)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", borderRadius: 10,
                      border: `1px solid ${isExpanded ? "#c8553d" : "#e5e5e5"}`,
                      background: isExpanded ? "#faf8f7" : "#fff",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 3, height: 36, borderRadius: 2, background: statusColors[appt.status] || "#888" }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{appt.title}</p>
                        <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
                          {appt.time_start?.slice(0, 5)} – {appt.time_end?.slice(0, 5)}
                          {lead && ` · ${lead.first_name} ${lead.last_name}`}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: `${statusColors[appt.status]}15`, color: statusColors[appt.status], fontWeight: 600 }}>
                      {statusLabels[appt.status] || appt.status}
                    </span>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div style={{ padding: "16px 16px 16px 34px", borderLeft: `3px solid ${statusColors[appt.status]}`, marginLeft: 16 }}>
                      {appt.description && (
                        <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Beschreibung</p>
                          <p style={{ fontSize: 13, margin: 0, whiteSpace: "pre-wrap", color: "#333" }}>{appt.description}</p>
                        </div>
                      )}

                      {lead && (
                        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                          <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kundendaten</p>
                          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>{lead.first_name} {lead.last_name}</p>
                          {lead.email && <p style={{ fontSize: 12, margin: "0 0 2px" }}><a href={`mailto:${lead.email}`} style={{ color: "#3b82f6", textDecoration: "none" }}>{lead.email}</a></p>}
                          {lead.phone && <p style={{ fontSize: 12, margin: 0 }}><a href={`tel:${lead.phone}`} style={{ color: "#3b82f6", textDecoration: "none" }}>{lead.phone}</a></p>}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(appt)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Bearbeiten</button>
                        {lead?.email && (
                          <a href={`https://ksuite.infomaniak.com/1745676/mail/?to=${encodeURIComponent(lead.email)}&subject=${encodeURIComponent(`Ihr Termin bei HYPONOVA - ${formatDateDE(appt.date)}`)}`} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", fontSize: 12, fontWeight: 500, background: "#f0f9ff", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: 6, textDecoration: "none" }}>E-Mail</a>
                        )}
                        <button onClick={() => deleteAppointment(appt)} style={{ padding: "8px 14px", fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer" }}>Löschen</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editingAppt ? "Termin bearbeiten" : "Neuer Termin"}</h3>
            <form onSubmit={saveAppointment}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Titel *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="z.B. Erstberatung Hypothek" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Kontakt</label>
                <select value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                  <option value="">– Kein Kontakt –</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
              </div>
              <div className="admin-grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Datum *</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Von *</label>
                  <input required type="time" value={form.time_start} onChange={(e) => setForm({ ...form, time_start: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Bis *</label>
                  <input required type="time" value={form.time_end} onChange={(e) => setForm({ ...form, time_end: e.target.value })} style={inputStyle} />
                </div>
              </div>
              {editingAppt && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                    <option value="geplant">Geplant</option>
                    <option value="bestaetigt">Bestätigt</option>
                    <option value="abgesagt">Abgesagt</option>
                    <option value="abgeschlossen">Abgeschlossen</option>
                  </select>
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Beschreibung / Notizen</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Details zum Termin..." />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>{editingAppt ? "Speichern" : "Erstellen"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingAppt(null); }} style={{ padding: "12px 20px", fontSize: 14, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
