"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LegalPageRow {
  id: "impressum" | "agb" | "datenschutz";
  title_de: string;
  title_en: string;
  content_html_de: string;
  content_html_en: string;
  updated_at: string;
}

const PAGES: { id: "impressum" | "agb" | "datenschutz"; label: string; description: string }[] = [
  {
    id: "impressum",
    label: "Impressum",
    description: "Firmenangaben, Kontakt, Handelsregister, Haftungsausschluss.",
  },
  {
    id: "agb",
    label: "AGB",
    description: "Allgemeine Geschäftsbedingungen für die Vermittlungsdienstleistungen.",
  },
  {
    id: "datenschutz",
    label: "Datenschutz",
    description: "Datenschutzerklärung gemäss nDSG. Wird von Cookie-Banner referenziert.",
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return ",";
  return d.toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RechtlichesListPage() {
  const [rows, setRows] = useState<LegalPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/legal-pages");
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setRows(data);
        } else {
          const j = await res.json().catch(() => ({}));
          setError(String(j.error || "Fehler beim Laden"));
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rowMap = new Map(rows.map((r) => [r.id, r]));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
          Rechtliche Seiten
        </h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.5 }}>
          Inhalte für Impressum, AGB und Datenschutz. Änderungen werden sofort auf der Website sichtbar.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 14px",
            background: "rgba(239,68,68,0.08)",
            color: "#c00",
            borderRadius: 4,
            marginBottom: 14,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
          Laden…
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
          }}
        >
          {PAGES.map((p) => {
            const row = rowMap.get(p.id);
            const enEmpty = !row || row.content_html_en.trim().length === 0;
            return (
              <Link
                key={p.id}
                href={`/admin/rechtliches/${p.id}`}
                style={{
                  display: "block",
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: 6,
                  padding: 16,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                className="legal-card"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        marginBottom: 4,
                        color: "#1a1a1a",
                      }}
                    >
                      {p.label}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                      {p.description}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#888",
                        marginTop: 8,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>URL: /{p.id}</span>
                      {row && <span>Geändert: {formatDate(row.updated_at)}</span>}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexShrink: 0,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 8px",
                        background: "#e6f4ea",
                        color: "#0a7a2e",
                        borderRadius: 10,
                      }}
                    >
                      DE live
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 8px",
                        background: enEmpty ? "#fff3cd" : "#e6f4ea",
                        color: enEmpty ? "#856404" : "#0a7a2e",
                        borderRadius: 10,
                      }}
                    >
                      EN {enEmpty ? "fehlt" : "live"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .legal-card:hover {
          border-color: #c8553d !important;
          box-shadow: 0 2px 8px rgba(200,85,61,0.08);
        }
      `}</style>
    </div>
  );
}
