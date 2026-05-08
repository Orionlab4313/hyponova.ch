"use client";

import { useEffect, useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

type Status = {
  notification_email: string;
  totp_enabled: boolean;
  backup_codes_count: number;
  site_password_set: boolean;
  admin_password_set: boolean;
  site_protection_enabled: boolean;
  teams_meeting_url: string;
};

export default function EinstellungenPage() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  const reload = async () => {
    const r = await fetch("/api/admin/settings");
    setStatus(await r.json());
  };

  if (!status) {
    return <div style={{ padding: 32, color: "#888" }}>Lädt…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Einstellungen</h1>
        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
          Passwörter, Zwei-Faktor-Authentifizierung und Benachrichtigungen.
        </p>
      </div>

      <SiteProtectionSection enabled={status.site_protection_enabled} onChange={reload} />
      <MicrosoftTeamsSection />
      <SitePasswordSection onChange={reload} />
      <AdminPasswordSection onChange={reload} email={status.notification_email} />
      <TwoFASection status={status} onChange={reload} />
    </div>
  );
}

/* ---------- Microsoft Teams Integration (OAuth + Auto-Meetings) ---------- */

interface MsStatus {
  app_configured: boolean;
  connected: boolean;
  user_email: string | null;
  connected_at: string | null;
}

