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
  leads?: { first_name: string; last_name: string };
}

interface Lead { id: string; first_name: string; last_name: string; }

const statusColors: Record<string, string> = {
  geplant: "#3b82f6", bestaetigt: "#22c55e", abgesagt: "#ef4444", abgeschlossen: "#888",
};

export default function KalenderPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time_start: "09:00", time_end: "10:00", lead_id: "", status: "geplant" });

  useEffect(() => {
    fetch("/api/admin/appointments").then((r) => r.json()).then((d) => Array.isArray(d) && setAppointments(d));
    fetch("/api/admin/leads").then((r) => r.json()).then((d) => Array.isArray(d) && setLeads(d));
  }, []);

  async function saveAppointment(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, lead_id: form.lead_id || null };
    await fetch("/api/admin/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false);
    setForm({ title: "", description: "", date: "", time_start: "09:00", time_end: "10:00", lead_id: "", status: "geplant" });
    const res = await fetch("/api/admin/appointments");
    setAppointments(await res.json());
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/appointments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const res = await fetch("/api/admin/appointments");
    setAppointments(await res.json());
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Termin löschen?")) return;
    await fetch("/api/admin/appointments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const res = await fetch("/api/admin/appointments");
    setAppointments(await res.json());
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = appointments.filter((a) => a.date < today);

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{upcoming.length} bevorstehende Termine</p>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          + Neuer Termin
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 460 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Neuer Termin</h3>
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
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Beschreibung</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Erstellen</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "12px 20px", fontSize: 14, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Bevorstehend</h3>
      <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
        {upcoming.length === 0 ? (
          <p style={{ fontSize: 13, color: "#999", background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e5e5e5" }}>Keine bevorstehenden Termine</p>
        ) : upcoming.map((appt) => (
          <div key={appt.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 12px", minWidth: 50 }}>
                <p style={{ fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1 }}>{new Date(appt.date + "T00:00:00").getDate()}</p>
                <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{new Date(appt.date + "T00:00:00").toLocaleDateString("de-CH", { month: "short" })}</p>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{appt.title}</p>
                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
                  {appt.time_start?.slice(0, 5)} – {appt.time_end?.slice(0, 5)}
                  {appt.leads && ` · ${appt.leads.first_name} ${appt.leads.last_name}`}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={appt.status}
                onChange={(e) => updateStatus(appt.id, e.target.value)}
                style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #ddd", borderRadius: 6, color: statusColors[appt.status], background: "#fff" }}
              >
                <option value="geplant">Geplant</option>
                <option value="bestaetigt">Bestätigt</option>
                <option value="abgesagt">Abgesagt</option>
                <option value="abgeschlossen">Abgeschlossen</option>
              </select>
              <button onClick={() => deleteAppointment(appt.id)} style={{ fontSize: 16, color: "#ccc", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#888" }}>Vergangene Termine</h3>
          <div style={{ display: "grid", gap: 8, opacity: 0.6 }}>
            {past.map((appt) => (
              <div key={appt.id} style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 13, margin: 0 }}>{appt.title} — {new Date(appt.date + "T00:00:00").toLocaleDateString("de-CH")}</p>
                <span style={{ fontSize: 11, color: statusColors[appt.status] }}>{appt.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
