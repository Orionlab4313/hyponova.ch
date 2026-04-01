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
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin-auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin-auth", "true");
      setAuthenticated(true);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (!authenticated) {
    return (
      <html lang="de">
        <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative" }}>
          <Link
            href="/"
            style={{ position: "absolute", top: 24, right: 24, color: "#666", textDecoration: "none", fontSize: 28, lineHeight: 1, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#333"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.background = "transparent"; }}
          >
            ×
          </Link>
          <div style={{ textAlign: "center", maxWidth: 360, padding: "0 24px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 300, marginBottom: 8 }}>HYPONOVA Admin</h1>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 32 }}>Bitte melden Sie sich an</p>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Admin-Passwort"
                autoFocus
                style={{ width: "100%", padding: "12px 16px", fontSize: 15, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
              />
              <button type="submit" style={{ width: "100%", padding: 12, fontSize: 15, fontWeight: 500, background: "#fff", color: "#000", border: "none", borderRadius: 8, cursor: "pointer" }}>
                Anmelden
              </button>
              {error && <p style={{ color: "#c8553d", fontSize: 13, marginTop: 12 }}>Falsches Passwort</p>}
            </form>
          </div>
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
              width: 240,
              background: "#0f0f0f",
              borderRight: "1px solid #1a1a1a",
              padding: "24px 0",
              position: "fixed",
              top: 0,
              left: sidebarOpen ? 0 : -240,
              bottom: 0,
              zIndex: 50,
              transition: "left 0.3s",
            }}
            className="admin-sidebar"
          >
            <div style={{ padding: "0 20px", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>HYPONOVA</h2>
                <p style={{ fontSize: 11, color: "#555", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Dashboard</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="admin-sidebar-close"
                style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer", padding: "0 4px", lineHeight: 1, transition: "color 0.15s" }}
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
                      gap: 10,
                      padding: "10px 20px",
                      fontSize: 14,
                      color: isActive ? "#fff" : "#888",
                      textDecoration: "none",
                      background: isActive ? "#1a1a1a" : "transparent",
                      borderLeft: isActive ? "3px solid #c8553d" : "3px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, padding: "0 20px" }}>
              <Link href="/" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>← Zurück zur Website</Link>
            </div>
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
            />
          )}

          {/* Main content */}
          <div className="admin-main-content" style={{ flex: 1, marginLeft: 0, background: "#fafafa", minHeight: "100vh", transition: "margin-left 0.3s" }}>
            {/* Top bar */}
            <header style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 }}
                >
                  ☰
                </button>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>
                  {navItems.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "Dashboard"}
                </span>
              </div>
              <button
                onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthenticated(false); }}
                style={{ fontSize: 12, color: "#888", background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
              >
                Abmelden
              </button>
            </header>

            {/* Page content */}
            <main style={{ padding: 24 }}>
              {children}
            </main>
          </div>

          <style>{`
            @media (min-width: 768px) {
              .admin-main-content { margin-left: ${sidebarOpen ? 240 : 0}px !important; transition: margin-left 0.3s; }
            }
            @media (max-width: 640px) {
              .admin-grid-2col { grid-template-columns: 1fr !important; }
              .admin-grid-3col { grid-template-columns: 1fr !important; }
              .admin-grid-5col { grid-template-columns: 1fr !important; }
              .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
              .admin-table-wrap table { min-width: 600px; }
              .admin-modal { max-width: calc(100vw - 32px) !important; margin: 16px; }
              .admin-calendar-grid { font-size: 11px !important; }
              .admin-calendar-grid > div { min-height: 60px !important; padding: 4px !important; }
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