function MicrosoftTeamsSection() {
  const [status, setStatus] = useState<MsStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/microsoft/test", { method: "POST" });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ success: false, steps: [{ step: "Netzwerk", ok: false, detail: String(e) }] });
    } finally {
      setTesting(false);
    }
  }

  function load() {
    fetch("/api/admin/microsoft/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }

  useEffect(() => {
    load();
    // OAuth-Callback-Result aus URL lesen
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("ms_success")) {
        setMsg({ type: "ok", text: "Microsoft Teams erfolgreich verbunden." });
        history.replaceState(null, "", window.location.pathname);
      } else if (params.get("ms_error")) {
        setMsg({ type: "err", text: "Verbindung fehlgeschlagen: " + params.get("ms_error") });
        history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  async function saveAppConfig() {
    if (!tenantId.trim() || !clientId.trim() || !clientSecret.trim()) {
      setMsg({ type: "err", text: "Bitte alle 3 Felder ausfüllen (Tenant ID, Client ID, Client Secret)." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/microsoft/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId.trim(),
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
        }),
      });
      if (res.ok) {
        setMsg({ type: "ok", text: "App-Credentials gespeichert. Klick jetzt auf «Mit Microsoft verbinden»." });
        setShowSetup(false);
        setTenantId(""); setClientId(""); setClientSecret("");
        load();
      } else {
        const j = await res.json().catch(() => ({}));
        setMsg({ type: "err", text: j.error || "Speichern fehlgeschlagen." });
      }
    } catch {
      setMsg({ type: "err", text: "Netzwerkfehler." });
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!confirm("Microsoft Teams trennen? Neue Termine bekommen dann keinen Teams-Link mehr.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/microsoft/disconnect", { method: "POST" });
      if (res.ok) {
        setMsg({ type: "ok", text: "Verbindung getrennt." });
        load();
      } else {
        setMsg({ type: "err", text: "Trennen fehlgeschlagen." });
      }
    } catch {
      setMsg({ type: "err", text: "Netzwerkfehler." });
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return (
      <section style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "20px 24px" }}>
        <div style={{ color: "#888", fontSize: 13 }}>Lade Microsoft-Status…</div>
      </section>
    );
  }

  return (
    <section style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Microsoft Teams Integration</h2>
        {status.connected && (
          <span style={{ fontSize: 11, padding: "3px 8px", background: "#dcfce7", color: "#166534", fontWeight: 600 }}>
            ✓ Verbunden
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px", lineHeight: 1.6 }}>
        Wenn aktiv: Pro Termin wird automatisch ein frischer Microsoft Teams Meeting-Link generiert und in der Bestätigungs-E-Mail + Outlook-Kalender eingefügt. Kein Lobby-Stress, kein Datenschutz-Risiko durch geteilte Links.
      </p>

      {/* Status-Block */}
      <div style={{ background: "#f7f5f2", padding: "12px 16px", marginBottom: 14, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "#666" }}>App-Credentials:</span>
          <span style={{ fontWeight: 600, color: status.app_configured ? "#166534" : "#c00" }}>
            {status.app_configured ? "✓ Konfiguriert" : "✗ Nicht konfiguriert"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: status.connected ? 4 : 0 }}>
          <span style={{ color: "#666" }}>Microsoft-Konto verbunden:</span>
          <span style={{ fontWeight: 600, color: status.connected ? "#166534" : "#888" }}>
            {status.connected ? "✓ Ja" : "Nein"}
          </span>
        </div>
        {status.connected && status.user_email && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: 12, marginTop: 4 }}>
            <span>Verbunden als:</span>
            <span style={{ fontFamily: "monospace" }}>{status.user_email}</span>
          </div>
        )}
      </div>

      {/* App-Setup-Block */}
      {!status.app_configured || showSetup ? (
        <div style={{ border: "1px dashed #c8553d66", padding: 14, marginBottom: 14, background: "#fafafa" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            {status.app_configured ? "App-Credentials aktualisieren" : "Schritt 1: Azure App-Credentials hinterlegen"}
          </div>
          <p style={{ fontSize: 12, color: "#666", marginTop: 0, lineHeight: 1.5 }}>
            Aus dem Azure Portal → App-Registrierung. Tenant ID + Client ID stehen auf der Übersicht, Client Secret unter «Zertifikate &amp; Geheimnisse» (24-Monate-Wert).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Tenant ID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
              style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", boxSizing: "border-box", fontFamily: "monospace" }}
            />
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Client ID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
              style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", boxSizing: "border-box", fontFamily: "monospace" }}
            />
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Client Secret (Wert, nicht ID)"
              style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", boxSizing: "border-box", fontFamily: "monospace" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={saveAppConfig}
              disabled={busy}
              style={{ padding: "8px 16px", background: "#c8553d", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Speichert…" : "Speichern"}
            </button>
            {showSetup && (
              <button
                type="button"
                onClick={() => { setShowSetup(false); setTenantId(""); setClientId(""); setClientSecret(""); }}
                style={{ padding: "8px 14px", background: "transparent", color: "#666", border: "1px solid #ddd", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Action-Buttons */}
      {status.app_configured && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!status.connected ? (
            <a
              href="/api/admin/microsoft/connect"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#5059c9", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
            >
              Mit Microsoft verbinden →
            </a>
          ) : (
            <>
              <a
                href="/api/admin/microsoft/connect"
                style={{ padding: "8px 14px", background: "#fff", color: "#444", border: "1px solid #ddd", textDecoration: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                Erneut autorisieren
              </a>
              <button
                type="button"
                onClick={disconnect}
                disabled={busy}
                style={{ padding: "8px 14px", background: "transparent", color: "#c00", border: "1px solid #f2caca", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                Verbindung trennen
              </button>
            </>
          )}
          {status.connected && (
            <button
              type="button"
              onClick={runTest}
              disabled={testing}
              style={{ padding: "8px 14px", background: "#fff", color: "#444", border: "1px solid #ddd", fontSize: 13, cursor: testing ? "wait" : "pointer", fontFamily: "inherit" }}
            >
              {testing ? "Teste…" : "Verbindung testen"}
            </button>
          )}
          {!showSetup && (
            <button
              type="button"
              onClick={() => setShowSetup(true)}
              style={{ padding: "8px 14px", background: "transparent", color: "#666", border: "1px solid #ddd", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}
            >
              App-Credentials ändern
            </button>
          )}
        </div>
      )}

      {/* Test-Ergebnis */}
      {testResult && (
        <div style={{ marginTop: 14, padding: 12, background: testResult.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${testResult.success ? "#86efac" : "#fca5a5"}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: testResult.success ? "#166534" : "#991b1b" }}>
            {testResult.success ? "✓ Test erfolgreich" : "✗ Test fehlgeschlagen"}
          </div>
          {Array.isArray(testResult.steps) && testResult.steps.map((s: any, i: number) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>{s.ok ? "✓" : "✗"} {s.step}:</span>{" "}
              <span style={{ color: "#444", fontFamily: s.detail?.startsWith("Event") || s.detail?.includes("URL") ? "monospace" : undefined, wordBreak: "break-all" }}>
                {s.detail}
              </span>
            </div>
          ))}
          {testResult.joinUrl && (
            <div style={{ fontSize: 11, marginTop: 8, padding: 8, background: "#fff", border: "1px solid #ddd", wordBreak: "break-all", fontFamily: "monospace" }}>
              <strong>Test Join-URL:</strong> {testResult.joinUrl}
            </div>
          )}
        </div>
      )}

      {msg && (
        <p style={{ fontSize: 12, marginTop: 12, color: msg.type === "ok" ? "#0a7a2e" : "#c00" }}>
          {msg.text}
        </p>
      )}
    </section>
  );
}

/* TeamsMeetingSection (Standing-Link) wurde durch die volle Microsoft Graph
   Integration ersetzt, siehe MicrosoftTeamsSection oben. Die DB-Spalte
   admin_settings.teams_meeting_url bleibt als Legacy-Fallback erhalten. */

/* ---------- Site Protection (Schutz an/aus) ---------- */

function SiteProtectionSection({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const performToggle = async (next: boolean) => {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/site-protection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setBusy(false);
    setConfirming(false);
    if (res.ok) {
      setMsg({
        type: "ok",
        text: next
          ? "Webseite ist jetzt geschützt. Aktiv innerhalb von 30 Sekunden."
          : "Webseite ist jetzt öffentlich. Aktiv innerhalb von 30 Sekunden.",
      });
      onChange();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: data.error || "Fehler" });
    }
  };

  const onSwitch = () => {
    if (enabled) {
      // Aktuell geschützt → Ausschalten verlangt Bestätigung
      setConfirming(true);
    } else {
      // Aktuell öffentlich → Wieder anschalten ohne Rückfrage
      performToggle(true);
    }
  };

  return (
    <Card
      title="Webseite öffentlich / geschützt"
      subtitle={
        enabled
          ? "Aktuell geschützt. Besucher müssen das Webseiten-Passwort eingeben."
          : "Aktuell öffentlich. Jeder kann die Seite ohne Passwort sehen."
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          maxWidth: 540,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#444" }}>
            <strong style={{ color: enabled ? "#c8553d" : "#16a34a" }}>
              {enabled ? "Schutz aktiv" : "Öffentlich"}
            </strong>
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888", lineHeight: 1.5 }}>
            {enabled
              ? "Schutz ausschalten, sobald die Webseite live gehen soll."
              : "Schutz wieder einschalten, falls die Seite vorübergehend nicht erreichbar sein soll."}
          </p>
        </div>
        <Switch checked={enabled} disabled={busy} onChange={onSwitch} />
      </div>
      {msg && (
        <div style={{ marginTop: 12 }}>
          <Msg msg={msg} />
        </div>
      )}
      {confirming && (
        <ConfirmDialog
          title="Webseite öffentlich machen?"
          body="Die Seite ist danach für alle ohne Passwort erreichbar. Die Änderung wird innerhalb von 30 Sekunden wirksam."
          confirmLabel="Ja, öffentlich machen"
          cancelLabel="Abbrechen"
          danger
          loading={busy}
          onConfirm={() => performToggle(false)}
          onCancel={() => setConfirming(false)}
        />
      )}
    </Card>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
          {body}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "9px 16px",
              fontSize: 13,
              background: "#fff",
              color: "#444",
              border: "1px solid #d4d4d4",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 500,
              background: danger ? "#c8553d" : "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      style={{
        position: "relative",
        width: 48,
        height: 28,
        borderRadius: 14,
        border: "none",
        background: checked ? "#c8553d" : "#d4d4d4",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

/* ---------- Site Password ---------- */

function SitePasswordSection({ onChange }: { onChange: () => void }) {
  const [adminPw, setAdminPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/site-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminPassword: adminPw, newPassword: newPw }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ type: "ok", text: "Webseiten-Passwort wurde geändert." });
      setAdminPw("");
      setNewPw("");
      onChange();
    } else {
      setMsg({ type: "err", text: data.error || "Fehler" });
    }
  };

  return (
    <Card title="Webseiten-Passwort" subtitle="Schützt die öffentliche Seite (aktuell «In Bearbeitung»).">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
        <Field
          label="Admin-Passwort (zur Bestätigung)"
          type="password"
          value={adminPw}
          onChange={setAdminPw}
        />
        <Field
          label="Neues Webseiten-Passwort"
          type="password"
          value={newPw}
          onChange={setNewPw}
          placeholder="mind. 6 Zeichen"
        />
        <button
          type="submit"
          disabled={loading || !adminPw || !newPw}
          style={primaryBtn(loading || !adminPw || !newPw)}
        >
          {loading ? "…" : "Webseiten-Passwort ändern"}
        </button>
        {msg && <Msg msg={msg} />}
      </form>
    </Card>
  );
}

/* ---------- Admin Password ---------- */

function AdminPasswordSection({ onChange, email }: { onChange: () => void; email: string }) {
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const requestReset = async () => {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/admin-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request" }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({
        type: "ok",
        text: `E-Mail mit Bestätigungs-Link wurde an ${data.sentTo} gesendet (gültig ${data.ttlMinutes} Min).`,
      });
      onChange();
    } else {
      setMsg({ type: "err", text: data.error || "Fehler" });
    }
  };

  return (
    <Card
      title="Admin-Passwort"
      subtitle={`Änderung erfordert Bestätigung per E-Mail an ${email}.`}
    >
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px", maxWidth: 540 }}>
        Klicken Sie auf den Button. Sie erhalten eine E-Mail mit einem Bestätigungs-Link, über den Sie ein
        neues Passwort setzen können. Der Link ist 15 Minuten gültig und kann nur einmal verwendet werden.
      </p>
      <button onClick={requestReset} disabled={loading} style={primaryBtn(loading)}>
        {loading ? "…" : "Änderungs-Link per E-Mail anfordern"}
      </button>
      {msg && <Msg msg={msg} />}
    </Card>
  );
}

/* ---------- 2FA ---------- */

function TwoFASection({ status, onChange }: { status: Status; onChange: () => void }) {
  if (status.totp_enabled) {
    return <Disable2FA backupCount={status.backup_codes_count} onChange={onChange} />;
  }
  return <Enable2FA onChange={onChange} />;
}

function Enable2FA({ onChange }: { onChange: () => void }) {
  const [step, setStep] = useState<"idle" | "setup" | "done">("idle");
  const [qr, setQr] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings/twofa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "init" }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSecret(data.secret);
      setQr(data.qrDataUrl);
      setStep("setup");
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/twofa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable", secret, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setBackupCodes(data.backupCodes);
      setStep("done");
      onChange();
    } else {
      setMsg({ type: "err", text: data.error || "Fehler" });
    }
  };

  return (
    <Card
      title="Zwei-Faktor-Authentifizierung (2FA)"
      subtitle="Zusätzlicher Schutz beim Admin-Login per Authenticator-App."
    >
      {step === "idle" && (
        <>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px", maxWidth: 540 }}>
            Aktivieren Sie 2FA, damit beim Admin-Login zusätzlich ein 6-stelliger Code aus Ihrer
            Authenticator-App benötigt wird (Google Authenticator, Authy, 1Password, etc.).
          </p>
          <button onClick={start} disabled={loading} style={primaryBtn(loading)}>
            {loading ? "…" : "2FA einrichten"}
          </button>
        </>
      )}

      {step === "setup" && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ background: "#fff", padding: 8, borderRadius: 8, border: "1px solid #e5e5e5" }}>
            {qr && <img src={qr} alt="QR-Code" style={{ display: "block", width: 220, height: 220 }} />}
          </div>
          <form onSubmit={confirm} style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#444", margin: 0 }}>
              <strong>1.</strong> Scannen Sie den QR-Code in Ihrer Authenticator-App.
            </p>
            <p style={{ fontSize: 13, color: "#444", margin: 0 }}>
              <strong>Manuell:</strong>
              <code style={{ display: "block", background: "#f5f5f5", padding: "8px 10px", borderRadius: 4, marginTop: 4, fontSize: 12, wordBreak: "break-all" }}>
                {secret}
              </code>
            </p>
            <Field
              label="2. 6-stelliger Code aus der App"
              type="text"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={primaryBtn(loading || code.length !== 6)}
            >
              {loading ? "…" : "2FA aktivieren"}
            </button>
            {msg && <Msg msg={msg} />}
          </form>
        </div>
      )}

      {step === "done" && (
        <div>
          <p style={{ fontSize: 14, color: "#16a34a", fontWeight: 500, margin: "0 0 12px" }}>
            2FA ist aktiv. Beim nächsten Admin-Login werden Sie nach dem Code gefragt.
          </p>
          <p style={{ fontSize: 13, color: "#444", margin: "0 0 8px" }}>
            <strong>Backup-Codes</strong> (jeder Code kann nur einmal verwendet werden, falls Sie keinen Zugriff
            auf Ihre Authenticator-App haben):
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "SF Mono, Menlo, monospace",
              border: "1px solid #e5e5e5",
              margin: "0 0 12px",
              whiteSpace: "pre-wrap",
            }}
          >
            {backupCodes.join("\n")}
          </pre>
          <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
            Speichern Sie diese Codes sicher (Passwort-Manager, ausgedruckt im Tresor). Diese Anzeige erscheint
            nur jetzt einmal.
          </p>
        </div>
      )}
    </Card>
  );
}

