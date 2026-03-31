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

export default function KalenderPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time_start: "09:00", time_end: "10:00", lead_id: "", status: "geplant" });

  useEffect(() => {
    fetchData();
  }, []);

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

  function openCreate() {
    setEditingAppt(null);
    setForm({ title: "", description: "", date: "", time_start: "09:00", time_end: "10:00", lead_id: "", status: "geplant" });
    setShowForm(true);
  }

  function openEdit(appt: Appointment) {
    setEditingAppt(appt);
    setForm({
      title: appt.title,
      description: appt.description || "",
      date: appt.date,
      time_start: appt.time_start?.slice(0, 5) || "09:00",
      time_end: appt.time_end?.slice(0, 5) || "10:00",
      lead_id: appt.lead_id || "",
      status: appt.status,
    });
    setSelectedAppt(null);
    setShowForm(true);
  }

  const INFOMANIAK_MAIL = "https://ksuite.infomaniak.com/1745676/mail";

  function openInfomaniakCompose(to: string, subject: string, body: string) {
    const url = `${INFOMANIAK_MAIL}/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  }

  function formatDateDE(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  async function saveAppointment(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, lead_id: form.lead_id || null };

    if (editingAppt) {
      // Check if date or time changed
      const dateChanged = form.date !== editingAppt.date;
      const timeChanged = form.time_start !== editingAppt.time_start?.slice(0, 5) || form.time_end !== editingAppt.time_end?.slice(0, 5);
      const statusChanged = form.status !== editingAppt.status;

      await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAppt.id, ...body }),
      });

      // If date/time changed or status changed to abgesagt, open email compose
      const lead = getLeadForAppt(editingAppt);
      if (lead?.email && (dateChanged || timeChanged)) {
        const subject = `Terminverschiebung — HYPONOVA`;
        const emailBody = `Guten Tag ${lead.first_name} ${lead.last_name},\n\nIhr Termin bei HYPONOVA wurde verschoben.\n\nNeuer Termin:\nDatum: ${formatDateDE(form.date)}\nUhrzeit: ${form.time_start} – ${form.time_end} Uhr\n\nBei Fragen stehen wir Ihnen gerne zur Verfügung.\n\nFreundliche Grüsse\nSimon Topalli\nHYPONOVA GmbH\n+41 79 249 70 90`;
        openInfomaniakCompose(lead.email, subject, emailBody);
      } else if (lead?.email && statusChanged && form.status === "abgesagt") {
        const subject = `Terminabsage — HYPONOVA`;
        const emailBody = `Guten Tag ${lead.first_name} ${lead.last_name},\n\nLeider müssen wir Ihren Termin am ${formatDateDE(editingAppt.date)} um ${editingAppt.time_start?.slice(0, 5)} Uhr absagen.\n\nGrund: \n\nWir werden uns bei Ihnen melden, um einen neuen Termin zu vereinbaren.\n\nFreundliche Grüsse\nSimon Topalli\nHYPONOVA GmbH\n+41 79 249 70 90`;
        openInfomaniakCompose(lead.email, subject, emailBody);
      }
    } else {
      await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setShowForm(false);
    setEditingAppt(null);
    fetchData();
  }

  async function deleteAppointment(appt: Appointment) {
    if (!confirm("Termin löschen und Absage-E-Mail vorbereiten?")) return;

    const lead = getLeadForAppt(appt);

    await fetch("/api/admin/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appt.id }),
    });

    // Open Infomaniak with cancellation email
    if (lead?.email) {
      const subject = `Terminabsage — HYPONOVA`;
      const emailBody = `Guten Tag ${lead.first_name} ${lead.last_name},\n\nLeider müssen wir Ihren Termin am ${formatDateDE(appt.date)} um ${appt.time_start?.slice(0, 5)} Uhr absagen.\n\nWir bitten um Ihr Verständnis und werden uns bei Ihnen melden, um einen neuen Termin zu vereinbaren.\n\nFreundliche Grüsse\nSimon Topalli\nHYPONOVA GmbH\n+41 79 249 70 90`;
      openInfomaniakCompose(lead.email, subject, emailBody);
    }

    setSelectedAppt(null);
    fetchData();
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = appointments.filter((a) => a.date < today);

  // Find lead details for selected appointment
  function getLeadForAppt(appt: Appointment): Lead | undefined {
    if (appt.leads) return appt.leads as unknown as Lead;
    if (appt.lead_id) return leads.find((l) => l.id === appt.lead_id);
    return undefined;
  }

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{upcoming.length} bevorstehende Termine</p>
        <button
          onClick={openCreate}
          style={{ padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          + Neuer Termin
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              {editingAppt ? "Termin bearbeiten" : "Neuer Termin"}
            </h3>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
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
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Details zum Termin, Notizen zur Vorbereitung..." />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  {editingAppt ? "Speichern" : "Erstellen"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingAppt(null); }} style={{ padding: "12px 20px", fontSize: 14, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAppt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>{selectedAppt.title}</h3>
                <span style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 12,
                  background: `${statusColors[selectedAppt.status]}15`,
                  color: statusColors[selectedAppt.status],
                  fontWeight: 600,
                }}>
                  {statusLabels[selectedAppt.status] || selectedAppt.status}
                </span>
              </div>
              <button onClick={() => setSelectedAppt(null)} style={{ background: "none", border: "none", fontSize: 22, color: "#999", cursor: "pointer" }}>×</button>
            </div>

            {/* Date & Time */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span style={{ fontSize: 14 }}>
                  {new Date(selectedAppt.date + "T00:00:00").toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 14 }}>{selectedAppt.time_start?.slice(0, 5)} – {selectedAppt.time_end?.slice(0, 5)}</span>
              </div>
            </div>

            {/* Description */}
            {selectedAppt.description && (
              <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Beschreibung</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", color: "#333" }}>{selectedAppt.description}</p>
              </div>
            )}

            {/* Customer Data */}
            {(() => {
              const lead = getLeadForAppt(selectedAppt);
              if (!lead) return null;
              return (
                <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Kundendaten</p>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{lead.first_name} {lead.last_name}</span>
                    </div>
                    {lead.email && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${lead.email}`} style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>{lead.email}</a>
                      </div>
                    )}
                    {lead.phone && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="#888" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${lead.phone}`} style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>{lead.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => openEdit(selectedAppt)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, fontSize: 13, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Bearbeiten
              </button>
              {(() => {
                const lead = getLeadForAppt(selectedAppt);
                if (lead?.email) {
                  return (
                    <button
                      onClick={() => {
                        const subject = `Ihr Termin bei HYPONOVA — ${formatDateDE(selectedAppt.date)}`;
                        const body = `Guten Tag ${lead.first_name} ${lead.last_name},\n\n\n\nFreundliche Grüsse\nSimon Topalli\nHYPONOVA GmbH\n+41 79 249 70 90`;
                        openInfomaniakCompose(lead.email, subject, body);
                      }}
                      style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, background: "#f0f9ff", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                      </svg>
                      E-Mail
                    </button>
                  );
                }
                return null;
              })()}
              <button
                onClick={() => deleteAppointment(selectedAppt)}
                style={{ padding: "12px 16px", fontSize: 13, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer" }}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Bevorstehend</h3>
      <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
        {upcoming.length === 0 ? (
          <p style={{ fontSize: 13, color: "#999", background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e5e5e5" }}>Keine bevorstehenden Termine</p>
        ) : upcoming.map((appt) => {
          const lead = getLeadForAppt(appt);
          return (
            <div
              key={appt.id}
              onClick={() => setSelectedAppt(appt)}
              style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "box-shadow 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ textAlign: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 12px", minWidth: 50 }}>
                  <p style={{ fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1 }}>{new Date(appt.date + "T00:00:00").getDate()}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{new Date(appt.date + "T00:00:00").toLocaleDateString("de-CH", { month: "short" })}</p>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{appt.title}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
                    {appt.time_start?.slice(0, 5)} – {appt.time_end?.slice(0, 5)}
                    {lead && ` · ${lead.first_name} ${lead.last_name}`}
                  </p>
                  {lead?.email && (
                    <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{lead.email}{lead.phone ? ` · ${lead.phone}` : ""}</p>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 12,
                background: `${statusColors[appt.status]}15`,
                color: statusColors[appt.status],
                fontWeight: 600,
              }}>
                {statusLabels[appt.status] || appt.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#888" }}>Vergangene Termine</h3>
          <div style={{ display: "grid", gap: 8, opacity: 0.6 }}>
            {past.map((appt) => (
              <div
                key={appt.id}
                onClick={() => setSelectedAppt(appt)}
                style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <p style={{ fontSize: 13, margin: 0 }}>{appt.title} — {new Date(appt.date + "T00:00:00").toLocaleDateString("de-CH")}</p>
                <span style={{ fontSize: 11, color: statusColors[appt.status] }}>{statusLabels[appt.status] || appt.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
