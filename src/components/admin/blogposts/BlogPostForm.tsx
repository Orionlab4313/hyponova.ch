"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import BlogPostEditor from "./BlogPostEditor";
import { resizeImage } from "./imageResize";

export interface BlogPostFormData {
  id?: string;
  title: string;
  title_highlight: string;
  badge: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  content_html: string;
  reading_time: string;
  status: "draft" | "published" | "scheduled";
  publish_at: string | null;
  meta_description: string;
}

interface Props {
  initial: BlogPostFormData;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

// Alle Inputs mit fontSize: 16 — sonst zoomt iOS Safari beim Fokus automatisch rein.
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
  fontSize: 16, // iOS-Zoom-Fix
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugDirty, setSlugDirty] = useState(!!initial.slug);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputId = useId();

  function update<K extends keyof BlogPostFormData>(
    key: K,
    value: BlogPostFormData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function onTitleChange(v: string) {
    update("title", v);
    if (!slugDirty) update("slug", slugify(v));
  }

  function onContentChange(html: string) {
    setData((prev) => ({
      ...prev,
      content_html: html,
      reading_time: computeReadingTime(html),
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
        if (json.url) update("hero_image", json.url);
        else alert("Hero-Upload: keine URL in der Antwort");
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
          alert(
            "Hero-Upload fehlgeschlagen: der Supabase-Bucket 'blog-assets' existiert noch nicht. Öffne /admin/blogposts, dort wird die Setup-Anleitung mit SQL angezeigt."
          );
        } else {
          alert("Hero-Upload fehlgeschlagen: " + msg);
        }
      }
    } catch (err) {
      alert("Hero-Upload Netzwerkfehler: " + String(err));
    } finally {
      setUploadingHero(false);
    }
  }

  async function save() {
    setError("");
    if (!data.title.trim()) {
      setError("Titel ist erforderlich");
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
    if (!confirm("Diesen Post wirklich löschen?")) return;
    const res = await fetch(`/api/admin/blogposts/${data.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/blogposts");
    } else {
      alert("Löschen fehlgeschlagen");
    }
  }

  return (
    <div className="blogpost-form-grid">
      {/* Hauptspalte */}
      <div style={{ minWidth: 0 }}>
        <label style={labelStyle}>Titel</label>
        <input
          value={data.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="z.B. KI im Finanzwesen"
          style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }}
        />

        <div className="blogpost-row">
          <div>
            <label style={labelStyle}>Titel-Highlight (violett, optional)</label>
            <input
              value={data.title_highlight}
              onChange={(e) => update("title_highlight", e.target.value)}
              placeholder="z.B. Finanzwesen"
              style={compactInputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Badge</label>
            <input
              value={data.badge}
              onChange={(e) => update("badge", e.target.value)}
              placeholder="z.B. Finanzwesen"
              style={compactInputStyle}
            />
          </div>
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
          URL: /blog/{data.slug || "…"}
        </div>

        <label style={labelStyle}>Kurzbeschreibung (Excerpt)</label>
        <textarea
          value={data.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          placeholder="1–2 Sätze für die Blog-Übersicht"
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
        />

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
          <label htmlFor={heroInputId} style={{ ...secondaryButtonStyle, cursor: uploadingHero ? "wait" : "pointer" }}>
            {uploadingHero ? "Lade hoch…" : data.hero_image ? "Ersetzen" : "Hochladen"}
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

        <label style={labelStyle}>Inhalt</label>
        <BlogPostEditor
          initialHtml={initial.content_html}
          onChange={onContentChange}
        />
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
                    // Bestehende Zeit übernehmen, sonst 09:00
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
                    // Bestehendes Datum übernehmen, sonst heute
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

          <label style={labelStyle}>Lesezeit</label>
          <input
            value={data.reading_time}
            onChange={(e) => update("reading_time", e.target.value)}
            style={compactInputStyle}
          />

          <label style={labelStyle}>SEO Meta-Description (optional)</label>
          <textarea
            value={data.meta_description}
            onChange={(e) => update("meta_description", e.target.value)}
            placeholder="Kurzbeschreibung für Google"
            style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          />

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
