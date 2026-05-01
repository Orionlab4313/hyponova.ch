"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const ACCENT = "#c8553d";

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  function close(value: boolean) {
    if (state) state.resolve(value);
    setState(null);
  }

  // ESC + Body-Scroll-Lock
  useEffect(() => {
    if (!state) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          onClick={() => close(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(10,10,10,0.6)", zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            animation: "confirmFadeIn 0.15s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            style={{
              background: "#fff",
              maxWidth: 460,
              width: "100%",
              padding: "24px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              animation: "confirmSlideIn 0.2s ease-out",
            }}
          >
            <h2 id="confirm-title" style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 }}>
              {state.title}
            </h2>
            {state.body && (
              <p style={{ margin: "0 0 24px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                {state.body}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => close(false)}
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#444",
                  border: "1px solid #ddd",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minHeight: 44,
                }}
              >
                {state.cancelLabel || "Abbrechen"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                autoFocus
                style={{
                  padding: "10px 20px",
                  background: state.danger ? "#dc2626" : ACCENT,
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minHeight: 44,
                }}
              >
                {state.confirmLabel || (state.danger ? "Löschen" : "OK")}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes confirmFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes confirmSlideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Fallback: native confirm wenn Provider fehlt
    return (opts: ConfirmOptions): Promise<boolean> => {
      const text = opts.body ? `${opts.title}\n\n${opts.body}` : opts.title;
      return Promise.resolve(typeof window !== "undefined" && window.confirm(text));
    };
  }
  return ctx;
}
