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
      <SitePasswordSection onChange={reload} />
      <AdminPasswordSection onChange={reload} email={status.notification_email} />
      <TwoFASection status={status} onChange={reload} />
    </div>
  );
}

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
