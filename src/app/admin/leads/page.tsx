"use client";

import { useEffect, useState } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    if (Array.isArray(data)) setLeads(data);
  }

  async function saveLead(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      let res: Response;
      if (editLead) {
        res = await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editLead.id, ...form }) });
      } else {
        res = await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }

      if (res.status === 409) {
        toast({ type: "error", message: "Kontakt mit identischen Angaben existiert bereits." });
        return;
      }
      if (!res.ok) {
        toast({ type: "error", message: "Speichern fehlgeschlagen." });
        return;
      }

      toast({ type: "success", message: editLead ? "Kontakt gespeichert." : "Kontakt erstellt." });
      setShowForm(false);
      setEditLead(null);
      setForm({ first_name: "", last_name: "", email: "", phone: "", status: "neu", source: "website", notes: "" });
      fetchLeads();
    } finally {
      setBusy(false);
    }
  }

  async function deleteLead(id: string) {
    const lead = leads.find((l) => l.id === id);
    const ok = await confirm({
      title: "Kontakt endgültig löschen?",
      body: lead
        ? `«${lead.first_name} ${lead.last_name}» wird mit allen zugehörigen Dokumenten, Fragebogen-Antworten, Notizen und Aufgaben gelöscht. Das kann nicht rückgängig gemacht werden.`
        : "Alle zugehörigen Daten werden mitgelöscht. Das kann nicht rückgängig gemacht werden.",
      confirmLabel: "Endgültig löschen",
      cancelLabel: "Abbrechen",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch("/api/admin/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) {
      toast({ type: "success", message: "Kontakt gelöscht." });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchLeads();
    } else {
      toast({ type: "error", message: "Löschen fehlgeschlagen." });
    }
  }

  async function deleteSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    const ok = await confirm({
      title: `${ids.length} Kontakte endgültig löschen?`,
      body: `Alle ausgewählten Kontakte werden mit ihren Dokumenten, Fragebogen-Antworten, Notizen und Aufgaben gelöscht. Das kann nicht rückgängig gemacht werden.`,
      confirmLabel: `${ids.length} löschen`,
      cancelLabel: "Abbrechen",
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        toast({ type: "success", message: `${json.deletedCount ?? ids.length} Kontakte gelöscht.` });
        setSelected(new Set());
        fetchLeads();
      } else {
        toast({ type: "error", message: "Löschen fehlgeschlagen." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function dedupe() {
    setBusy(true);
    try {
      const previewRes = await fetch("/api/admin/leads/dedupe");
      if (!previewRes.ok) {
        toast({ type: "error", message: "Duplikat-Prüfung fehlgeschlagen." });
        return;
      }
      const preview = await previewRes.json();
      const removeCount: number = preview.removeCount || 0;
      const groupCount: number = preview.groupCount || 0;

      if (removeCount === 0) {
        toast({ type: "info", message: "Keine Duplikate gefunden." });
        return;
      }

      const ok = await confirm({
        title: "Duplikate bereinigen?",
        body: `${removeCount} doppelte Kontakte in ${groupCount} Gruppen gefunden. Der jeweils älteste Eintrag bleibt erhalten, die neueren werden mit allen zugehörigen Dokumenten und Daten gelöscht. Das kann nicht rückgängig gemacht werden.`,
        confirmLabel: `${removeCount} löschen`,
        cancelLabel: "Abbrechen",
        danger: true,
      });
      if (!ok) return;

      const res = await fetch("/api/admin/leads/dedupe", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        toast({ type: "success", message: `${json.deletedCount} Duplikate gelöscht.` });
        setSelected(new Set());
        fetchLeads();
      } else {
        toast({ type: "error", message: "Bereinigung fehlgeschlagen." });
      }
    } finally {
      setBusy(false);
    }
  }

  function openEdit(lead: Lead) {
    setEditLead(lead);
    setForm({ first_name: lead.first_name, last_name: lead.last_name, email: lead.email || "", phone: lead.phone || "", status: lead.status, source: lead.source || "website", notes: lead.notes || "" });
    setShowForm(true);
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    const visibleIds = filtered.map((l) => l.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  const filtered = filter === "alle" ? leads : leads.filter((l) => l.status === filter);
  const visibleSelectedCount = filtered.filter((l) => selected.has(l.id)).length;
  const allVisibleSelected = filtered.length > 0 && visibleSelectedCount === filtered.length;

  const inputStyle = { width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      {/* Header */}
      <div className="admin-stack-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["alle", ...statuses].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 500, borderRadius: 14, cursor: "pointer",
                border: filter === s ? "none" : "1px solid #ddd",
                background: filter === s ? "#1a1a1a" : "#fff",
                color: filter === s ? "#fff" : "#555",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} {s !== "alle" && `(${leads.filter((l) => l.status === s).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={dedupe}
            disabled={busy}
            title="Findet Kontakte mit identischem Vorname, Nachname, E-Mail und Telefon und löscht die neueren Duplikate."
            style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 6, cursor: busy ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: busy ? 0.6 : 1 }}
          >
            Duplikate bereinigen
          </button>
          <button
            onClick={() => { setShowForm(true); setEditLead(null); setForm({ first_name: "", last_name: "", email: "", phone: "", status: "neu", source: "website", notes: "" }); }}
            style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            + Neuer Kontakt
          </button>
        </div>
      </div>

      {/* Batch-Action-Bar */}
      {selected.size > 0 && (
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            padding: "8px 14px", marginBottom: 10,
            background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 12, color: "#9a3412", fontWeight: 500 }}>
            {selected.size} ausgewählt
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setSelected(new Set())}
              style={{ padding: "5px 12px", fontSize: 12, background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}
            >
              Auswahl aufheben
            </button>
            <button
              onClick={deleteSelected}
              disabled={busy}
              style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
            >
              {selected.size} löschen
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="admin-modal" style={{ background: "#fff", borderRadius: 10, padding: 20, width: "100%", maxWidth: "min(500px, calc(100vw - 32px))", maxHeight: "90vh", overflow: "auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, marginTop: 0 }}>{editLead ? "Kontakt bearbeiten" : "Neuer Kontakt"}</h3>
            <form onSubmit={saveLead}>
              <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Vorname *</label>
                  <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Nachname *</label>
                  <input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>E-Mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Telefon</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                    {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Quelle</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ ...inputStyle, background: "#fff" }}>
                    <option value="website">Website</option>
                    <option value="telefon">Telefon</option>
                    <option value="empfehlung">Empfehlung</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Notizen</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={busy} style={{ flex: 1, padding: 9, fontSize: 13, fontWeight: 500, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}>
                  {editLead ? "Speichern" : "Erstellen"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditLead(null); }} style={{ padding: "9px 16px", fontSize: 13, background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads List */}
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        {filtered.length > 0 && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", cursor: "pointer", fontSize: 11, color: "#666" }}>
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
              style={{ cursor: "pointer", margin: 0 }}
            />
            Alle auswählen ({filtered.length})
          </label>
        )}
        {filtered.length === 0 ? (
          <p style={{ padding: 20, textAlign: "center", color: "#999", fontSize: 13, margin: 0 }}>Keine Kontakte gefunden</p>
        ) : (
          filtered.map((lead) => {
            const isSel = selected.has(lead.id);
            return (
              <div key={lead.id} style={{ display: "flex", alignItems: "flex-start", padding: "10px 14px", borderBottom: "1px solid #f0f0f0", gap: 10, background: isSel ? "#fff7ed" : "transparent" }}>
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleOne(lead.id)}
                  style={{ marginTop: 4, cursor: "pointer", flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{lead.first_name} {lead.last_name}</span>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: `${statusColors[lead.status]}15`, color: statusColors[lead.status], fontWeight: 600 }}>
                      {lead.status}
                    </span>
                  </div>
                  {lead.email && <p style={{ fontSize: 11, color: "#888", margin: "1px 0 0" }}>{lead.email}</p>}
                  {lead.phone && <p style={{ fontSize: 11, color: "#888", margin: "1px 0 0" }}>{lead.phone}</p>}
                  {lead.source && <p style={{ fontSize: 10, color: "#aaa", margin: "1px 0 0" }}>{lead.source}</p>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 2 }}>
                  <button onClick={() => openEdit(lead)} style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Bearbeiten</button>
                  <button onClick={() => deleteLead(lead.id)} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Löschen</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
