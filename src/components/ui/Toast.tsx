"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "duration">> {
  id: string;
  duration: number;
}

const ToastContext = createContext<((opts: ToastOptions | string) => void) | null>(null);

const COLORS: Record<ToastType, { bg: string; color: string; icon: string }> = {
  success: { bg: "#dcfce7", color: "#14532d", icon: "✓" },
  error:   { bg: "#fee2e2", color: "#7f1d1d", icon: "!" },
  info:    { bg: "#dbeafe", color: "#1e3a8a", icon: "i" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((opts: ToastOptions | string) => {
    const o: ToastOptions = typeof opts === "string" ? { message: opts } : opts;
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ToastItem = {
      id,
      type: o.type || "info",
      message: o.message,
      duration: o.duration ?? 4000,
    };
    setToasts((prev) => [...prev, item]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, item.duration);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            top: 20, right: 20,
            display: "flex", flexDirection: "column", gap: 10,
            zIndex: 10001,
            maxWidth: 400,
            pointerEvents: "none",
          }}
        >
          {toasts.map((t) => {
            const c = COLORS[t.type];
            return (
              <div
                key={t.id}
                role="status"
                style={{
                  background: c.bg,
                  color: c.color,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  pointerEvents: "auto",
                  animation: "toastSlideIn 0.25s ease-out",
                  minWidth: 240,
                }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: "50%",
                  background: c.color, color: c.bg, fontSize: 13, fontWeight: 700,
                  flexShrink: 0,
                }}>{c.icon}</span>
                <span style={{ flex: 1, lineHeight: 1.4, wordBreak: "break-word" }}>{t.message}</span>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  style={{ background: "transparent", border: "none", color: c.color, cursor: "pointer", fontSize: 16, padding: 4, lineHeight: 1, opacity: 0.6 }}
                  aria-label="Schliessen"
                >×</button>
              </div>
            );
          })}
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateX(20px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: console + native alert
    return (opts: ToastOptions | string) => {
      const o: ToastOptions = typeof opts === "string" ? { message: opts } : opts;
      console[o.type === "error" ? "error" : "log"](`[toast] ${o.message}`);
      if (typeof window !== "undefined" && (o.type === "error" || !o.type)) {
        window.alert(o.message);
      }
    };
  }
  return ctx;
}
