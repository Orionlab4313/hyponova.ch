"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import {
  formatSubmissionAnswers,
  formatEndPath,
  formatSource,
  formatCategory,
  formatUploadedVia,
  DOCUMENT_CATEGORY_LABELS,
  type SubmissionType,
} from "@/lib/submissions";
import {
  IconStickyNote,
  IconCheckCircle,
  IconFileText,
  IconPencil,
  IconUpload,
  IconDownload,
  IconX,
  IconPlus,
} from "@/components/admin/AdminIcons";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const ACCENT = "#c8553d";
const KANTONE: [string, string][] = [
  ["AG", "Aargau"], ["AI", "Appenzell Innerrhoden"], ["AR", "Appenzell Ausserrhoden"],
  ["BE", "Bern"], ["BL", "Basel-Landschaft"], ["BS", "Basel-Stadt"],
  ["FR", "Freiburg / Fribourg"], ["GE", "Genf / Genève"], ["GL", "Glarus"],
  ["GR", "Graubünden"], ["JU", "Jura"], ["LU", "Luzern"], ["NE", "Neuenburg / Neuchâtel"],
  ["NW", "Nidwalden"], ["OW", "Obwalden"], ["SG", "St. Gallen"], ["SH", "Schaffhausen"],
  ["SO", "Solothurn"], ["SZ", "Schwyz"], ["TG", "Thurgau"], ["TI", "Tessin / Ticino"],
  ["UR", "Uri"], ["VD", "Waadt / Vaud"], ["VS", "Wallis / Valais"],
  ["ZG", "Zug"], ["ZH", "Zürich"],
];

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

