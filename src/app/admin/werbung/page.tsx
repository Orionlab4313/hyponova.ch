"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { extractGoogleTagId } from "@/lib/ads";

interface AdsSettings {
  google_tag_id: string | null;
  google_tag_enabled: boolean;
  ads_updated_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "noch nie gespeichert";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "noch nie gespeichert";
  const date = d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

export default function WerbungPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AdsSettings | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [enabled, setEnabled] = useState(false);
  const toast = useToast();

  function apply(d: AdsSettings) {
    setData(d);
    setTagInput(d.google_tag_id || "");
    setEnabled(d.google_tag_enabled === true);
  }

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d === "object" && !d.error) apply(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const trimmed = tagInput.trim();
  const detectedId = extractGoogleTagId(trimmed);
  const inputInvalid = trimmed !== "" && !detectedId;
  const dirty =
    (detectedId || "") !== (data?.google_tag_id || "") || enabled !== (data?.google_tag_enabled === true);

  // Ganzes Snippet eingefügt: sofort auf die ID kürzen.
  function normalizeInput() {
    if (detectedId && detectedId !== tagInput) setTagInput(detectedId);
  }

  async function save() {
    if (inputInvalid) {
      toast({ type: "error", message: "Das ist keine gültige Google-Tag-ID. Beispiel: AW-123456789." });
      return;
    }
    if (enabled && !detectedId) {
      toast({ type: "error", message: "Bitte zuerst eine Google-Tag-ID eintragen." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_tag_id: detectedId || "", google_tag_enabled: enabled && !!detectedId }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        apply(j);
        toast({
          type: "success",
          message: j.google_tag_enabled
            ? "Gespeichert. Der Google Tag läuft jetzt auf der Website."
            : "Gespeichert. Der Google Tag ist ausgeschaltet.",
        });
      } else {
        toast({ type: "error", message: j.error || "Speichern fehlgeschlagen." });
      }
    } catch {
      toast({ type: "error", message: "Netzwerkfehler." });
    } finally {
      setSaving(false);
    }
  }

  const live = data?.google_tag_enabled === true && !!data?.google_tag_id;
  const status = live
    ? { label: "Aktiv", bg: "#e8f5ec", color: "#1e7a3c" }
    : data?.google_tag_id
      ? { label: "Ausgeschaltet", bg: "#f3f3f3", color: "#666" }
      : { label: "Nicht eingerichtet", bg: "#f3f3f3", color: "#666" };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Werbung</h1>
        <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0", maxWidth: 720 }}>
          Verbindet hyponova.ch mit deinen Werbekonten. Google Ads sieht damit, was Besucher nach dem Klick auf eine
          Anzeige auf der Website machen.
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: 20, maxWidth: 720 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#888" }}>Laden…</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Google Tag (Google Ads)</h2>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", background: status.bg, color: status.color }}>
                {status.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 18px" }}>
              Letzte Änderung: {formatDate(data?.ads_updated_at || null)}
            </p>

            <label style={{ display: "block", marginBottom: 18 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>Tag-ID</span>
              <span style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 6, lineHeight: 1.5 }}>
                Beginnt mit AW-. Du findest sie in Google Ads unter Tools, Datenmanager, Google-Tag. Du kannst auch den
                ganzen Code aus der Google-Mail einfügen, die ID wird automatisch erkannt.
              </span>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={normalizeInput}
                onPaste={() => setTimeout(normalizeInput, 0)}
                placeholder="AW-123456789"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={inputInvalid}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${inputInvalid ? "#c8553d" : "#ddd"}`,
                  fontSize: 16,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  boxSizing: "border-box",
                  background: "#fff",
                }}
              />
              {inputInvalid && (
                <span style={{ display: "block", fontSize: 12, color: "#c8553d", marginTop: 6 }}>
                  Keine gültige Tag-ID gefunden. Beispiel: AW-123456789.
                </span>
              )}
              {!inputInvalid && detectedId && detectedId !== trimmed && (
                <span style={{ display: "block", fontSize: 12, color: "#1e7a3c", marginTop: 6 }}>
                  Erkannte ID: {detectedId}
                </span>
              )}
            </label>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", marginBottom: 18 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Tag auf der Website laden</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2, lineHeight: 1.5 }}>
                  Aus: Die ID bleibt gespeichert, die Website lädt nichts von Google.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label="Tag auf der Website laden"
                onClick={() => setEnabled(!enabled)}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: 46,
                  height: 26,
                  borderRadius: 13,
                  border: "none",
                  background: enabled ? "#c8553d" : "#cfcfcf",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: enabled ? 23 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>

            <div style={{ background: "#f7f5f2", padding: "12px 14px", marginBottom: 18, fontSize: 12, color: "#444", lineHeight: 1.6 }}>
              <strong style={{ display: "block", marginBottom: 4 }}>Was passiert, wenn der Tag aktiv ist</strong>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Der Tag ist auf allen öffentlichen Seiten eingebunden. Nicht im Admin und nicht im Upload-Portal der Kunden.</li>
                <li>Der Cookie-Banner fragt Besucher neu: «Nur notwendige» oder «Akzeptieren». Werbe-Cookies gibt es erst nach «Akzeptieren».</li>
                <li>Google Ads erkennt den Tag meist innert weniger Stunden, spätestens nach 48 Stunden. Die Meldung «Kein Google-Tag auf Ihrer Website» verschwindet dann von selbst.</li>
                <li>Die Datenschutzerklärung muss Google Ads erwähnen. Bitte unter Rechtliches prüfen.</li>
              </ul>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://tagassistant.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: "#c8553d", textDecoration: "underline", textUnderlineOffset: 2 }}
              >
                Mit Google Tag Assistant prüfen
              </a>
              <button
                type="button"
                onClick={save}
                disabled={saving || !dirty}
                style={{
                  padding: "10px 22px",
                  background: "#c8553d",
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? "wait" : dirty ? "pointer" : "default",
                  fontFamily: "inherit",
                  opacity: saving || !dirty ? 0.5 : 1,
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
