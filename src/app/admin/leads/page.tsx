"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
}

const statuses = ["neu", "kontaktiert", "beratung", "offerte", "abgeschlossen", "verloren"];
const statusColors: Record<string, string> = {
  neu: "#3b82f6", kontaktiert: "#f59e0b", beratung: "#8b5cf6",
  offerte: "#f97316", abgeschlossen: "#22c55e", verloren: "#ef4444",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("alle");
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", status: "neu", source: "website", notes: "" });

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    if (Array.isArray(data)) setLeads(data);
  }

  async function saveLead(e: React.FormEvent) {
    e.preventDefault();
    if (editLead) {
      await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editLead.id, ...form }) });
    } else {
      await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    setEditLead(null);
    setForm({ first_name: "", last_name: "", email: "", phone: "", status: "neu", source: "website", notes: "" });
    fetchLeads();
  }

  async function deleteLead(id: string) {
    if (!confirm("Kontakt wirklich löschen?")) return;
    await fetch("/api/admin/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchLeads();
  }

  function openEdit(lead: Lead) {
    setEditLead(lead);
    setForm({ first_name: lead.first_name, last_name: lead.last_name, email: lead.email || "", phone: lead.phone || "", status: lead.status, source: lead.source || "website", notes: lead.notes || "" });
    setShowForm(true);
  }

  const filtered = filter === "alle" ? leads : leads.filter((l) => l.status === filter);

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["alle", ...statuses].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500, borderRadius: 20, cursor: "pointer",
                border: filter === s ? "none" : "1px solid #ddd",
                background: filter === s ? "#1a1a1a" : "#fff",
                color: filter === s ? "#fff" : "#555",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} {s !== "alle" && `(${leads.filter((l) => l.status === s).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(true); setEditLead(null); setForm({ first_name: "", last_name: "", email: "", phone: "", status: "neu", source: "website", notes: "" }); }}
          style={{ padding: "10px 20px", fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          + Neuer Kontakt
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editLead ? "Kontakt bearbeiten" : "Neuer Kontakt"}</h3>
            <form onSubmit={saveLead}>
              <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Vorname *</label>
                  <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Nachname *</label>
                  <input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>E-Mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Telefon</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                    {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Quelle</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                    <option value="website">Website</option>
                    <option value="telefon">Telefon</option>
                    <option value="empfehlung">Empfehlung</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Notizen</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  {editLead ? "Speichern" : "Erstellen"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditLead(null); }} style={{ padding: "12px 20px", fontSize: 14, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              {["Name", "E-Mail", "Telefon", "Status", "Quelle", "Erstellt", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#888", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#999", fontSize: 14 }}>Keine Kontakte gefunden</td></tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>{lead.first_name} {lead.last_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{lead.email || "–"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{lead.phone || "–"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: `${statusColors[lead.status]}15`, color: statusColors[lead.status], fontWeight: 600 }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{lead.source}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#999" }}>{new Date(lead.created_at).toLocaleDateString("de-CH")}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(lead)} style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Bearbeiten</button>
                      <button onClick={() => deleteLead(lead.id)} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Löschen</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
