"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatSource } from "@/lib/submissions";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface LeadRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  docs: { count: number; last_upload: string | null; reviewing: number };
  submissions: { types: string[] };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function DokumentePage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "with_docs" | "with_submission">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setLeads(d))
      .finally(() => setLoading(false));
  }, []);

  async function deleteLead(id: string, name: string) {
    const lead = leads.find((l) => l.id === id);
    const docCount = lead?.docs.count ?? 0;
    const ok = await confirm({
      title: `«${name}» endgültig löschen?`,
      body: docCount > 0
        ? `Es werden ${docCount} Dokument${docCount === 1 ? "" : "e"} sowie alle Fragebogen-Antworten, Notizen und Aufgaben dieses Kontakts mitgelöscht. Das kann nicht rückgängig gemacht werden.`
        : "Alle zugehörigen Daten werden mitgelöscht. Das kann nicht rückgängig gemacht werden.",
      confirmLabel: "Endgültig löschen",
      cancelLabel: "Abbrechen",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        toast({ type: "success", message: `«${name}» wurde gelöscht.` });
      } else {
        toast({ type: "error", message: "Löschen fehlgeschlagen." });
      }
    } catch {
      toast({ type: "error", message: "Netzwerkfehler beim Löschen." });
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = leads.filter((l) => {
    if (filter === "with_docs") return l.docs.count > 0;
    if (filter === "with_submission") return l.submissions.types.length > 0;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dokumente</h1>
        <div style={{ fontSize: 12, color: "#888" }}>Pro Kontakt aufgegliedert</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {([
          ["all", `Alle (${leads.length})`],
          ["with_docs", `Mit Dokumenten (${leads.filter((l) => l.docs.count > 0).length})`],
          ["with_submission", `Mit Fragebogen (${leads.filter((l) => l.submissions.types.length > 0).length})`],
        ] as const).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setFilter(k as any)}
            style={{ padding: "6px 12px", background: filter === k ? "#c8553d" : "#fff", color: filter === k ? "#fff" : "#333", border: `1px solid ${filter === k ? "#c8553d" : "#ddd"}`, borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Laden…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fff", borderRadius: 6, border: "1px solid #e5e5e5" }}>Keine Kontakte in dieser Kategorie.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((l) => (
            <div key={l.id} className="dokumente-card"
              style={{ display: "flex", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, padding: 14, alignItems: "stretch", gap: 12, transition: "border-color 0.15s" }}>
              <Link href={`/admin/dokumente/${l.id}`}
                style={{ flex: 1, minWidth: 0, textDecoration: "none", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{l.first_name} {l.last_name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{l.email}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {l.source && <span>Quelle: {formatSource(l.source)}</span>}
                    {l.docs.last_upload && <span>Letzter Upload: {formatDate(l.docs.last_upload)}</span>}
                    {l.submissions.types.length > 0 && <span>Fragebogen: {l.submissions.types.map((t) => t === "abloesung" ? "Ablösung" : "Neukauf").join(", ")}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {l.docs.count > 0 ? (
                    <span style={{ fontSize: 12, padding: "4px 10px", background: "#dcfce7", color: "#166534", borderRadius: 12, fontWeight: 600 }}>{l.docs.count} Datei{l.docs.count === 1 ? "" : "en"}</span>
                  ) : (
                    <span style={{ fontSize: 12, padding: "4px 10px", background: "#f5f5f5", color: "#888", borderRadius: 12 }}>0 Dateien</span>
                  )}
                  {l.docs.reviewing > 0 && <span style={{ fontSize: 11, padding: "3px 8px", background: "#fef3c7", color: "#92400e", borderRadius: 10, fontWeight: 600 }}>{l.docs.reviewing} prüfen</span>}
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteLead(l.id, `${l.first_name} ${l.last_name}`); }}
                disabled={deletingId === l.id}
                style={{ padding: "6px 10px", background: "transparent", color: "#c00", border: "1px solid transparent", fontSize: 18, cursor: deletingId === l.id ? "wait" : "pointer", fontFamily: "inherit", flexShrink: 0, opacity: deletingId === l.id ? 0.5 : 1, alignSelf: "center" }}
                className="lead-delete-btn"
                title="Kontakt komplett löschen (mit allen Dokumenten und Antworten)"
              >
                {deletingId === l.id ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .dokumente-card:hover {
          border-color: #c8553d !important;
        }
        .lead-delete-btn:hover {
          background: rgba(220, 38, 38, 0.08) !important;
          border-color: rgba(220, 38, 38, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
