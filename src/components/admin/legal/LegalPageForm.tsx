"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlogPostEditor from "@/components/admin/blogposts/BlogPostEditor";

export interface LegalPageFormData {
  id: "impressum" | "agb" | "datenschutz";
  title_de: string;
  title_en: string;
  title_highlight_de: string;
  title_highlight_en: string;
  content_html_de: string;
  content_html_en: string;
  meta_description_de: string;
  meta_description_en: string;
  updated_at?: string;
}

interface Props {
  initial: LegalPageFormData;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  marginBottom: 5,
  marginTop: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 4,
  fontSize: 16,
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.4,
};

const compactInputStyle: React.CSSProperties = {
  ...inputStyle,
  padding: "8px 10px",
};

function formatDateTime(iso?: string): string {
  if (!iso) return "noch nicht gespeichert";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "noch nicht gespeichert";
  return d.toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LegalPageForm({ initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<LegalPageFormData>(initial);
  const [lang, setLang] = useState<"de" | "en">("de");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  function update<K extends keyof LegalPageFormData>(
    key: K,
    value: LegalPageFormData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/legal-pages/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_de: data.title_de,
          title_en: data.title_en,
          title_highlight_de: data.title_highlight_de,
          title_highlight_en: data.title_highlight_en,
          content_html_de: data.content_html_de,
          content_html_en: data.content_html_en,
          meta_description_de: data.meta_description_de,
          meta_description_en: data.meta_description_en,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(String(j.error || "Speichern fehlgeschlagen"));
        setSaving(false);
        return;
      }
      const updated = await res.json();
      setData((prev) => ({ ...prev, updated_at: updated.updated_at }));
      setSaving(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
    } catch {
      setError("Netzwerkfehler");
      setSaving(false);
    }
  }

  const isAGBOrDatenschutz = data.id === "agb" || data.id === "datenschutz";
  const enContentEmpty = data.content_html_en.trim().length === 0;

  const titleVal = lang === "de" ? data.title_de : data.title_en;
  const titleHighlightVal = lang === "de" ? data.title_highlight_de : data.title_highlight_en;
  const metaVal = lang === "de" ? data.meta_description_de : data.meta_description_en;

  return (
    <div className="legal-form-grid">
      <div style={{ minWidth: 0 }}>
        {isAGBOrDatenschutz && (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(200,85,61,0.08)",
              border: "1px solid rgba(200,85,61,0.25)",
              borderRadius: 4,
              fontSize: 13,
              color: "#7a3a2a",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            <strong>Hinweis:</strong> Inhaltliche Änderungen an AGB und Datenschutz vor Veröffentlichung juristisch prüfen lassen. Sie sind rechtlich relevant.
          </div>
        )}

        {/* Sprachen-Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid #e5e5e5",
            marginBottom: 16,
          }}
        >
          {(["de", "en"] as const).map((l) => {
            const active = lang === l;
            const enWarn = l === "en" && enContentEmpty;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "2px solid #7c5cfc" : "2px solid transparent",
                  marginBottom: -1,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#1a1a1a" : "#888",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {l === "de" ? "Deutsch" : "English"}
                {enWarn && (
                  <span
                    title="EN-Version ist leer — auf der Website wird DE angezeigt"
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      background: "#fff3cd",
                      color: "#856404",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    leer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <label style={labelStyle}>Überschrift {lang === "de" ? "(Deutsch)" : "(English)"}</label>
        <input
          value={titleVal}
          onChange={(e) =>
            update(lang === "de" ? "title_de" : "title_en", e.target.value)
          }
          placeholder={lang === "de" ? "z.B. Allgemeine" : "e.g. General"}
          style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }}
        />
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          Erster Teil der Überschrift in normaler Schrift.
        </div>

        <label style={labelStyle}>Überschrift-Highlight (fett)</label>
        <input
          value={titleHighlightVal}
          onChange={(e) =>
            update(
              lang === "de" ? "title_highlight_de" : "title_highlight_en",
              e.target.value
            )
          }
          placeholder={lang === "de" ? "z.B. Geschäftsbedingungen" : "e.g. Terms"}
          style={compactInputStyle}
        />
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          Zweiter Teil — wird auf der Seite fett dargestellt.
        </div>

        <label style={labelStyle}>Inhalt {lang === "de" ? "(Deutsch)" : "(English)"}</label>

        {/* Beide Editoren bleiben im DOM, der inaktive ist nur visuell ausgeblendet.
            So verlieren wir keinen Tiptap-State beim Sprachwechsel. */}
        <div style={{ display: lang === "de" ? "block" : "none" }}>
          <BlogPostEditor
            initialHtml={initial.content_html_de}
            onChange={(html) => update("content_html_de", html)}
          />
        </div>
        <div style={{ display: lang === "en" ? "block" : "none" }}>
          <BlogPostEditor
            initialHtml={initial.content_html_en}
            onChange={(html) => update("content_html_en", html)}
          />
        </div>

        <label style={labelStyle}>SEO Meta-Description</label>
        <textarea
          value={metaVal}
          onChange={(e) =>
            update(
              lang === "de" ? "meta_description_de" : "meta_description_en",
              e.target.value
            )
          }
          placeholder="Kurzbeschreibung für Google (1–2 Sätze)"
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
        />
      </div>

      {/* Seitenleiste */}
      <div className="legal-sidebar">
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 6,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Speichern
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
            Änderungen sind sofort live auf <code>{`/${data.id}`}</code>.
          </div>

          <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>
            Zuletzt geändert:<br />
            <strong>{formatDateTime(data.updated_at)}</strong>
          </div>

          {enContentEmpty && (
            <div
              style={{
                padding: "10px 12px",
                background: "rgba(255,193,7,0.1)",
                border: "1px solid rgba(255,193,7,0.3)",
                borderRadius: 4,
                fontSize: 12,
                color: "#856404",
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              Die englische Version ist leer. Auf der Website wird in beiden Sprachen die deutsche Version angezeigt.
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#c00",
                fontSize: 13,
                marginBottom: 12,
                padding: "10px 12px",
                background: "rgba(239,68,68,0.08)",
                borderRadius: 4,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {savedFlash && (
            <div
              style={{
                color: "#0a7a2e",
                fontSize: 13,
                marginBottom: 12,
                padding: "10px 12px",
                background: "#e6f4ea",
                borderRadius: 4,
              }}
            >
              Gespeichert.
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px 0",
              background: "#7c5cfc",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>

          <a
            href={`/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 8,
              padding: "10px 0",
              background: "#fff",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: 14,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Vorschau öffnen
          </a>

          <button
            type="button"
            onClick={() => router.push("/admin/rechtliches")}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "10px 0",
              background: "transparent",
              color: "#666",
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>

      <style>{`
        .legal-form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 20px;
          align-items: start;
        }
        .legal-sidebar {
          position: sticky;
          top: 16px;
        }
        @media (max-width: 860px) {
          .legal-form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .legal-sidebar {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
