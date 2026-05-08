"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import BlogPostEditor from "./BlogPostEditor";
import { resizeImage } from "./imageResize";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export interface BlogPostFormData {
  id?: string;
  // Sprachabhaengig
  title_de: string;
  title_en: string;
  title_highlight_de: string;
  title_highlight_en: string;
  badge_de: string;
  badge_en: string;
  excerpt_de: string;
  excerpt_en: string;
  content_html_de: string;
  content_html_en: string;
  reading_time_de: string;
  reading_time_en: string;
  meta_description_de: string;
  meta_description_en: string;
  // Sprachunabhaengig
  slug: string;
  hero_image: string;
  status: "draft" | "published" | "scheduled";
  publish_at: string | null;
}

interface Props {
  initial: BlogPostFormData;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function computeReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min`;
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

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#fff",
  color: "#333",
  border: "1px solid #ddd",
  borderRadius: 4,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function BlogPostForm({ initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<BlogPostFormData>(initial);
  const [lang, setLang] = useState<"de" | "en">("de");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugDirty, setSlugDirty] = useState(!!initial.slug);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputId = useId();
  const confirm = useConfirm();
  const toast = useToast();

  function update<K extends keyof BlogPostFormData>(
    key: K,
    value: BlogPostFormData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Slug wird nur aus DE-Titel automatisch abgeleitet, EN-Titel-Aenderungen
  // beruehren den Slug nicht, sonst wuerde er beim Sprachwechsel kippen.
  function onTitleDeChange(v: string) {
    update("title_de", v);
    if (!slugDirty) update("slug", slugify(v));
  }

  function onContentDeChange(html: string) {
    setData((prev) => ({
      ...prev,
      content_html_de: html,
      reading_time_de: computeReadingTime(html),
    }));
  }

  function onContentEnChange(html: string) {
    setData((prev) => ({
      ...prev,
      content_html_en: html,
      reading_time_en: computeReadingTime(html),
    }));
  }

  async function uploadHero(file: File) {
    setUploadingHero(true);
    try {
      const resized = await resizeImage(file).catch(() => file);
      const form = new FormData();
      form.append("file", resized);
      form.append("folder", "hero");
      const res = await fetch("/api/admin/blogposts/upload", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          update("hero_image", json.url);
          toast({ type: "success", message: "Hero-Bild hochgeladen." });
        } else {
          toast({ type: "error", message: "Hero-Upload: keine URL in der Antwort." });
        }
      } else {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j.error) msg = j.error;
        } catch {
          try {
            const t = await res.text();
            if (t) msg = t.slice(0, 200);
          } catch {
            // ignore
          }
        }
        if (/bucket|not found|blog-assets/i.test(msg)) {
          toast({
            type: "error",
            message:
              "Hero-Upload fehlgeschlagen: der Supabase-Bucket 'blog-assets' fehlt. Öffne /admin/blogposts für die Setup-Anleitung.",
            duration: 8000,
          });
        } else {
          toast({ type: "error", message: "Hero-Upload fehlgeschlagen: " + msg });
        }
      }
    } catch (err) {
      toast({ type: "error", message: "Netzwerkfehler beim Hero-Upload: " + String(err) });
    } finally {
      setUploadingHero(false);
    }
  }

  async function save() {
    setError("");
    if (!data.title_de.trim()) {
      setError("Deutscher Titel ist erforderlich");
      return;
    }
    if (!data.slug.trim()) {
      setError("Slug ist erforderlich");
      return;
    }
    if (data.status === "scheduled" && !data.publish_at) {
      setError("Bei geplanten Posts musst du ein Datum angeben");
      return;
    }

    setSaving(true);
    try {
      const method = data.id ? "PATCH" : "POST";
      const url = data.id
        ? `/api/admin/blogposts/${data.id}`
        : "/api/admin/blogposts";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg = String(j.error || "Speichern fehlgeschlagen");
        if (/blog_posts|schema cache|relation.*does not exist/i.test(msg)) {
          setError(
            "Die Tabelle 'blog_posts' existiert noch nicht. Geh zurück zur Blogpost-Liste, dort findest du die Setup-Anleitung mit dem SQL zum Kopieren."
          );
        } else {
          setError(msg);
        }
        setSaving(false);
        return;
      }
      router.push("/admin/blogposts");
    } catch {
      setError("Netzwerkfehler");
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!data.id) return;
    const ok = await confirm({
      title: "Diesen Blogpost löschen?",
      body: data.title_de
        ? `«${data.title_de}» wird endgültig entfernt. Das kann nicht rückgängig gemacht werden.`
        : "Der Post wird endgültig entfernt. Das kann nicht rückgängig gemacht werden.",
      confirmLabel: "Endgültig löschen",
      cancelLabel: "Abbrechen",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/blogposts/${data.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast({ type: "success", message: "Blogpost gelöscht." });
      router.push("/admin/blogposts");
    } else {
      toast({ type: "error", message: "Löschen fehlgeschlagen." });
    }
  }

  // Aktuelle Werte fuer den aktiven Tab
  const titleVal = lang === "de" ? data.title_de : data.title_en;
  const titleHighlightVal =
    lang === "de" ? data.title_highlight_de : data.title_highlight_en;
  const badgeVal = lang === "de" ? data.badge_de : data.badge_en;
  const excerptVal = lang === "de" ? data.excerpt_de : data.excerpt_en;
  const readingTimeVal =
    lang === "de" ? data.reading_time_de : data.reading_time_en;
  const metaVal =
    lang === "de" ? data.meta_description_de : data.meta_description_en;

  const enContentEmpty = data.content_html_en.trim().length === 0;

  return (
    <div className="blogpost-form-grid">
      {/* Hauptspalte */}
      <div style={{ minWidth: 0 }}>
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
                  borderBottom: active ? "2px solid #c8553d" : "2px solid transparent",
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
                    title="EN-Version ist leer, auf der Website wird DE angezeigt"
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

        <label style={labelStyle}>Titel {lang === "de" ? "(Deutsch)" : "(English)"}</label>
        <input
          value={titleVal}
          onChange={(e) =>
            lang === "de"
              ? onTitleDeChange(e.target.value)
              : update("title_en", e.target.value)
          }
          placeholder={lang === "de" ? "z.B. Eigenheim finanzieren" : "e.g. Financing your home"}
          style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }}
        />

        <div className="blogpost-row">
          <div>
            <label style={labelStyle}>Titel-Highlight (orange, optional)</label>
            <input
              value={titleHighlightVal}
              onChange={(e) =>
                update(
                  lang === "de" ? "title_highlight_de" : "title_highlight_en",
                  e.target.value
                )
              }
              placeholder={lang === "de" ? "z.B. finanzieren" : "e.g. financing"}
              style={compactInputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Badge</label>
            <input
              value={badgeVal}
              onChange={(e) =>
                update(lang === "de" ? "badge_de" : "badge_en", e.target.value)
              }
              placeholder={lang === "de" ? "z.B. Hypothek" : "e.g. Mortgage"}
              style={compactInputStyle}
            />
          </div>
        </div>

        <label style={labelStyle}>Kurzbeschreibung (Excerpt)</label>
        <textarea
          value={excerptVal}
          onChange={(e) =>
            update(lang === "de" ? "excerpt_de" : "excerpt_en", e.target.value)
          }
          placeholder={
            lang === "de"
              ? "1-2 Sätze für die Blog-Übersicht"
              : "1-2 sentences for the blog overview"
          }
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
        />

        <label style={labelStyle}>Inhalt {lang === "de" ? "(Deutsch)" : "(English)"}</label>
        {/* Beide Editoren sind im DOM, der inaktive ist mit display:none ausgeblendet.
            So verlieren wir keinen Tiptap-State beim Sprachwechsel. */}
        <div style={{ display: lang === "de" ? "block" : "none" }}>
          <BlogPostEditor
            initialHtml={initial.content_html_de}
            onChange={onContentDeChange}
          />
        </div>
        <div style={{ display: lang === "en" ? "block" : "none" }}>
          <BlogPostEditor
            initialHtml={initial.content_html_en}
            onChange={onContentEnChange}
          />
        </div>

        <label style={labelStyle}>Lesezeit ({lang === "de" ? "DE" : "EN"})</label>
        <input
          value={readingTimeVal}
          onChange={(e) =>
            update(
              lang === "de" ? "reading_time_de" : "reading_time_en",
              e.target.value
            )
          }
          style={compactInputStyle}
        />

        <label style={labelStyle}>SEO Meta-Description ({lang === "de" ? "DE" : "EN"})</label>
        <textarea
          value={metaVal}
          onChange={(e) =>
            update(
              lang === "de" ? "meta_description_de" : "meta_description_en",
              e.target.value
            )
          }
          placeholder="Kurzbeschreibung für Google"
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
        />

        {/* Sprachunabhaengige Sektion */}
        <div
          style={{
            marginTop: 30,
            paddingTop: 20,
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#888",
              marginBottom: 4,
            }}
          >
            Für beide Sprachen
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
            Diese Felder gelten für DE und EN gemeinsam.
          </div>

          <label style={labelStyle}>Slug (URL)</label>
          <input
            value={data.slug}
            onChange={(e) => {
              setSlugDirty(true);
              update("slug", slugify(e.target.value));
            }}
            placeholder="ki-finanzwesen"
            style={compactInputStyle}
          />
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            URL: /blog/{data.slug || "…"}, wird automatisch aus dem deutschen Titel
            erzeugt, kann aber überschrieben werden.
          </div>

          <label style={labelStyle}>Hero-Bild</label>
          {data.hero_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.hero_image}
              alt="Hero"
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
                borderRadius: 4,
                marginBottom: 8,
                border: "1px solid #e5e5e5",
              }}
            />
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label
              htmlFor={heroInputId}
              style={{
                ...secondaryButtonStyle,
                cursor: uploadingHero ? "wait" : "pointer",
              }}
            >
              {uploadingHero
                ? "Lade hoch…"
                : data.hero_image
                ? "Ersetzen"
                : "Hochladen"}
            </label>
            {data.hero_image && (
              <button
                type="button"
                onClick={() => update("hero_image", "")}
                style={{ ...secondaryButtonStyle, color: "#c00" }}
              >
                Entfernen
              </button>
            )}
          </div>
          <input
            id={heroInputId}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadHero(f);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            Oder URL direkt eintragen:
          </div>
          <input
            value={data.hero_image}
            onChange={(e) => update("hero_image", e.target.value)}
            placeholder="https://…"
            style={{ ...compactInputStyle, marginTop: 4 }}
          />
        </div>
      </div>

      {/* Seitenleiste */}
      <div className="blogpost-sidebar">
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 6,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            Publikation
          </div>

          {(["draft", "published", "scheduled"] as const).map((s) => {
            const labels = {
              draft: "Als Entwurf speichern",
              published: "Sofort veröffentlichen",
              scheduled: "Planen",
            };
            return (
              <label
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                <input
                  type="radio"
                  checked={data.status === s}
                  onChange={() => update("status", s)}
                  style={{ width: 18, height: 18 }}
                />
                {labels[s]}
              </label>
            );
          })}

          {data.status === "scheduled" && (
            <div style={{ marginTop: 8 }}>
              <label style={{ ...labelStyle, marginTop: 4 }}>
                Geplantes Datum und Uhrzeit
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <input
                  type="date"
                  value={(() => {
                    if (!data.publish_at) return "";
                    const d = new Date(data.publish_at);
                    if (isNaN(d.getTime())) return "";
                    const pad = (n: number) => String(n).padStart(2, "0");
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                      d.getDate()
                    )}`;
                  })()}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (!newDate) {
                      update("publish_at", null);
                      return;
                    }
                    const current = data.publish_at
                      ? new Date(data.publish_at)
                      : null;
                    const hh =
                      current && !isNaN(current.getTime())
                        ? current.getHours()
                        : 9;
                    const mm =
                      current && !isNaN(current.getTime())
                        ? current.getMinutes()
                        : 0;
                    const [y, m, d] = newDate.split("-").map(Number);
                    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
                    update("publish_at", dt.toISOString());
                  }}
                  style={compactInputStyle}
                />
                <input
                  type="time"
                  value={(() => {
                    if (!data.publish_at) return "";
                    const d = new Date(data.publish_at);
                    if (isNaN(d.getTime())) return "";
                    const pad = (n: number) => String(n).padStart(2, "0");
                    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  })()}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    if (!newTime) return;
                    const [hh, mm] = newTime.split(":").map(Number);
                    const base = data.publish_at
                      ? new Date(data.publish_at)
                      : new Date();
                    base.setHours(hh || 0, mm || 0, 0, 0);
                    update("publish_at", base.toISOString());
                  }}
                  style={compactInputStyle}
                />
              </div>
            </div>
          )}

          {enContentEmpty && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                background: "rgba(255,193,7,0.1)",
                border: "1px solid rgba(255,193,7,0.3)",
                borderRadius: 4,
                fontSize: 12,
                color: "#856404",
                lineHeight: 1.5,
              }}
            >
              Englische Version ist leer. EN-Besucher sehen die deutsche
              Version als Fallback.
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#c00",
                fontSize: 13,
                marginTop: 12,
                padding: "10px 12px",
                background: "rgba(239,68,68,0.08)",
                borderRadius: 4,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "12px 0",
              background: "#c8553d",
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

          {data.slug && data.id && (
            <a
              href={`/blog/${data.slug}`}
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
          )}

          {data.id && (
            <button
              type="button"
              onClick={deletePost}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "10px 0",
                background: "#fff",
                color: "#c00",
                border: "1px solid #f2caca",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Post löschen
            </button>
          )}
        </div>
      </div>

      <style>{`
        .blogpost-form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 20px;
          align-items: start;
        }
        .blogpost-sidebar {
          position: sticky;
          top: 16px;
        }
        .blogpost-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 860px) {
          .blogpost-form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .blogpost-sidebar {
            position: static;
          }
          .blogpost-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
