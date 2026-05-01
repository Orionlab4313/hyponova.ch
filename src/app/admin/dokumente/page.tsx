"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setLeads(d))
      .finally(() => setLoading(false));
  }, []);

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
            <Link key={l.id} href={`/admin/dokumente/${l.id}`} className="dokumente-card"
              style={{ display: "block", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, padding: 14, textDecoration: "none", color: "inherit", transition: "border-color 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{l.first_name} {l.last_name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{l.email}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {l.source && <span>Quelle: {l.source}</span>}
                    {l.docs.last_upload && <span>Letzter Upload: {formatDate(l.docs.last_upload)}</span>}
                    {l.submissions.types.length > 0 && <span>Fragebogen: {l.submissions.types.join(", ")}</span>}
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
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .dokumente-card:hover {
          border-color: #c8553d !important;
        }
      `}</style>
    </div>
  );
}