interface Todo {
  id: string;
  text: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
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
function fmtDateOnly(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
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
  const [pendingStatus, setPendingStatus] = useState<Record<string, Doc["status"]>>({});
  const [pendingCategory, setPendingCategory] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<Doc | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  function load() {
    fetch(`/api/admin/documents?leadId=${leadId}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data.lead);
        setDocs(data.documents || []);
        setSubmissions(data.submissions || []);
        setPendingStatus({});
        setPendingCategory({});
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [leadId]);

  async function downloadDoc(docId: string) {
    const res = await fetch(`/api/admin/documents/${docId}?download=1`);
    if (!res.ok) { toast({ type: "error", message: "Download fehlgeschlagen." }); return; }
    const j = await res.json();
    window.open(j.url, "_blank");
  }

  async function saveDocChanges(docId: string) {
    const updates: Record<string, unknown> = {};
    if (pendingStatus[docId]) updates.status = pendingStatus[docId];
    if (pendingCategory[docId] !== undefined) updates.category = pendingCategory[docId] || null;
    if (Object.keys(updates).length === 0) return;

    setSavingId(docId);
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, ...updated } : d));
        setPendingStatus((p) => { const n = { ...p }; delete n[docId]; return n; });
        setPendingCategory((p) => { const n = { ...p }; delete n[docId]; return n; });
        toast({ type: "success", message: "Änderungen gespeichert." });
      } else {
        toast({ type: "error", message: "Speichern fehlgeschlagen." });
      }
    } finally {
      setSavingId(null);
    }
  }

  function discardDocChanges(docId: string) {
    setPendingStatus((p) => { const n = { ...p }; delete n[docId]; return n; });
    setPendingCategory((p) => { const n = { ...p }; delete n[docId]; return n; });
  }

  async function deleteDoc(docId: string) {
    const doc = docs.find((d) => d.id === docId);
    const ok = await confirm({
      title: "Dokument löschen?",
      body: doc ? `«${doc.file_name}» wird endgültig entfernt.` : "Dieses Dokument wird endgültig entfernt.",
      confirmLabel: "Löschen",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      setDocs((p) => p.filter((d) => d.id !== docId));
      toast({ type: "success", message: "Dokument gelöscht." });
    } else {
      toast({ type: "error", message: "Löschen fehlgeschlagen." });
    }
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

      {/* === Notizen + Todos: Side-by-Side auf Desktop === */}
      <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <NotesPanel leadId={leadId} initialNotes={lead.notes || ""} />
        <TodosPanel leadId={leadId} />
      </div>

      {submissions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#444" }}>Fragebogen-Antworten</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {submissions.map((s) => (
              <SubmissionPanel key={s.id} submission={s} onSaved={load} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#444" }}>Dokumente ({docs.length})</h2>
        <AdminUploadButton leadId={leadId} submissionId={submissions[0]?.id || null} onUploaded={load} />
      </div>

      {docs.length === 0 ? (
        <div style={{ padding: 30, textAlign: "center", background: "#fff", border: "1px solid #e5e5e5", color: "#888", fontSize: 13 }}>Noch keine Dokumente hochgeladen</div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {docs.map((d) => {
            const currentStatus = pendingStatus[d.id] ?? d.status;
            const currentCategory = pendingCategory[d.id] !== undefined ? pendingCategory[d.id] : (d.category || "");
            const hasPending = (pendingStatus[d.id] !== undefined && pendingStatus[d.id] !== d.status)
              || (pendingCategory[d.id] !== undefined && (pendingCategory[d.id] || null) !== d.category);
            const st = STATUS_LABELS[currentStatus];
            return (
              <div key={d.id} className="doc-card" style={{ background: "#fff", border: hasPending ? `1px solid ${ACCENT}` : "1px solid #e5e5e5", padding: 12, transition: "border-color 0.15s" }}>
                <div className="doc-card-grid">
                  <div className="doc-name-block" style={{ minWidth: 0 }}>
                    <select
                      value={currentCategory}
                      onChange={(e) => setPendingCategory((prev) => ({ ...prev, [d.id]: e.target.value }))}
                      disabled={savingId === d.id}
                      style={{ marginBottom: 6, padding: "5px 8px", fontSize: 13, fontWeight: 700, color: "#1a1a1a", background: hasPending ? `${ACCENT}10` : "#f5f5f5", border: hasPending ? `1px solid ${ACCENT}` : "1px solid transparent", cursor: "pointer", fontFamily: "inherit", maxWidth: "100%" }}
                    >
                      <option value="">, Sonstige Unterlage ,</option>
                      {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.de}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setViewerDoc(d)}
                      style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                    >
                      <div className="doc-name" style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                        <IconFileText size={14} />
                        <span style={{ borderBottom: `1px dashed ${ACCENT}80`, color: ACCENT, wordBreak: "break-all", minWidth: 0, flex: 1 }}>{d.file_name}</span>
                      </div>
                      <div className="doc-meta" style={{ fontSize: 11, color: "#888", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span>{fmtBytes(d.file_size)}</span>
                        <span>{fmtDate(d.uploaded_at)}</span>
                        <span className="doc-source-inline">von {formatUploadedVia(d.uploaded_via)}</span>
                      </div>
                      <div className="doc-source" style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                        von {formatUploadedVia(d.uploaded_via)}
                      </div>
                    </button>
                  </div>
                  <div className="doc-actions" style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
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
                        <button type="button" onClick={() => saveDocChanges(d.id)} disabled={savingId === d.id}
                          style={{ padding: "5px 12px", background: ACCENT, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: savingId === d.id ? "wait" : "pointer", fontFamily: "inherit", opacity: savingId === d.id ? 0.6 : 1 }}>
                          {savingId === d.id ? "Speichert…" : "Speichern"}
                        </button>
                        <button type="button" onClick={() => discardDocChanges(d.id)} disabled={savingId === d.id}
                          style={{ padding: "5px 8px", background: "transparent", color: "#666", border: "1px solid #ddd", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                          Verwerfen
                        </button>
                      </>
                    )}
                    <button type="button" onClick={() => downloadDoc(d.id)} style={{ padding: "5px 10px", background: "#fff", color: "#333", border: "1px solid #ddd", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <IconDownload size={13} /> Download
                    </button>
                    <button type="button" onClick={() => deleteDoc(d.id)} style={{ padding: "5px 8px", background: "transparent", color: "#c00", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center" }} title="Löschen">
                      <IconX size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewerDoc && <FileViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} onDownload={() => downloadDoc(viewerDoc.id)} />}

      <style>{`
        .doc-card-grid { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .doc-name-block { flex: 1; }
        .doc-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .doc-source { display: none; }
        @media (max-width: 880px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .doc-card-grid { flex-direction: column; align-items: stretch; gap: 10px; }
          .doc-name-block { width: 100%; }
          .doc-name { white-space: normal; line-height: 1.4; }
          .doc-source-inline { display: none; }
          .doc-source { display: block; }
          .doc-actions { width: 100%; border-top: 1px solid #f0f0f0; padding-top: 10px; justify-content: space-between; align-items: center; }
          .doc-actions > select { flex: 0 0 auto; }
        }
      `}</style>
    </div>
  );
}

/* ============== NOTES PANEL ============== */
function NotesPanel({ leadId, initialNotes }: { leadId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const toast = useToast();

  const dirty = notes !== savedNotes;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, notes }),
      });
      if (res.ok) {
        setSavedNotes(notes);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
      } else {
        toast({ type: "error", message: "Notizen konnten nicht gespeichert werden." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "#fff", border: dirty ? `1px solid ${ACCENT}` : "1px solid #e5e5e5", padding: 16, transition: "border-color 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#444", display: "flex", alignItems: "center", gap: 6 }}>
          <IconStickyNote size={14} /> Notizen
        </h3>
        {savedFlash && <span style={{ fontSize: 11, color: "#0a7a2e", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconCheckCircle size={12} /> Gespeichert
        </span>}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notizen zum Kontakt, z.B. Telefonate, Hinweise, Vereinbarungen..."
        style={{ width: "100%", minHeight: 120, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", border: "1px solid #ddd", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5, background: "#fafafa" }}
      />
      {dirty && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button type="button" onClick={save} disabled={saving} style={{ padding: "8px 16px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Speichert…" : "Notizen speichern"}
          </button>
          <button type="button" onClick={() => setNotes(savedNotes)} disabled={saving} style={{ padding: "8px 14px", background: "transparent", color: "#666", border: "1px solid #ddd", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Verwerfen</button>
        </div>
      )}
    </div>
  );
}

/* ============== TODOS PANEL ============== */
function TodosPanel({ leadId }: { leadId: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  function load() {
    fetch(`/api/admin/leads/${leadId}/todos`).then((r) => r.json()).then((d) => Array.isArray(d) && setTodos(d));
  }
  useEffect(() => { load(); }, [leadId]);

  async function addTodo() {
    const text = newText.trim();
    if (!text) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/todos`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const t = await res.json();
        setTodos((prev) => [t, ...prev]);
        setNewText("");
      }
    } finally { setAdding(false); }
  }

  async function toggleDone(t: Todo) {
    const res = await fetch(`/api/admin/leads/${leadId}/todos/${t.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !t.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => {
        const next = prev.map((x) => x.id === t.id ? updated : x);
        // Re-sortieren: offen zuerst
        return next.sort((a, b) => Number(a.done) - Number(b.done));
      });
    }
  }

  async function delTodo(id: string) {
    const todo = todos.find((t) => t.id === id);
    const ok = await confirm({
      title: "Aufgabe löschen?",
      body: todo ? `«${todo.text}»` : undefined,
      confirmLabel: "Löschen",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/leads/${leadId}/todos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTodos((p) => p.filter((t) => t.id !== id));
    } else {
      toast({ type: "error", message: "Aufgabe konnte nicht gelöscht werden." });
    }
  }

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#444", display: "flex", alignItems: "center", gap: 6 }}>
          <IconCheckCircle size={14} /> Aufgaben ({open.length})
        </h3>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); addTodo(); }}
        style={{ display: "flex", gap: 6, marginBottom: 12 }}
      >
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Neue Aufgabe…"
          style={{ flex: 1, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", border: "1px solid #ddd", boxSizing: "border-box" }}
        />
        <button type="submit" disabled={adding || !newText.trim()} style={{ padding: "8px 14px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: adding || !newText.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: adding || !newText.trim() ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconPlus size={13} /> Hinzufügen
        </button>
      </form>

      {todos.length === 0 ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#999", fontSize: 12 }}>Noch keine Aufgaben</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {open.map((t) => <TodoRow key={t.id} todo={t} onToggle={() => toggleDone(t)} onDelete={() => delTodo(t.id)} />)}
          {done.length > 0 && open.length > 0 && <li style={{ borderTop: "1px solid #f0f0f0", marginTop: 4, paddingTop: 4 }} />}
          {done.map((t) => <TodoRow key={t.id} todo={t} onToggle={() => toggleDone(t)} onDelete={() => delTodo(t.id)} />)}
        </ul>
      )}
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete }: { todo: Todo; onToggle: () => void; onDelete: () => void }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 4px", fontSize: 13 }}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={onToggle}
        style={{ marginTop: 3, width: 16, height: 16, accentColor: ACCENT, flexShrink: 0, cursor: "pointer" }}
      />
      <span style={{ flex: 1, color: todo.done ? "#999" : "#1a1a1a", textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.4, wordBreak: "break-word" }}>
        {todo.text}
      </span>
      <button type="button" onClick={onDelete} style={{ background: "transparent", border: "none", color: "#c00", cursor: "pointer", padding: "0 4px", flexShrink: 0, display: "inline-flex", alignItems: "center" }} title="Löschen">
        <IconX size={14} />
      </button>
    </li>
  );
}

/* ============== SUBMISSION PANEL (Read + Edit) ============== */
function SubmissionPanel({ submission, onSaved }: { submission: Submission; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(true);

  return (
    <div style={{ background: "#fff", border: editing ? `1px solid ${ACCENT}` : "1px solid #e5e5e5", padding: "12px 16px", transition: "border-color 0.15s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}
        >
          {submission.type === "abloesung" ? "Ablösung" : "Neukauf"}
          <span style={{ marginLeft: 8, fontWeight: 400, color: "#888" }}>
            · {fmtDate(submission.created_at)} · {formatEndPath(submission.end_path)} · {submission.lang.toUpperCase()}
          </span>
        </button>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} style={{ padding: "5px 12px", background: "#fff", color: ACCENT, border: `1px solid ${ACCENT}`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IconPencil size={12} /> Bearbeiten
          </button>
        )}
      </div>
      {open && (
        editing ? (
          <SubmissionEditor submission={submission} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); onSaved(); }} />
        ) : (
          <ReadOnlyAnswers submission={submission} />
        )
      )}
    </div>
  );
}

function ReadOnlyAnswers({ submission }: { submission: Submission }) {
  const formatted = formatSubmissionAnswers(submission.type as SubmissionType, submission.answers);
  return (
    <dl style={{ marginTop: 14, marginBottom: 0, display: "grid", gridTemplateColumns: "minmax(140px, 200px) 1fr", gap: "8px 16px", fontSize: 13 }}>
      {formatted.map((row, i) => (
        <FragebogenRow key={i} row={row} />
      ))}
    </dl>
  );
}

function FragebogenRow({ row }: { row: { label: string; value: string; multi?: string[] } }) {
  return (
    <>
      <dt style={{ color: "#666", fontWeight: 500, lineHeight: 1.5 }}>{row.label}</dt>
      <dd style={{ margin: 0, color: "#1a1a1a", fontWeight: 500, lineHeight: 1.5 }}>
        {row.value}
        {row.multi && row.multi.length > 0 && (
          <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18, color: "#444", fontWeight: 400 }}>
            {row.multi.map((line, i) => (<li key={i} style={{ marginBottom: 3 }}>{line}</li>))}
          </ul>
        )}
      </dd>
    </>
  );
}

function SubmissionEditor({ submission, onCancel, onSaved }: { submission: Submission; onCancel: () => void; onSaved: () => void }) {
  const [a, setA] = useState<any>(submission.answers || {});
  const [endPath, setEndPath] = useState<string>(submission.end_path || "offerten");
  const [saving, setSaving] = useState(false);
  const isAbl = submission.type === "abloesung";
  const toast = useToast();

  function up(k: string, v: any) { setA((p: any) => ({ ...p, [k]: v })); }
  function upTranche(i: number, k: string, v: any) {
    const tr = Array.isArray(a.tranchen) ? [...a.tranchen] : [];
    tr[i] = { ...tr[i], [k]: v };
    up("tranchen", tr);
  }
  function addTranche() {
    const tr = Array.isArray(a.tranchen) ? [...a.tranchen] : [];
    tr.push({ betrag: 0, modell: "festzins", faelligkeit: "" });
    up("tranchen", tr);
  }
  function removeTranche(i: number) {
    const tr = Array.isArray(a.tranchen) ? a.tranchen.filter((_: any, idx: number) => idx !== i) : [];
    up("tranchen", tr);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: a, end_path: endPath }),
      });
      if (res.ok) {
        toast({ type: "success", message: "Fragebogen-Antworten gespeichert." });
        onSaved();
      } else {
        toast({ type: "error", message: "Speichern fehlgeschlagen." });
      }
    } finally { setSaving(false); }
  }

  return (
    <div style={{ marginTop: 14, padding: 14, background: "#fafafa", border: "1px solid #ececec" }}>
      {isAbl && (
        <Section title="Hypothekartranchen">
          {(Array.isArray(a.tranchen) ? a.tranchen : []).map((tr: any, i: number) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 6, alignItems: "end" }}>
              <Input label="Betrag (CHF)" type="number" value={tr.betrag ?? ""} onChange={(v) => upTranche(i, "betrag", Number(v))} />
              <Select label="Modell" value={tr.modell || ""} onChange={(v) => upTranche(i, "modell", v)}
                options={[["festzins", "Festzinshypothek"], ["saron", "SARON"], ["variable", "Variable Hypothek"]]} />
              <Input label="Fälligkeit" type="date" value={tr.faelligkeit || ""} onChange={(v) => upTranche(i, "faelligkeit", v)} />
              <button type="button" onClick={() => removeTranche(i)} style={{ padding: "8px 10px", background: "transparent", color: "#c00", border: "1px solid #f2caca", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>×</button>
            </div>
          ))}
          <button type="button" onClick={addTranche} style={{ marginTop: 4, padding: "6px 12px", background: "transparent", color: ACCENT, border: `1px dashed ${ACCENT}66`, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>+ Tranche hinzufügen</button>
        </Section>
      )}

      <Section title="Allgemein">
        <Grid2>
          <Select label="Kanton" value={a.kanton || ""} onChange={(v) => up("kanton", v)} options={[["", ","], ...KANTONE]} />
          <Select label="Objektart" value={a.objektart || ""} onChange={(v) => up("objektart", v)} options={[["", ","], ["efh", "Einfamilienhaus"], ["stwe", "Eigentumswohnung (STWE)"], ["2fh", "Zweifamilienhaus"]]} />
        </Grid2>

        {isAbl && (
          <Grid2>
            <Select label="Selbstbewohnt" value={a.bewohnt || ""} onChange={(v) => up("bewohnt", v)} options={[["", ","], ["100", "100% selbstbewohnt"], ["teilvermietet", "Teilweise vermietet"]]} />
            <Select label="Baurecht" value={a.baurecht === true ? "ja" : a.baurecht === false ? "nein" : ""} onChange={(v) => up("baurecht", v === "ja" ? true : v === "nein" ? false : null)} options={[["", ","], ["ja", "Ja"], ["nein", "Nein"]]} />
          </Grid2>
        )}

        {!isAbl && (
          <Select label="Status" value={a.status || ""} onChange={(v) => up("status", v)} options={[["", ","], ["bestehend", "Bestehende Liegenschaft"], ["neubau", "Neubau"]]} />
        )}

        <Select label="Tätigkeit" value={a.taetigkeit || ""} onChange={(v) => up("taetigkeit", v)} options={[["", ","], ["angestellt", "Angestellt"], ["selbstaendig", "Selbständig"], ["pensioniert", "Pensioniert"]]} />

        {isAbl && (
          <>
            <Select label="Weiss schon Modell + Laufzeit" value={a.weiss_modell === true ? "ja" : a.weiss_modell === false ? "nein" : ""} onChange={(v) => up("weiss_modell", v === "ja" ? true : v === "nein" ? false : null)} options={[["", ","], ["ja", "Ja"], ["nein", "Nein"]]} />
            <Grid2>
              <Select label="Gewünschtes Modell" value={a.modell || ""} onChange={(v) => up("modell", v)} options={[["", ","], ["festzins", "Festzinshypothek"], ["saron-rahmen", "SARON mit Rahmenlaufzeit"], ["saron-frei", "SARON ohne Rahmenlaufzeit"]]} />
              <Input label="Laufzeit (Jahre)" type="number" value={a.laufzeit_jahre ?? ""} onChange={(v) => up("laufzeit_jahre", v ? Number(v) : null)} />
            </Grid2>
          </>
        )}

        <Select label="Gewünschter Ausgang" value={endPath} onChange={(v) => setEndPath(v)} options={[["offerten", "Offerten-Vergleich von HYPONOVA"], ["termin", "Beratungstermin"]]} />
      </Section>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button type="button" onClick={save} disabled={saving} style={{ padding: "10px 20px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Speichert…" : "Änderungen speichern"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={{ padding: "10px 16px", background: "transparent", color: "#666", border: "1px solid #ddd", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Abbrechen</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{children}</div>;
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <label style={{ fontSize: 11, fontWeight: 600, color: "#444", display: "block" }}>
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", marginTop: 3, padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }} />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: (readonly [string, string])[] }) {
  return (
    <label style={{ fontSize: 11, fontWeight: 600, color: "#444", display: "block" }}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", marginTop: 3, padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

/* ============== ADMIN UPLOAD ============== */
function AdminUploadButton({ leadId, submissionId, onUploaded }: { leadId: string; submissionId: string | null; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handle(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("leadId", leadId);
      if (category) fd.append("category", category);
      if (submissionId) fd.append("submissionId", submissionId);
      const res = await fetch("/api/admin/documents", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast({ type: "error", message: "Upload fehlgeschlagen: " + (j.error || "unbekannt") });
      } else {
        toast({ type: "success", message: "Dokument hochgeladen." });
        onUploaded();
        setCategory("");
        setShowCategoryPicker(false);
      }
    } finally { setUploading(false); }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {showCategoryPicker && (
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #ddd", fontFamily: "inherit" }}>
          <option value="">, Sonstige Unterlage ,</option>
          {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => (<option key={k} value={k}>{v.de}</option>))}
        </select>
      )}
      <button
        type="button"
        onClick={() => {
          if (!showCategoryPicker) { setShowCategoryPicker(true); return; }
          inputRef.current?.click();
        }}
        disabled={uploading}
        style={{ padding: "8px 16px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        {uploading ? <>Lädt…</> : showCategoryPicker ? <><IconUpload size={14} /> Datei wählen</> : <><IconPlus size={14} /> Dokument hochladen</>}
      </button>
      {showCategoryPicker && !uploading && (
        <button type="button" onClick={() => { setShowCategoryPicker(false); setCategory(""); }} style={{ padding: "6px 10px", background: "transparent", color: "#666", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Abbrechen</button>
      )}
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }} />
    </div>
  );
}

/* ============== FILE VIEWER MODAL ============== */
function FileViewerModal({ doc, onClose, onDownload }: { doc: Doc; onClose: () => void; onDownload: () => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/documents/${doc.id}?download=1`);
        if (cancelled) return;
        if (!res.ok) { setError("Datei konnte nicht geladen werden"); return; }
        const j = await res.json();
        setSignedUrl(j.url);
      } catch {
        if (!cancelled) setError("Netzwerkfehler beim Laden der Datei");
      }
    })();
    return () => { cancelled = true; };
  }, [doc.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isPdf = doc.mime_type === "application/pdf" || doc.file_name.toLowerCase().endsWith(".pdf");
  const isImage = doc.mime_type?.startsWith("image/") || /\.(jpe?g|png|gif|webp)$/i.test(doc.file_name);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: 1100, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
              <IconFileText size={15} /> <span>{doc.file_name}</span>
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {doc.category && <span>Kategorie: {formatCategory(doc.category)}</span>}
              <span>{fmtBytes(doc.file_size)}</span>
              <span>{fmtDate(doc.uploaded_at)}</span>
              <span>von {formatUploadedVia(doc.uploaded_via)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button type="button" onClick={onDownload} style={{ padding: "8px 14px", background: ACCENT, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <IconDownload size={14} /> Download
            </button>
            <button type="button" onClick={onClose} style={{ padding: "8px 14px", background: "#fff", color: "#333", border: "1px solid #ddd", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }} title="Schliessen (Esc)">
              <IconX size={14} /> Schliessen
            </button>
          </div>
        </div>
        <div style={{ flex: 1, background: "#222", overflow: "auto", display: "flex", alignItems: isImage ? "center" : "stretch", justifyContent: "center", minHeight: 400 }}>
          {error ? (<div style={{ color: "#fff", padding: 40, textAlign: "center" }}>{error}</div>)
          : !signedUrl ? (<div style={{ color: "#aaa", padding: 40, textAlign: "center", fontSize: 13 }}>Datei wird geladen…</div>)
          : isPdf ? (<iframe src={signedUrl} style={{ width: "100%", height: "75vh", border: "none", background: "#222" }} title={doc.file_name} />)
          : isImage ? (
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
