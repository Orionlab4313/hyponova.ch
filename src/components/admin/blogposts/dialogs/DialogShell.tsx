"use client";

import { ReactNode } from "react";
import { IconX } from "../EditorIcons";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export default function DialogShell({ title, onClose, children, width = 560 }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 8,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px 24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              lineHeight: 1,
              padding: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Schliessen"
          >
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 4,
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  marginBottom: 6,
  marginTop: 14,
};

export const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#c8553d",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export const secondaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "#fff",
  color: "#333",
  border: "1px solid #ddd",
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};
