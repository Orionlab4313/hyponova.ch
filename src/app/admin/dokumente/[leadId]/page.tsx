"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

const ACCENT = "#c8553d";

interface Doc {
  id: string;
  category: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: "received" | "reviewing" | "accepted" | "rejected";
  uploaded_via: string;
  uploaded_at: string;
}

interface Submission {
  id: string;
  type: "abloesung" | "neukauf";
  answers: any;
  status: string;
  end_path: string | null;
  lang: string;
  created_at: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string | null;
  source: string | null;
  notes: string | null;
}

function fmtBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_LABELS: Record<Doc["status"], { label: string; color: string; bg: string }> = {
  received: { label: "Eingegangen", color: "#0369a1", bg: "#dbeafe" },
  reviewing: { label: "In Prüfung", color: "#92400e", bg: "#fef3c7" },
  accepted: { label: "Akzeptiert", color: "#166534", bg: "#dcfce7" },
  rejected: { label: "Abgelehnt", color: "#991b1b", bg: "#fee2e2" },
};

export default function LeadDocumentsPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch(`/api/admin/documents?leadId=${leadId}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data.lead);
        setDocs(data.documents || []);
        setSubmissions(data.submissions || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [leadId]);

  async function download(docId: string) {
    const res = await fetch(`/api/admin/documents/${docId}?download=1`);
    if (!res.ok) { alert("Download-Fehler"); return; }
    const j = await res.json();
    window.open(j.url, "_blank");
  }

  async function setStatus(docId: string, status: Doc["status"]) {
    const res = await fetch(`/api/admin/documents/${docId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }

  async function deleteDoc(docId: string) {
    if (!confirm("Wirklich löschen?")) return;
    const res = await fetch(`/api/admin/documents/${docId}`, { method: "DELETE" });
    if (res.ok) setDocs((p) => p.filter((d) => d.id !== docId));
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Laden…</div>;
  if (!lead) return <div style={{ padding: 40, textAlign: "center", color: "#c00" }}>Kontakt nicht gefunden</div>;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Link href="/admin/dokumente" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>← Zurück zur Übersicht</Link>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{lead.first_name} {lead.last_name}</h1>
        <div style={{ fontSize: 13, color: "#666" }}>
          <a href={`mailto:${lead.email}`} style={{ color: "#666" }}>{lead.email}</a>
          {lead.phone && <> · <a href={`tel:${lead.phone}`} style={{ color: "#666" }}>{lead.phone}</a></>}
          {lead.source && <> · Quelle: {lead.source}</>}
        </div>
      </div>

      {submissions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#444" }}>Fragebogen-Antworten</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {submissions.map((s) => (
              <details key={s.id} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 14px" }}>
                <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  {s.type === "abloesung" ? "Ablösung" : "Neukauf"} · {fmtDate(s.created_at)} · {s.end_path === "termin" ? "Termin gewünscht" : "Offerten"} · {s.lang.toUpperCase()}
                </summary>
                <pre style={{ marginTop: 10, padding: 10, background: "#fafafa", borderRadius: 4, fontSize: 11, overflow: "auto", lineHeight: 1.5 }}>{JSON.stringify(s.answers, null, 2)}</pre>
              </details>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#444" }}>Dokumente ({docs.length})</h2>
      </div>

      {docs.length === 0 ? (
        <div style={{ padding: 30, textAlign: "center", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, color: "#888", fontSize: 13 }}>Noch keine Dokumente hochgeladen</div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {docs.map((d) => {
            const st = STATUS_LABELS[d.status];
            return (
              <div key={d.id} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {d.file_name}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {d.category && <span>Kategorie: {d.category}</span>}
                    <span>{fmtBytes(d.file_size)}</span>
                    <span>{fmtDate(d.uploaded_at)}</span>
                    <span>via {d.uploaded_via === "customer" ? "Kunde" : "Admin"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <select value={d.status} onChange={(e) => setStatus(d.id, e.target.value as Doc["status"])}
                    style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
                    <option value="received">Eingegangen</option>
                    <option value="reviewing">In Prüfung</option>
                    <option value="accepted">Akzeptiert</option>
                    <option value="rejected">Abgelehnt</option>
                  </select>
                  <button type="button" onClick={() => download(d.id)} style={{ padding: "5px 10px", background: ACCENT, color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Download</button>
                  <button type="button" onClick={() => deleteDoc(d.id)} style={{ padding: 5, background: "transparent", color: "#c00", border: "none", fontSize: 14, cursor: "pointer" }} title="Löschen">×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
