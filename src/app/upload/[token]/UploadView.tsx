"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type Lang = "de" | "en";

const COPY = {
  de: {
    badge: "Sicheres Upload-Portal",
    titlePre: "Ihre",
    titleHl: "Dokumente hochladen",
    intro: "Laden Sie hier sicher und verschlüsselt Ihre Unterlagen hoch. Wir verarbeiten nur die für Ihre Anfrage notwendigen Dokumente.",
    welcomeFor: "Hochladen für:",
    expires: "Link gültig bis:",
    progress: "{done} von {total} Kategorien hochgeladen",
    dragHere: "Datei hier ablegen oder klicken zum Auswählen",
    dragHereActive: "Datei loslassen…",
    accepted: "Akzeptiert: PDF, JPG, PNG (max. 25 MB pro Datei)",
    uploaded: "Hochgeladen",
    upload: "Hochladen",
    uploading: "Wird hochgeladen…",
    delete: "Entfernen",
    fileTooBig: "Datei zu gross (max. 25 MB)",
    invalidType: "Ungültiger Dateityp. Erlaubt: PDF, JPG, PNG",
    uploadError: "Upload fehlgeschlagen. Bitte erneut versuchen.",
    optionalLabel: "Weitere Dokumente (optional)",
    optionalDesc: "Falls Sie zusätzliche Unterlagen senden möchten, die nicht in der Liste sind.",
    helpHeader: "Brauchen Sie Hilfe?",
    helpDesc: "Bei Fragen erreichen Sie uns unter info@hyponova.ch oder +41 79 249 70 90.",
    homeBtn: "← Zur Startseite",
  },
  en: {
    badge: "Secure upload portal",
    titlePre: "Upload your",
    titleHl: "documents",
    intro: "Upload your documents here securely and encrypted. We only process the documents necessary for your request.",
    welcomeFor: "Uploading for:",
    expires: "Link valid until:",
    progress: "{done} of {total} categories uploaded",
    dragHere: "Drop file here or click to select",
    dragHereActive: "Drop file…",
    accepted: "Accepted: PDF, JPG, PNG (max. 25 MB per file)",
    uploaded: "Uploaded",
    upload: "Upload",
    uploading: "Uploading…",
    delete: "Remove",
    fileTooBig: "File too large (max. 25 MB)",
    invalidType: "Invalid file type. Allowed: PDF, JPG, PNG",
    uploadError: "Upload failed. Please try again.",
    optionalLabel: "Additional documents (optional)",
    optionalDesc: "If you want to send additional documents not in the list.",
    helpHeader: "Need help?",
    helpDesc: "Contact us at info@hyponova.ch or +41 79 249 70 90 with any questions.",
    homeBtn: "← Back to homepage",
  },
} as const;

const ACCENT = "#c8553d";
const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

interface ExistingDoc {
  id: string;
  category: string | null;
  file_name: string;
  file_size: number | null;
  uploaded_at: string | null;
  status: string;
}

interface Props {
  token: string;
  lang: Lang;
  leadName: string;
  categories: { key: string; label: string }[];
  existingDocuments: ExistingDoc[];
  expiresAt: string;
}

function formatBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "de" ? "de-CH" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function UploadView({ token, lang, leadName, categories, existingDocuments, expiresAt }: Props) {
  const t = COPY[lang];
  const [docs, setDocs] = useState<ExistingDoc[]>(existingDocuments);
  const [uploadingCat, setUploadingCat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filledCategories = new Set(docs.map((d) => d.category).filter(Boolean) as string[]);
  const requiredFilled = categories.filter((c) => filledCategories.has(c.key)).length;
  const total = categories.length;

  async function uploadFile(file: File, category: string | null) {
    setError(null);
    if (file.size > MAX_SIZE) { setError(t.fileTooBig); return; }
    if (!ACCEPTED_TYPES.includes(file.type)) { setError(t.invalidType); return; }
    setUploadingCat(category || "__optional__");
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (category) fd.append("category", category);
      const res = await fetch(`/api/public/upload/${token}`, { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || t.uploadError); }
      const json = await res.json();
      setDocs((prev) => [json.document, ...prev]);
    } catch (e: any) {
      setError(e.message || t.uploadError);
    } finally {
      setUploadingCat(null);
    }
  }

  async function deleteDoc(id: string) {
    if (!confirm(lang === "de" ? "Wirklich entfernen?" : "Really remove?")) return;
    const res = await fetch(`/api/public/upload/${token}?docId=${id}`, { method: "DELETE" });
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div style={{ background: "#f7f5f2", minHeight: "calc(100vh - 200px)", padding: "60px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}66`, borderRadius: 0, marginBottom: 16, background: `${ACCENT}0d` }}>{t.badge}</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", margin: "0 0 12px" }}>
            {t.titlePre} <span style={{ color: ACCENT }}>{t.titleHl}</span>
          </h1>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>{t.intro}</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 0, padding: "20px 24px", border: "1px solid #e5e5e5", marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#888" }}>{t.welcomeFor}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>{leadName}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#888" }}>{t.expires}</div>
            <div style={{ fontSize: 14, color: "#1a1a1a" }}>{formatDate(expiresAt, lang)}</div>
          </div>
        </div>

        {total > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 6 }}>
              <span>{t.progress.replace("{done}", String(requiredFilled)).replace("{total}", String(total))}</span>
              <span>{Math.round((requiredFilled / total) * 100)}%</span>
            </div>
            <div style={{ height: 6, background: "#e5e5e5", borderRadius: 0, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(requiredFilled / total) * 100}%`, background: ACCENT, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", color: "#c00", borderRadius: 0, fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {categories.map((cat) => {
            const filed = docs.filter((d) => d.category === cat.key);
            return <CategoryRow key={cat.key} t={t} cat={cat} files={filed} onUpload={(f) => uploadFile(f, cat.key)} onDelete={deleteDoc} uploading={uploadingCat === cat.key} />;
          })}
        </div>

        <div style={{ marginTop: 32, padding: 20, background: "#fff", borderRadius: 0, border: "1px solid #e5e5e5" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px", color: "#1a1a1a" }}>{t.optionalLabel}</h3>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>{t.optionalDesc}</p>
          <CategoryRow t={t} cat={{ key: "__optional__", label: "" }} files={docs.filter((d) => !d.category)} onUpload={(f) => uploadFile(f, null)} onDelete={deleteDoc} uploading={uploadingCat === "__optional__"} hideHeader />
        </div>

        <div style={{ marginTop: 32, padding: 20, background: "#1a1a1a", color: "#fff", borderRadius: 0, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t.helpHeader}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{t.helpDesc}</div>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#999" }}>
          <Link href="/" style={{ color: "#999", textDecoration: "none" }}>{t.homeBtn}</Link>
        </p>
      </div>
    </div>
  );
}

function CategoryRow({ t, cat, files, onUpload, onDelete, uploading, hideHeader }: { t: any; cat: { key: string; label: string }; files: ExistingDoc[]; onUpload: (f: File) => void; onDelete: (id: string) => void; uploading: boolean; hideHeader?: boolean }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const has = files.length > 0;

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onUpload(f);
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
    e.target.value = "";
  }

  return (
    <div style={{ background: hideHeader ? "transparent" : "#fff", borderRadius: hideHeader ? 0 : 12, padding: hideHeader ? 0 : 16, border: hideHeader ? "none" : "1px solid #e5e5e5" }}>
      {!hideHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{cat.label}</div>
          {has && <span style={{ fontSize: 11, padding: "3px 8px", background: "#dcfce7", color: "#166534", borderRadius: 0, fontWeight: 600 }}>✓ {t.uploaded}</span>}
        </div>
      )}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {files.map((f) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f7f5f2", borderRadius: 0, fontSize: 13 }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>📄 {f.file_name} <span style={{ color: "#888" }}>· {formatBytes(f.file_size)}</span></div>
              <button type="button" onClick={() => onDelete(f.id)} style={{ padding: "4px 10px", background: "transparent", border: "none", color: "#c00", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>× {t.delete}</button>
            </div>
          ))}
        </div>
      )}
      <label htmlFor={`f-${cat.key}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{ display: "block", padding: "20px 16px", textAlign: "center", border: `2px dashed ${dragOver ? ACCENT : "#d4d4d4"}`, background: dragOver ? `${ACCENT}0d` : "#fafafa", borderRadius: 0, cursor: uploading ? "wait" : "pointer", transition: "all 0.15s" }}>
        <div style={{ fontSize: 13, color: "#666" }}>
          {uploading ? t.uploading : (dragOver ? t.dragHereActive : t.dragHere)}
        </div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{t.accepted}</div>
      </label>
      <input id={`f-${cat.key}`} ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onChange} style={{ display: "none" }} disabled={uploading} />
    </div>
  );
}
