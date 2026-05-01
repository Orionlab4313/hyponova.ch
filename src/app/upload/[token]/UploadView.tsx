"use client";

import { useState } from "react";
import Link from "next/link";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type Lang = "de" | "en";

const COPY = {
  de: {
    badge: "Sicheres Upload-Portal",
    titlePre: "Ihre",
    titleHl: "Dokumente hochladen",
    intro: "Wählen Sie für jede Kategorie die passende Datei aus. Wenn Sie alle gewünschten Dokumente bereit haben, klicken Sie unten auf «Alle Dokumente hochladen».",
    welcomeFor: "Hochladen für:",
    expires: "Link gültig bis:",
    progress: "{done} von {total} Kategorien hochgeladen",
    dragHere: "Datei hier ablegen oder klicken zum Auswählen",
    dragHereActive: "Datei loslassen…",
    accepted: "Akzeptiert: PDF, JPG, PNG (max. 25 MB pro Datei)",
    uploaded: "Hochgeladen",
    pending: "Bereit zum Hochladen",
    upload: "Alle Dokumente hochladen",
    uploadCountSuffix: "Datei",
    uploadCountSuffixPlural: "Dateien",
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
    successTitle: "Vielen Dank!",
    successDescOne: "Wir haben Ihre Unterlage erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.",
    successDescMany: "Wir haben Ihre {n} Unterlagen erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.",
    successUploadMore: "Weitere Dokumente hochladen",
    successHome: "Zur Startseite",
    confirmRemovePending: "Diese Datei aus der Auswahl entfernen?",
    confirmRemovePendingBody: "Sie können sie danach jederzeit erneut auswählen.",
    confirmRemoveUploaded: "Hochgeladene Datei entfernen?",
    confirmRemoveUploadedBody: "Diese Datei wird endgültig gelöscht und ist danach nicht mehr verfügbar.",
    confirmRemoveLabel: "Entfernen",
    confirmCancelLabel: "Abbrechen",
    toastFileRemoved: "Datei entfernt.",
    toastDeleteFailed: "Datei konnte nicht gelöscht werden.",
    progressBarTitle: "Werden hochgeladen…",
  },
  en: {
    badge: "Secure upload portal",
    titlePre: "Upload your",
    titleHl: "documents",
    intro: "Select the matching file for each category. When you have all the documents ready, click «Upload all documents» below.",
    welcomeFor: "Uploading for:",
    expires: "Link valid until:",
    progress: "{done} of {total} categories uploaded",
    dragHere: "Drop file here or click to select",
    dragHereActive: "Drop file…",
    accepted: "Accepted: PDF, JPG, PNG (max. 25 MB per file)",
    uploaded: "Uploaded",
    pending: "Ready to upload",
    upload: "Upload all documents",
    uploadCountSuffix: "file",
    uploadCountSuffixPlural: "files",
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
    successTitle: "Thank you!",
    successDescOne: "We have received your document and will contact you within 24 hours.",
    successDescMany: "We have received your {n} documents and will contact you within 24 hours.",
    successUploadMore: "Upload more documents",
    successHome: "Back to homepage",
    confirmRemovePending: "Remove this file from the selection?",
    confirmRemovePendingBody: "You can select it again at any time.",
    confirmRemoveUploaded: "Delete uploaded file?",
    confirmRemoveUploadedBody: "This file will be permanently deleted and no longer available.",
    confirmRemoveLabel: "Remove",
    confirmCancelLabel: "Cancel",
    toastFileRemoved: "File removed.",
    toastDeleteFailed: "Failed to delete file.",
    progressBarTitle: "Uploading…",
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

interface PendingFile {
  id: string;
  file: File;
  category: string | null;
  error?: string;
}

interface Props {
  token: string;
  lang: Lang;
  leadName: string;
  categories: { key: string; label: string }[];
  existingDocuments: ExistingDoc[];
  expiresAt: string;
}

const OPTIONAL_KEY = "__optional__";

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
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<"form" | "success">("form");
  const [lastUploadedCount, setLastUploadedCount] = useState(0);
  const confirm = useConfirm();
  const toast = useToast();

  const filledCategories = new Set(docs.map((d) => d.category).filter(Boolean) as string[]);
  const requiredFilled = categories.filter((c) => filledCategories.has(c.key)).length;
  const total = categories.length;

  function addPending(file: File, category: string | null) {
    setError(null);
    if (file.size > MAX_SIZE) { setError(`«${file.name}»: ${t.fileTooBig}`); return; }
    if (!ACCEPTED_TYPES.includes(file.type)) { setError(`«${file.name}»: ${t.invalidType}`); return; }
    const id = `pf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPending((prev) => [...prev, { id, file, category }]);
  }

  async function removePending(id: string) {
    const ok = await confirm({
      title: t.confirmRemovePending,
      body: t.confirmRemovePendingBody,
      confirmLabel: t.confirmRemoveLabel,
      cancelLabel: t.confirmCancelLabel,
      danger: true,
    });
    if (!ok) return;
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  async function deleteDoc(id: string) {
    const ok = await confirm({
      title: t.confirmRemoveUploaded,
      body: t.confirmRemoveUploadedBody,
      confirmLabel: t.confirmRemoveLabel,
      cancelLabel: t.confirmCancelLabel,
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/public/upload/${token}?docId=${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast({ type: "success", message: t.toastFileRemoved });
    } else {
      toast({ type: "error", message: t.toastDeleteFailed });
    }
  }

  async function uploadAll() {
    if (pending.length === 0) return;
    setUploading(true);
    setError(null);
    setUploadProgress({ done: 0, total: pending.length });

    const succeeded: ExistingDoc[] = [];
    const failed: PendingFile[] = [];
    let done = 0;

    for (const pf of pending) {
      try {
        const fd = new FormData();
        fd.append("file", pf.file);
        if (pf.category) fd.append("category", pf.category);
        const res = await fetch(`/api/public/upload/${token}`, { method: "POST", body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          failed.push({ ...pf, error: j.error || t.uploadError });
        } else {
          const json = await res.json();
          succeeded.push(json.document);
        }
      } catch {
        failed.push({ ...pf, error: t.uploadError });
      }
      done += 1;
      setUploadProgress({ done, total: pending.length });
    }

    setUploading(false);
    setUploadProgress(null);

    if (succeeded.length > 0) {
      setDocs((prev) => [...succeeded, ...prev]);
    }

    if (failed.length === 0) {
      setPending([]);
      setLastUploadedCount(succeeded.length);
      setScreen("success");
    } else {
      // Nur fehlgeschlagene bleiben zurueck — User kann erneut versuchen
      setPending(failed);
      setError(`${failed.length} ${failed.length === 1 ? t.uploadCountSuffix : t.uploadCountSuffixPlural} konnte${failed.length === 1 ? "" : "n"} nicht hochgeladen werden.`);
    }
  }

  if (screen === "success") {
    return <SuccessScreen t={t} count={lastUploadedCount} onBack={() => setScreen("form")} />;
  }

  return (
    <div style={{ background: "#f7f5f2", minHeight: "calc(100vh - 200px)", padding: "60px 20px 120px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}66`, marginBottom: 16, background: `${ACCENT}0d` }}>{t.badge}</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.15, color: "#1a1a1a", margin: "0 0 12px" }}>
            {t.titlePre} <span style={{ color: ACCENT }}>{t.titleHl}</span>
          </h1>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>{t.intro}</p>
        </div>

        <div style={{ background: "#fff", padding: "20px 24px", border: "1px solid #e5e5e5", marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
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
            <div style={{ height: 6, background: "#e5e5e5", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(requiredFilled / total) * 100}%`, background: ACCENT, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", color: "#c00", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {categories.map((cat) => {
            const filed = docs.filter((d) => d.category === cat.key);
            const pendingForCat = pending.filter((p) => p.category === cat.key);
            return <CategoryRow key={cat.key} t={t} cat={cat} files={filed} pending={pendingForCat} onAddPending={(f) => addPending(f, cat.key)} onDeleteUploaded={deleteDoc} onRemovePending={removePending} disabled={uploading} />;
          })}
        </div>

        <div style={{ marginTop: 32, padding: 20, background: "#fff", border: "1px solid #e5e5e5" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px", color: "#1a1a1a" }}>{t.optionalLabel}</h3>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>{t.optionalDesc}</p>
          <CategoryRow
            t={t}
            cat={{ key: OPTIONAL_KEY, label: "" }}
            files={docs.filter((d) => !d.category)}
            pending={pending.filter((p) => !p.category)}
            onAddPending={(f) => addPending(f, null)}
            onDeleteUploaded={deleteDoc}
            onRemovePending={removePending}
            disabled={uploading}
            hideHeader
          />
        </div>

        <div style={{ marginTop: 32, padding: 20, background: "#1a1a1a", color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t.helpHeader}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{t.helpDesc}</div>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#999" }}>
          <Link href="/" style={{ color: "#999", textDecoration: "none" }}>{t.homeBtn}</Link>
        </p>
      </div>

      {/* Floating Submit-Bar — nur wenn Pending Files vorhanden */}
      {pending.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1a1a1a", color: "#fff", padding: "16px 20px", boxShadow: "0 -4px 24px rgba(0,0,0,0.15)", zIndex: 50 }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 200 }}>
              {uploading && uploadProgress ? (
                <>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{t.progressBarTitle} {uploadProgress.done}/{uploadProgress.total}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.15)", width: 240 }}>
                    <div style={{ height: "100%", background: ACCENT, width: `${(uploadProgress.done / uploadProgress.total) * 100}%`, transition: "width 0.2s" }} />
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {pending.length} {pending.length === 1 ? t.uploadCountSuffix : t.uploadCountSuffixPlural} {t.pending.toLowerCase()}
                </div>
              )}
            </div>
            <button type="button" onClick={uploadAll} disabled={uploading} style={{ padding: "12px 28px", background: ACCENT, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.6 : 1, minWidth: 200 }}>
              {uploading ? t.uploading : `${t.upload} (${pending.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ t, cat, files, pending, onAddPending, onDeleteUploaded, onRemovePending, disabled, hideHeader }: { t: any; cat: { key: string; label: string }; files: ExistingDoc[]; pending: PendingFile[]; onAddPending: (f: File) => void; onDeleteUploaded: (id: string) => void; onRemovePending: (id: string) => void; disabled: boolean; hideHeader?: boolean }) {
  const [dragOver, setDragOver] = useState(false);
  const has = files.length > 0;
  const hasPending = pending.length > 0;

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    dropped.forEach((f) => onAddPending(f));
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => onAddPending(f));
    e.target.value = "";
  }

  return (
    <div style={{ background: hideHeader ? "transparent" : "#fff", padding: hideHeader ? 0 : 16, border: hideHeader ? "none" : "1px solid #e5e5e5" }}>
      {!hideHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{cat.label}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {has && <span style={{ fontSize: 11, padding: "3px 8px", background: "#dcfce7", color: "#166534", fontWeight: 600 }}>✓ {t.uploaded}</span>}
            {hasPending && <span style={{ fontSize: 11, padding: "3px 8px", background: "#fef3c7", color: "#92400e", fontWeight: 600 }}>{t.pending}</span>}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: hasPending ? 6 : 10 }}>
          {files.map((f) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f7f5f2", fontSize: 13, gap: 8, flexWrap: "wrap" }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>📄 {f.file_name} <span style={{ color: "#888" }}>· {formatBytes(f.file_size)}</span></div>
              <button type="button" onClick={() => onDeleteUploaded(f.id)} disabled={disabled} style={{ padding: "4px 10px", background: "transparent", border: "none", color: "#c00", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>× {t.delete}</button>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {pending.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fffbeb", border: "1px dashed #fcd34d", fontSize: 13, gap: 8, flexWrap: "wrap" }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                ⏳ {p.file.name} <span style={{ color: "#92400e" }}>· {formatBytes(p.file.size)}</span>
                {p.error && <span style={{ color: "#c00", marginLeft: 8 }}>· {p.error}</span>}
              </div>
              <button type="button" onClick={() => onRemovePending(p.id)} disabled={disabled} style={{ padding: "4px 10px", background: "transparent", border: "none", color: "#92400e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>× {t.delete}</button>
            </div>
          ))}
        </div>
      )}

      <label htmlFor={`f-${cat.key}`}
        onDragOver={(e) => { if (!disabled) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => !disabled && onDrop(e)}
        style={{ display: "block", padding: "20px 16px", textAlign: "center", border: `2px dashed ${dragOver ? ACCENT : "#d4d4d4"}`, background: dragOver ? `${ACCENT}0d` : "#fafafa", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", opacity: disabled ? 0.5 : 1 }}>
        <div style={{ fontSize: 13, color: "#666" }}>
          {dragOver ? t.dragHereActive : t.dragHere}
        </div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{t.accepted}</div>
      </label>
      <input id={`f-${cat.key}`} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onChange} style={{ display: "none" }} disabled={disabled} multiple />
    </div>
  );
}

function SuccessScreen({ t, count, onBack }: { t: any; count: number; onBack: () => void }) {
  const desc = count === 1 ? t.successDescOne : t.successDescMany.replace("{n}", String(count));
  return (
    <div style={{ background: "#f7f5f2", minHeight: "calc(100vh - 200px)", padding: "80px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "#dcfce7", color: "#166534", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 24, fontWeight: 700 }}>✓</div>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: "#1a1a1a", margin: "0 0 14px" }}>{t.successTitle}</h1>
        <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, margin: "0 0 32px" }}>{desc}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "14px 28px", background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>{t.successHome}</Link>
          <button type="button" onClick={onBack} style={{ padding: "14px 28px", background: "#fff", color: "#666", border: "1px solid #ddd", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t.successUploadMore}</button>
        </div>
      </div>
    </div>
  );
}
