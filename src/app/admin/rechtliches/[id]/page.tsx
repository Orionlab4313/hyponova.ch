"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import LegalPageForm, {
  type LegalPageFormData,
} from "@/components/admin/legal/LegalPageForm";

const ALLOWED = ["impressum", "agb", "datenschutz"] as const;
type AllowedId = (typeof ALLOWED)[number];

const LABELS: Record<AllowedId, string> = {
  impressum: "Impressum",
  agb: "AGB",
  datenschutz: "Datenschutz",
};

export default function EditLegalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const [data, setData] = useState<LegalPageFormData | null>(null);
  const [error, setError] = useState("");

  const id = (ALLOWED as readonly string[]).includes(rawId)
    ? (rawId as AllowedId)
    : null;

  useEffect(() => {
    if (!id) {
      setError("Ungültige Seite");
      return;
    }
    async function load() {
      try {
        const res = await fetch(`/api/admin/legal-pages/${id}`);
        if (!res.ok) {
          setError("Seite nicht gefunden");
          return;
        }
        const page = await res.json();
        setData({
          id: page.id,
          title_de: page.title_de || "",
          title_en: page.title_en || "",
          title_highlight_de: page.title_highlight_de || "",
          title_highlight_en: page.title_highlight_en || "",
          content_html_de: page.content_html_de || "",
          content_html_en: page.content_html_en || "",
          meta_description_de: page.meta_description_de || "",
          meta_description_en: page.meta_description_en || "",
          updated_at: page.updated_at,
        });
      } catch {
        setError("Fehler beim Laden");
      }
    }
    load();
  }, [id]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/admin/rechtliches"
          style={{ fontSize: 13, color: "#666", textDecoration: "none" }}
        >
          &larr; Zurück zur Übersicht
        </Link>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 20px" }}>
        {id ? LABELS[id] : "Rechtliche Seite"} bearbeiten
      </h1>
      {error && (
        <div
          style={{
            padding: 14,
            background: "rgba(239,68,68,0.08)",
            color: "#c00",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}
      {!data && !error && (
        <div style={{ color: "#888", padding: 40, textAlign: "center" }}>
          Laden…
        </div>
      )}
      {data && <LegalPageForm initial={data} />}
    </div>
  );
}
