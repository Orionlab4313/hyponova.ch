"use client";

import { useEffect, useState } from "react";

type Lang = "de" | "en";
type Kategorie = "abloesung" | "neukauf";

interface Vorlage {
  id: string;
  name_de: string;
  name_en: string;
  description_de: string | null;
  description_en: string | null;
  kategorie: "abloesung" | "neukauf" | "beide";
  file_url: string;
  file_name: string;
  file_size: number | null;
  sort_order: number;
}

const COPY = {
  de: {
    title: "Wichtige Dokumente zum Download",
    desc: "Diese Vorlagen brauchen Sie für den weiteren Prozess. Drucken Sie sie aus, unterschreiben Sie und laden Sie sie wieder hoch.",
    download: "Herunterladen",
  },
  en: {
    title: "Important documents to download",
    desc: "You'll need these templates for the next steps. Print them, sign them and upload them back.",
    download: "Download",
  },
} as const;

const ACCENT = "#c8553d";

function formatBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  kategorie: Kategorie;
  lang: Lang;
  /**
   * "card" — eigener Card-Block mit Header (Success-Screen Style)
   * "compact" — schmaler Banner (Upload-Portal Style)
   */
  variant?: "card" | "compact";
}

export default function VorlagenDownloadBlock({ kategorie, lang, variant = "card" }: Props) {
  const [vorlagen, setVorlagen] = useState<Vorlage[] | null>(null);
  const t = COPY[lang];

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/vorlagen?kategorie=${kategorie}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Vorlage[]) => {
        if (!cancelled) setVorlagen(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        if (!cancelled) setVorlagen([]);
      });
    return () => {
      cancelled = true;
    };
  }, [kategorie]);

  // Beim Laden + wenn keine aktiven Vorlagen vorhanden: nichts rendern
  if (!vorlagen || vorlagen.length === 0) return null;

  if (variant === "compact") {
    return (
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{t.title}</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 12, lineHeight: 1.5 }}>{t.desc}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {vorlagen.map((v) => (
            <VorlagenRow key={v.id} v={v} lang={lang} downloadLabel={t.download} compact />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "20px 24px", marginTop: 24, textAlign: "left" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>{t.title}</h3>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 14px", lineHeight: 1.6 }}>{t.desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {vorlagen.map((v) => (
          <VorlagenRow key={v.id} v={v} lang={lang} downloadLabel={t.download} />
        ))}
      </div>
    </div>
  );
}

function VorlagenRow({
  v,
  lang,
  downloadLabel,
  compact,
}: {
  v: Vorlage;
  lang: Lang;
  downloadLabel: string;
  compact?: boolean;
}) {
  const name = (lang === "en" && v.name_en) ? v.name_en : v.name_de;
  const desc = (lang === "en" && v.description_en) ? v.description_en : v.description_de;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        padding: compact ? "8px 12px" : "12px 14px",
        background: "#f7f5f2",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {name}
        </div>
        {desc && (
          <div style={{ fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
        )}
        <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
          PDF{v.file_size ? ` · ${formatBytes(v.file_size)}` : ""}
        </div>
      </div>
      <a
        href={v.file_url}
        target="_blank"
        rel="noopener noreferrer"
        download={v.file_name}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          background: ACCENT,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          flexShrink: 0,
          fontFamily: "inherit",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {downloadLabel}
      </a>
    </div>
  );
}