function Disable2FA({ backupCount, onChange }: { backupCount: number; onChange: () => void }) {
  const [adminPw, setAdminPw] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/twofa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable", adminPassword: adminPw, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ type: "ok", text: "2FA wurde deaktiviert." });
      setAdminPw("");
      setCode("");
      setShow(false);
      onChange();
    } else {
      setMsg({ type: "err", text: data.error || "Fehler" });
    }
  };

  return (
    <Card
      title="Zwei-Faktor-Authentifizierung (2FA)"
      subtitle="Aktiv. Beim Admin-Login wird ein Code aus Ihrer Authenticator-App verlangt."
    >
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 12,
          fontSize: 13,
          color: "#166534",
        }}
      >
        2FA ist aktiviert. {backupCount} Backup-Code{backupCount !== 1 && "s"} verbleibend.
      </div>
      {!show ? (
        <button onClick={() => setShow(true)} style={dangerBtn(false)}>
          2FA deaktivieren
        </button>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <Field label="Admin-Passwort" type="password" value={adminPw} onChange={setAdminPw} />
          <Field
            label="Aktueller 6-stelliger Code"
            type="text"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={loading || !adminPw || code.length !== 6}
              style={dangerBtn(loading || !adminPw || code.length !== 6)}
            >
              {loading ? "…" : "Endgültig deaktivieren"}
            </button>
            <button type="button" onClick={() => setShow(false)} style={secondaryBtn}>
              Abbrechen
            </button>
          </div>
          {msg && <Msg msg={msg} />}
        </form>
      )}
    </Card>
  );
}

