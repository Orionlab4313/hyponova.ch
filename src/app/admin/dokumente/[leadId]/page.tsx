"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatSubmissionAnswers, formatEndPath, formatSource, formatCategory, formatUploadedVia, type SubmissionType } from "@/lib/submissions";

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

function FragebogenRow({ row }: { row: { label: string; value: string; multi?: string[] } }) {
  return (
    <>
      <dt style={{ color: "#666", fontWeight: 500, lineHeight: 1.5 }}>{row.label}</dt>
      <dd style={{ margin: 0, color: "#1a1a1a", fontWeight: 500, lineHeight: 1.5 }}>
        {row.value}
        {row.multi && row.multi.length > 0 && (
          <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18, color: "#444", fontWeight: 400 }}>
            {row.multi.map((line, i) => (
              <li key={i} style={{ marginBottom: 3 }}>{line}</li>
            ))}
          </ul>
        )}
      </dd>
    </>
  );
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

  // Pending Status-Aenderungen pro Doc-ID — nur gespeichert wenn User auf Speichern klickt
  const [pendingStatus, setPendingStatus] = useState<Record<string, Doc["status"]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Viewer-Modal
  const [viewerDoc, setViewerDoc] = useState<Doc | null>(null);

  function load() {
    fetch(`/api/admin/documents?leadId=${leadId}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data.lead);
        setDocs(data.documents || []);
        setSubmissions(data.submissions || []);
        setPendingStatus({}); // Reset pending nach Reload
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [leadId]);

  async function downloadDoc(docId: string) {
    const res = await fetch(`/api/admin/documents/${docId}?download=1`);
    if (!res.ok) { alert("Download-Fehler"); return; }
    const j = await res.json();
    window.open(j.url, "_blank");
  }

  async function saveStatus(docId: string) {
    const newStatus = pendingStatus[docId];
    if (!newStatus) return;
    setSavingId(docId);
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Update local doc state + clear pending
        setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, status: newStatus } : d));
        setPendingStatus((prev) => {
          const next = { ...prev };
          delete next[docId];
          return next;
        });
      } else {
        alert("Speichern fehlgeschlagen");
      }
    } finally {
      setSavingId(null);
    }
  }

  function discardStatus(docId: string) {
    setPendingStatus((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
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

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: 18, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{lead.first_name} {lead.last_name}</h1>
        <div style={{ fontSize: 13, color: "#666" }}>
          <a href={`mailto:${lead.email}`} style={{ color: "#666" }}>{lead.email}</a>
          {lead.phone && <> · <a href={`tel:${lead.phone}`} style={{ color: "#666" }}>{lead.phone}</a></>}
          {lead.source && <> · Quelle: {formatSource(lead.source)}</>}
        </div>
      </div>

      {submissions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#444" }}>Fragebogen-Antworten</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {submissions.map((s) => {
              const formatted = formatSubmissionAnswers(s.type as SubmissionType, s.answers);
              return (
                <details key={s.id} open style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "12px 16px" }}>
                  <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1a1a1a", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span>
                      {s.type === "abloesung" ? "Ablösung" : "Neukauf"}
                      <span style={{ marginLeft: 8, fontWeight: 400, color: "#888" }}>
                        · {fmtDate(s.created_at)} · {formatEndPath(s.end_path)} · {s.lang.toUpperCase()}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, color: "#999" }}>▼ Details</span>
                  </summary>
                  <dl style={{ marginTop: 14, marginBottom: 0, display: "grid", gridTemplateColumns: "minmax(140px, 200px) 1fr", gap: "8px 16px", fontSize: 13 }}>
                    {formatted.map((row, i) => (
                      <FragebogenRow key={i} row={row} />
                    ))}
                  </dl>
                </details>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#444" }}>Dokumente ({docs.length})</h2>
      </div>

      {docs.length === 0 ? (
        <div style={{ padding: 30, textAlign: "center", background: "#fff", border: "1px solid #e5e5e5", color: "#888", fontSize: 13 }}>Noch keine Dokumente hochgeladen</div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {docs.map((d) => {
            const currentStatus = pendingStatus[d.id] ?? d.status;
            const hasPending = pendingStatus[d.id] !== undefined && pendingStatus[d.id] !== d.status;
            const st = STATUS_LABELS[currentStatus];
            return (
              <div key={d.id} style={{ background: "#fff", border: hasPending ? `1px solid ${ACCENT}` : "1px solid #e5e5e5", padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", transition: "border-color 0.15s" }}>
                <button
                  type="button"
                  onClick={() => setViewerDoc(d)}
                  style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    📄 <span style={{ borderBottom: `1px dashed ${ACCENT}80`, color: ACCENT }}>{d.file_name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {d.category && <span>Kategorie: {formatCategory(d.category)}</span>}
                    <span>{fmtBytes(d.file_size)}</span>
                    <span>{fmtDate(d.uploaded_at)}</span>
                    <span>von {formatUploadedVia(d.uploaded_via)}</span>
                  </div>
                </button>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                  <select
                    value={currentStatus}
                    onChange={(e) => setPendingStatus((prev) => ({ ...prev, [d.id]: e.target.value as Doc["status"] }))}
                    disabled={savingId === d.id}
                    style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, border: hasPending ? `1px solid ${ACCENT}` : "1px solid transparent", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <option value="received">Eingegangen</option>
                    <option value="reviewing">In Prüfung</option>
                    <option value="accepted">Akzeptiert</option>
                    <option value="rejected">Abgelehnt</option>
                  </select>
                  {hasPending && (
                    <>
                      <button type="button" onClick={() => saveStatus(d.id)} disabled={savingId === d.id}
                        style={{ padding: "5px 12px", background: ACCENT, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: savingId === d.id ? "wait" : "pointer", fontFamily: "inherit", opacity: savingId === d.id ? 0.6 : 1 }}>
                        {savingId === d.id ? "Speichert…" : "Speichern"}
                      </button>
                      <button type="button" onClick={() => discardStatus(d.id)} disabled={savingId === d.id}
                        style={{ padding: "5px 8px", background: "transparent", color: "#666", border: "1px solid #ddd", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                        Verwerfen
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => downloadDoc(d.id)} style={{ padding: "5px 10px", background: "#fff", color: "#333", border: "1px solid #ddd", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>↓ Download</button>
                  <button type="button" onClick={() => deleteDoc(d.id)} style={{ padding: "5px 8px", background: "transparent", color: "#c00", border: "none", fontSize: 14, cursor: "pointer" }} title="Löschen">×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File-Viewer Modal */}
      {viewerDoc && <FileViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} onDownload={() => downloadDoc(viewerDoc.id)} />}
    </div>
  );
}

function FileViewerModal({ doc, onClose, onDownload }: { doc: Doc; onClose: () => void; onDownload: () => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/documents/${doc.id}?download=1`);
        if (cancelled) return;
        if (!res.ok) { setError("Datei konnte nicht geladen werden"); return; }
        const j = await res.json();
        setSignedUrl(j.url);
      } catch {
        if (!cancelled) setError("Netzwerkfehler beim Laden der Datei");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [doc.id]);

  // ESC-Key zum Schliessen
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isPdf = doc.mime_type === "application/pdf" || doc.file_name.toLowerCase().endsWith(".pdf");
  const isImage = doc.mime_type?.startsWith("image/") || /\.(jpe?g|png|gif|webp)$/i.test(doc.file_name);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(10,10,10,0.85)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", width: "100%", maxWidth: 1100, maxHeight: "92vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {doc.file_name}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {doc.category && <span>Kategorie: {formatCategory(doc.category)}</span>}
              <span>{fmtBytes(doc.file_size)}</span>
              <span>{fmtDate(doc.uploaded_at)}</span>
              <span>von {formatUploadedVia(doc.uploaded_via)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button type="button" onClick={onDownload} style={{ padding: "8px 14px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>↓ Download</button>
            <button type="button" onClick={onClose} style={{ padding: "8px 14px", background: "#fff", color: "#333", border: "1px solid #ddd", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} title="Schliessen (Esc)">✕ Schliessen</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, background: "#222", overflow: "auto", display: "flex", alignItems: isImage ? "center" : "stretch", justifyContent: "center", minHeight: 400 }}>
          {error ? (
            <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>{error}</div>
          ) : !signedUrl ? (
            <div style={{ color: "#aaa", padding: 40, textAlign: "center", fontSize: 13 }}>Datei wird geladen…</div>
          ) : isPdf ? (
            <iframe
              src={signedUrl}
              style={{ width: "100%", height: "75vh", border: "none", background: "#222" }}
              title={doc.file_name}
            />
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={signedUrl} alt={doc.file_name} style={{ maxWidth: "100%", maxHeight: "75vh", display: "block", margin: "0 auto" }} />
          ) : (
            <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>
              <p style={{ marginBottom: 16 }}>Vorschau für diesen Dateityp nicht verfügbar.</p>
              <button type="button" onClick={onDownload} style={{ padding: "10px 20px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Datei herunterladen</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
