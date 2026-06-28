"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface InterestRates {
  saron_marge: number | null;
  fixed_5y: number | null;
  fixed_7y: number | null;
  fixed_10y: number | null;
  updated_at: string | null;
}

type Field = "saron_marge" | "fixed_5y" | "fixed_7y" | "fixed_10y";

const FIELDS: { key: Field; label: string; sub: string }[] = [
  { key: "saron_marge", label: "Saron Marge", sub: "Marge auf SARON, in %" },
  { key: "fixed_5y", label: "5 Jahre Festhypothek", sub: "Aktueller Zinssatz, in %" },
  { key: "fixed_7y", label: "7 Jahre Festhypothek", sub: "Aktueller Zinssatz, in %" },
  { key: "fixed_10y", label: "10 Jahre Festhypothek", sub: "Aktueller Zinssatz, in %" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "noch nicht gesetzt";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "noch nicht gesetzt";
  const date = d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

export default function ZinssaetzePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<InterestRates | null>(null);
  const [form, setForm] = useState<Record<Field, string>>({
    saron_marge: "",
    fixed_5y: "",
    fixed_7y: "",
    fixed_10y: "",
  });
  const toast = useToast();

  function load() {
    setLoading(true);
    fetch("/api/admin/interest-rates")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d === "object") {
          setData(d);
          setForm({
            saron_marge: d.saron_marge != null ? String(d.saron_marge) : "",
            fixed_5y: d.fixed_5y != null ? String(d.fixed_5y) : "",
            fixed_7y: d.fixed_7y != null ? String(d.fixed_7y) : "",
            fixed_10y: d.fixed_10y != null ? String(d.fixed_10y) : "",
          });
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, number | null> = {};
      for (const f of FIELDS) {
        const v = form[f.key].trim().replace(",", ".");
        if (v === "") {
          body[f.key] = null;
        } else {
          const num = Number(v);
          if (Number.isNaN(num) || num < 0 || num > 100) {
            toast({ type: "error", message: `${f.label}: bitte eine Zahl zwischen 0 und 100 eingeben.` });
            setSaving(false);
            return;
          }
          body[f.key] = num;
        }
      }
      const res = await fetch("/api/admin/interest-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ type: "success", message: "Zinssätze aktualisiert. Live auf der Startseite." });
        load();
      } else {
        const j = await res.json().catch(() => ({}));
        toast({ type: "error", message: j.error || "Speichern fehlgeschlagen." });
      }
    } catch {
      toast({ type: "error", message: "Netzwerkfehler." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Zinssätze</h1>
        <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
          Tagesaktuelle Zinssätze, die auf der Startseite unter «Unsere tagesaktuellen Zinssätze» angezeigt werden.
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: 20, maxWidth: 720 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#888" }}>Laden…</div>
        ) : (
          <>
            <div style={{ background: "#f7f5f2", padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#444" }}>
              <strong>Letzte Aktualisierung:</strong> {formatDate(data?.updated_at || null)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              {FIELDS.map((f) => (
                <label key={f.key} style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>{f.label}</span>
                  <span style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 6 }}>{f.sub}</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder="z.B. 1.05"
                      style={{
                        width: "100%",
                        padding: "10px 36px 10px 12px",
                        border: "1px solid #ddd",
                        fontSize: 16,
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        background: "#fff",
                      }}
                    />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 14, pointerEvents: "none" }}>%</span>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5, marginBottom: 18 }}>
              Lasse ein Feld leer, wenn der Zinssatz vorübergehend nicht angezeigt werden soll. Der Container wird dann auf der Startseite ausgeblendet.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                style={{
                  padding: "10px 22px",
                  background: "#c8553d",
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? "wait" : "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Speichert…" : "Speichern"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