/* ---------- Shared UI ---------- */

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5", padding: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>{subtitle}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const inputStyle: React.CSSProperties = {
    padding: "9px 12px",
    fontSize: 14,
    background: "#fff",
    border: "1px solid #d4d4d4",
    borderRadius: 6,
    outline: "none",
    color: "#1a1a1a",
  };

  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, color: "#444", marginBottom: 4, fontWeight: 500 }}>
        {label}
      </span>
      {type === "password" ? (
        <PasswordInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputStyle={inputStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", boxSizing: "border-box", ...inputStyle }}
        />
      )}
    </label>
  );
}

function Msg({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  const isOk = msg.type === "ok";
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        fontSize: 13,
        background: isOk ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${isOk ? "#bbf7d0" : "#fecaca"}`,
        color: isOk ? "#166534" : "#991b1b",
      }}
    >
      {msg.text}
    </div>
  );
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 500,
    background: disabled ? "#d4d4d4" : "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    width: "fit-content",
  };
}

function dangerBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 500,
    background: disabled ? "#fecaca" : "#c8553d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    width: "fit-content",
  };
}

const secondaryBtn: React.CSSProperties = {
  padding: "9px 16px",
  fontSize: 13,
  background: "#fff",
  color: "#444",
  border: "1px solid #d4d4d4",
  borderRadius: 6,
  cursor: "pointer",
};
