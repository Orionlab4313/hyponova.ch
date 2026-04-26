"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Inner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setMsg({ type: "err", text: "Kein Token in der URL." });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw1 !== pw2) {
      setMsg({ type: "err", text: "Passwoerter stimmen nicht ueberein" });
      return;
    }
    if (pw1.length < 8) {
      setMsg({ type: "err", text: "Passwort muss mindestens 8 Zeichen haben" });
      return;
    }
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/admin-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", token, newPassword: pw1 }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      setMsg({ type: "err", text: data.error || "Fehler" });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, marginBottom: 6 }}>HYPONOVA Admin</h1>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Neues Admin-Passwort setzen</p>

        {done ? (
          <div>
            <div
              style={{
                background: "#0f3a1f",
                border: "1px solid #166534",
                color: "#a7f3d0",
                padding: "12px 16px",
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              Passwort erfolgreich geaendert. Sie koennen sich jetzt mit dem neuen Passwort anmelden.
            </div>
            <Link
              href="/admin"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                fontSize: 13,
                background: "#fff",
                color: "#000",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Zum Admin-Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 11, color: "#aaa", marginBottom: 4 }}>
                Neues Passwort (min. 8 Zeichen)
              </span>
              <input
                type="password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                disabled={!token}
                autoFocus
                style={inputDark}
              />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ display: "block", fontSize: 11, color: "#aaa", marginBottom: 4 }}>
                Passwort wiederholen
              </span>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                disabled={!token}
                style={inputDark}
              />
            </label>
            <button
              type="submit"
              disabled={loading || !token || !pw1 || !pw2}
              style={{
                width: "100%",
                padding: 12,
                fontSize: 14,
                fontWeight: 500,
                background: loading || !token || !pw1 || !pw2 ? "#333" : "#fff",
                color: loading || !token || !pw1 || !pw2 ? "#888" : "#000",
                border: "none",
                borderRadius: 6,
                cursor: loading || !token || !pw1 || !pw2 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Speichern ..." : "Passwort speichern"}
            </button>
            {msg && (
              <p
                style={{
                  fontSize: 12,
                  color: msg.type === "ok" ? "#a7f3d0" : "#fca5a5",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {msg.text}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

const inputDark: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#888" }}>Lade ...</div>}>
      <Inner />
    </Suspense>
  );
}
