"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/nachrichten", label: "Nachrichten", icon: "✉️" },
  { href: "/admin/leads", label: "Kontakte", icon: "👥" },
  { href: "/admin/kalender", label: "Kalender", icon: "📅" },
  { href: "/admin/verfuegbarkeit", label: "Verfügbarkeit", icon: "🕐" },
  { href: "/admin/pipeline", label: "Pipeline", icon: "📈" },
  { href: "/admin/dokumente", label: "Dokumente", icon: "📁" },
  { href: "/admin/blogposts", label: "Blog", icon: "📝" },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: "⚙️" },
];

// Pfade die NICHT durch den Admin-Login geschuetzt sind (per Token-URL erreichbar)
const PUBLIC_ADMIN_PATHS = ["/admin/einstellungen/passwort-bestaetigen"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authStage, setAuthStage] = useState<"checking" | "password" | "totp" | "ok">("checking");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isPublicAdminPath) {
      setAuthStage("ok");
      return;
    }
    fetch("/api/admin/auth")
      .then((r) => (r.ok ? "ok" : "password"))
      .then((s) => setAuthStage(s as "ok" | "password"))
      .catch(() => setAuthStage("password"));
  }, [pathname, isPublicAdminPath]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data.needsTotp) {
        setAuthStage("totp");
        setPassword("");
      } else {
        setAuthStage("ok");
        setPassword("");
      }
    } else {
      setError(data.error || "Falsches Passwort");
      setPassword("");
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = useBackup ? { backupCode: totpCode } : { totpCode };
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setAuthStage("ok");
      setTotpCode("");
    } else {
      setError(data.error || "Code falsch");
      setTotpCode("");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthStage("password");
  };

  if (authStage === "checking") {
    return (
      <html lang="de">
        <body style={{ margin: 0, fontFamily: "-apple-system, sans-serif", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ color: "#666", fontSize: 13 }}>...</div>
        </body>
      </html>
    );
  }

  if (authStage === "password" || authStage === "totp") {
    return (
      <html lang="de">
        <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative" }}>
          <Link
            href="/"
            style={{ position: "absolute", top: 16, right: 16, color: "#666", textDecoration: "none", fontSize: 24, lineHeight: 1, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#333"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.background = "transparent"; }}
          >
            ×
          </Link>
          <div style={{ textAlign: "center", maxWidth: 320, padding: "0 16px" }}>
            <h1 style={{ fontSize: 22, fontWeight: 300, marginBottom: 6 }}>HYPONOVA Admin</h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
              {authStage === "password" ? "Bitte melden Sie sich an" : useBackup ? "Backup-Code eingeben" : "Code aus der Authenticator-App"}
            </p>

            {authStage === "password" ? (
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Admin-Passwort"
                  autoFocus
                  style={inputDarkAuth}
                />
                <button type="submit" style={btnDarkAuth}>Anmelden</button>
                {error && <p style={errorTextStyle}>{error}</p>}
              </form>
            ) : (
              <form onSubmit={handleTotpSubmit}>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => {
                    setError(null);
                    if (useBackup) {
                      setTotpCode(e.target.value.toUpperCase().slice(0, 14));
                    } else {
                      setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    }
                  }}
                  placeholder={useBackup ? "ABCDE-FGHIJ" : "123456"}
                  inputMode={useBackup ? "text" : "numeric"}
                  autoFocus
                  style={{ ...inputDarkAuth, letterSpacing: useBackup ? "0.05em" : "0.4em", textAlign: "center", fontSize: 18 }}
                />
                <button type="submit" style={btnDarkAuth}>Bestätigen</button>
                {error && <p style={errorTextStyle}>{error}</p>}
                <button
                  type="button"
                  onClick={() => { setUseBackup(!useBackup); setTotpCode(""); setError(null); }}
                  style={{ marginTop: 12, fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  {useBackup ? "Mit App-Code anmelden" : "Backup-Code verwenden"}
                </button>
              </form>
            )}
          </div>
        </body>
      </html>
    );
  }

  // Public admin path (Token-Reset) — kein Sidebar/Layout, nur die Page anzeigen
  if (isPublicAdminPath) {
    return (
      <html lang="de">
        <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Sidebar */}
          <aside
            style={{
              width: 220,
              background: "#0f0f0f",
              borderRight: "1px solid #1a1a1a",
              padding: "16px 0",
              position: "fixed",
              top: 0,
              left: sidebarOpen ? 0 : -220,
              bottom: 0,
              zIndex: 50,
              transition: "left 0.3s",
            }}
            className="admin-sidebar"
          >
            <div style={{ padding: "0 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>HYPONOVA</h2>
                <p style={{ fontSize: 10, color: "#555", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Dashboard</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="admin-sidebar-close"
                style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1, transition: "color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; }}
              >
                ×
              </button>
            </div>
            <nav>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 16px",
                      fontSize: 13,
                      color: isActive ? "#fff" : "#888",
                      textDecoration: "none",
                      background: isActive ? "#1a1a1a" : "transparent",
                      borderLeft: isActive ? "3px solid #c8553d" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  borderRadius: 6,
                  padding: "7px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
              >
                <span style={{ fontSize: 13 }}>↪</span> Abmelden
              </button>
              <Link href="/" style={{ fontSize: 11, color: "#555", textDecoration: "none" }}>← Zurück zur Website</Link>
            </div>
          </aside>

          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
            />
          )}

          <div className="admin-main-content" style={{ flex: 1, marginLeft: 0, background: "#fafafa", minHeight: "100vh", transition: "margin-left 0.3s" }}>
            <header style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 16px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4 }}
                >
                  ☰
                </button>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                  {navItems.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "Dashboard"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{ fontSize: 11, color: "#888", background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}
              >
                Abmelden
              </button>
            </header>

            <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
              {children}
            </main>
          </div>

          <style>{`
            @media (min-width: 768px) {
              .admin-main-content { margin-left: ${sidebarOpen ? 220 : 0}px !important; transition: margin-left 0.3s; }
            }
            @media (max-width: 640px) {
              .admin-grid-2col { grid-template-columns: 1fr !important; }
              .admin-grid-3col { grid-template-columns: 1fr !important; }
              .admin-grid-5col { grid-template-columns: 1fr !important; }
              .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
              .admin-table-wrap table { min-width: 560px; }
              .admin-modal { max-width: calc(100vw - 32px) !important; margin: 16px; }
              .admin-calendar-grid { font-size: 11px !important; }
              .admin-calendar-grid > div { min-height: 48px !important; padding: 3px !important; }
              .admin-hide-mobile { display: none !important; }
              .admin-stack-mobile { flex-direction: column !important; }
              .admin-stack-mobile > * { width: 100% !important; }
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}

const inputDarkAuth: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#fff",
  outline: "none",
  marginBottom: 10,
  boxSizing: "border-box",
};

const btnDarkAuth: React.CSSProperties = {
  width: "100%",
  padding: 10,
  fontSize: 14,
  fontWeight: 500,
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const errorTextStyle: React.CSSProperties = {
  color: "#c8553d",
  fontSize: 12,
  marginTop: 8,
};
