"use client";

import { useEffect, useId, useState } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { IconUpload, IconDownload, IconPencil, IconPlus, IconX } from "@/components/admin/AdminIcons";

type Kategorie = "abloesung" | "neukauf" | "beide";

interface Vorlage {
  id: string;
  name_de: string;
  name_en: string;
  description_de: string | null;
  description_en: string | null;
  kategorie: Kategorie;
  file_url: string;
  file_name: string;
  file_size: number | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const KATEGORIE_LABELS: Record<Kategorie, string> = {
  abloesung: "Ablösung",
  neukauf: "Neukauf",
  beide: "Beide Workflows",
};

const KATEGORIE_COLORS: Record<Kategorie, { bg: string; color: string }> = {
  abloesung: { bg: "#fee2e2", color: "#7f1d1d" },
  neukauf: { bg: "#dbeafe", color: "#1e3a8a" },
  beide: { bg: "#f3e8ff", color: "#581c87" },
};

function formatBytes(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface FormData {
  id?: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  kategorie: Kategorie;
  file_url: string;
  file_name: string;
  file_size: number | null;
  sort_order: number;
  active: boolean;
}

const emptyForm: FormData = {
  name_de: "",
  name_en: "",
  description_de: "",
  description_en: "",
  kategorie: "beide",
  file_url: "",
  file_name: "",
  file_size: null,
  sort_order: 0,
  active: true,
};

export default function VorlagenPage() {
  const [vorlagen, setVorlagen] = useState<Vorlage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Kategorie>("all");
  const [editing, setEditing] = useState<FormData | null>(null);
  const [savingId, setSavingId] = useState<string | "new" | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  function load() {
    setLoading(true);
    fetch("/api/admin/vorlagen")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setVorlagen(d))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing({ ...emptyForm });
  }

  function openEdit(v: Vorlage) {
    setEditing({
      id: v.id,
      name_de: v.name_de,
      name_en: v.name_en || "",
      description_de: v.description_de || "",
      description_en: v.description_en || "",
      kategorie: v.kategorie,
      file_url: v.file_url,
      file_name: v.file_name,
      file_size: v.file_size,
      sort_order: v.sort_order,
      active: v.active,
    });
  }

  async function save() {
    if (!editing) return;
    if (!editing.name_de.trim()) {
      toast({ type: "error", message: "Name (DE) ist erforderlich." });
      return;
    }
    if (!editing.file_url) {
      toast({ type: "error", message: "Bitte zuerst eine PDF-Datei hochladen." });
      return;
    }

    const id = editing.id || "new";
    setSavingId(id);
    try {
      const url = editing.id ? `/api/admin/vorlagen/${editing.id}` : "/api/admin/vorlagen";
      const method = editing.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        toast({ type: "success", message: editing.id ? "Vorlage aktualisiert." : "Vorlage erstellt." });
        setEditing(null);
        load();
      } else {
        const j = await res.json().catch(() => ({}));
        toast({ type: "error", message: j.error || "Speichern fehlgeschlagen." });
      }
    } catch {
      toast({ type: "error", message: "Netzwerkfehler beim Speichern." });
    } finally {
      setSavingId(null);
    }
  }

  async function deleteVorlage(v: Vorlage) {
    const ok = await confirm({
      title: `«${v.name_de}» löschen?`,
      body: "Die Vorlage wird endgültig entfernt und Kunden können sie nicht mehr herunterladen. Das kann nicht rückgängig gemacht werden.",
      confirmLabel: "Endgültig löschen",
      cancelLabel: "Abbrechen",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/vorlagen/${v.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ type: "success", message: "Vorlage gelöscht." });
      load();
    } else {
      toast({ type: "error", message: "Löschen fehlgeschlagen." });
    }
  }

  async function toggleActive(v: Vorlage) {
    const res = await fetch(`/api/admin/vorlagen/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !v.active }),
    });
    if (res.ok) {
      toast({ type: "success", message: v.active ? "Vorlage deaktiviert." : "Vorlage aktiviert." });
      load();
    } else {
      toast({ type: "error", message: "Status konnte nicht geändert werden." });
    }
  }

  const filtered = filter === "all" ? vorlagen : vorlagen.filter((v) => v.kategorie === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dokument-Vorlagen</h1>
          <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
            PDFs (Vollmacht, Mandatsvereinbarung etc.) die Kunden im Workflow herunterladen können.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#c8553d", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          <IconPlus size={14} /> Neue Vorlage
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {([
          ["all", `Alle (${vorlagen.length})`],
          ["abloesung", `Ablösung (${vorlagen.filter((v) => v.kategorie === "abloesung" || v.kategorie === "beide").length})`],
          ["neukauf", `Neukauf (${vorlagen.filter((v) => v.kategorie === "neukauf" || v.kategorie === "beide").length})`],
          ["beide", `Beide (${vorlagen.filter((v) => v.kategorie === "beide").length})`],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k as any)}
            style={{
              padding: "6px 12px",
              background: filter === k ? "#c8553d" : "#fff",
              color: filter === k ? "#fff" : "#333",
              border: `1px solid ${filter === k ? "#c8553d" : "#ddd"}`,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Laden…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fff", border: "1px solid #e5e5e5" }}>
          {vorlagen.length === 0
            ? "Noch keine Vorlagen — leg deine erste an (z.B. die Vollmacht vom Anwalt)."
            : "Keine Vorlagen in dieser Kategorie."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((v) => {
            const cat = KATEGORIE_COLORS[v.kategorie];
            return (
              <div key={v.id} style={{ display: "flex", background: "#fff", border: "1px solid #e5e5e5", padding: 14, gap: 12, alignItems: "stretch", flexWrap: "wrap", opacity: v.active ? 1 : 0.55 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, padding: "3px 8px", background: cat.bg, color: cat.color, fontWeight: 600 }}>
                      {KATEGORIE_LABELS[v.kategorie]}
                    </span>
                    {!v.active && (
                      <span style={{ fontSize: 11, padding: "3px 8px", background: "#f5f5f5", color: "#666" }}>
                        Deaktiviert
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{v.name_de}</div>
                  {v.name_en && v.name_en !== v.name_de && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>EN: {v.name_en}</div>
                  )}
                  {v.description_de && (
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.5 }}>{v.description_de}</div>
                  )}
                  <div style={{ fontSize: 11, color: "#888", marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>{v.file_name}</span>
                    <span>· {formatBytes(v.file_size)}</span>
                    <span>· Reihenfolge: {v.sort_order}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                  <a
                    href={v.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="PDF öffnen"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "transparent", color: "#444", border: "1px solid #ddd", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" }}
                  >
                    <IconDownload size={13} /> PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleActive(v)}
                    style={{ padding: "6px 10px", background: "transparent", color: "#444", border: "1px solid #ddd", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {v.active ? "Deaktivieren" : "Aktivieren"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(v)}
                    title="Bearbeiten"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "transparent", color: "#444", border: "1px solid #ddd", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <IconPencil size={13} /> Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteVorlage(v)}
                    title="Löschen"
                    style={{ padding: "6px 10px", background: "transparent", color: "#c00", border: "1px solid transparent", fontSize: 18, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <EditModal
          data={editing}
          onChange={(d) => setEditing(d)}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={savingId !== null}
        />
      )}
    </div>
  );
}

function EditModal({
  data,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  data: FormData;
  onChange: (d: FormData) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const fileId = useId();
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/vorlagen/upload", { method: "POST", body: fd });
      if (res.ok) {
        const j = await res.json();
        onChange({
          ...data,
          file_url: j.url,
          file_name: j.file_name,
          file_size: j.file_size,
        });
        toast({ type: "success", message: "PDF hochgeladen." });
      } else {
        const j = await res.json().catch(() => ({}));
        toast({ type: "error", message: j.error || "Upload fehlgeschlagen." });
      }
    } catch {
      toast({ type: "error", message: "Netzwerkfehler beim Upload." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto", padding: "24px 28px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{data.id ? "Vorlage bearbeiten" : "Neue Vorlage"}</h2>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", padding: 4, display: "inline-flex", alignItems: "center" }} aria-label="Schliessen">
            <IconX size={18} />
          </button>
        </div>

        <Field label="Name (Deutsch) *">
          <input
            value={data.name_de}
            onChange={(e) => onChange({ ...data, name_de: e.target.value })}
            placeholder="z.B. Vollmacht zur Konditionsabfrage"
            style={inp}
          />
        </Field>

        <Field label="Name (Englisch)">
          <input
            value={data.name_en}
            onChange={(e) => onChange({ ...data, name_en: e.target.value })}
            placeholder="e.g. Power of attorney for rate inquiry"
            style={inp}
          />
        </Field>

        <Field label="Beschreibung (Deutsch)">
          <textarea
            value={data.description_de}
            onChange={(e) => onChange({ ...data, description_de: e.target.value })}
            placeholder="Kurze Beschreibung — was ist das Dokument, wofür wird es benötigt?"
            rows={2}
            style={{ ...inp, resize: "vertical", minHeight: 60 }}
          />
        </Field>

        <Field label="Beschreibung (Englisch)">
          <textarea
            value={data.description_en}
            onChange={(e) => onChange({ ...data, description_en: e.target.value })}
            rows={2}
            style={{ ...inp, resize: "vertical", minHeight: 60 }}
          />
        </Field>

        <Field label="Workflow *">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["abloesung", "neukauf", "beide"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ ...data, kategorie: k })}
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: "10px 14px",
                  background: data.kategorie === k ? "#c8553d" : "#fff",
                  color: data.kategorie === k ? "#fff" : "#333",
                  border: `1px solid ${data.kategorie === k ? "#c8553d" : "#ddd"}`,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {KATEGORIE_LABELS[k]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="PDF-Datei *">
          {data.file_url ? (
            <div style={{ background: "#f7f5f2", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                <IconDownload size={16} />
                <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {data.file_name} <span style={{ color: "#888" }}>· {formatBytes(data.file_size)}</span>
                </span>
              </div>
              <a
                href={data.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#c8553d", textDecoration: "none", fontWeight: 600 }}
              >
                Öffnen ↗
              </a>
            </div>
          ) : null}
          <label
            htmlFor={fileId}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              background: "#fff",
              color: "#444",
              border: "1px dashed #c8553d66",
              fontSize: 13,
              fontWeight: 500,
              cursor: uploading ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            <IconUpload size={14} />
            {uploading ? "Lade hoch…" : data.file_url ? "PDF ersetzen" : "PDF hochladen"}
          </label>
          <input
            id={fileId}
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Max. 10 MB · nur PDF</div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Reihenfolge">
            <input
              type="number"
              value={data.sort_order}
              onChange={(e) => onChange({ ...data, sort_order: Number(e.target.value) || 0 })}
              style={inp}
            />
          </Field>
          <Field label="Status">
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid #ddd", cursor: "pointer", fontSize: 14 }}>
              <input
                type="checkbox"
                checked={data.active}
                onChange={(e) => onChange({ ...data, active: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              {data.active ? "Aktiv (für Kunden sichtbar)" : "Deaktiviert"}
            </label>
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "10px 18px", background: "#fff", color: "#444", border: "1px solid #ddd", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            style={{ padding: "10px 22px", background: "#c8553d", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Speichert…" : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#fff",
};
