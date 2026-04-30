"use client";

import { useState } from "react";
import DialogShell, {
  inputStyle,
  labelStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
} from "./DialogShell";

interface Props {
  onClose: () => void;
  onSubmit: (label: string, href: string, variant: "primary" | "secondary") => void;
}

export default function ButtonDialog({ onClose, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [variant, setVariant] = useState<"primary" | "secondary">("primary");

  function submit() {
    if (!label.trim() || !href.trim()) return;
    onSubmit(label.trim(), href.trim(), variant);
  }

  return (
    <DialogShell title="Button einfügen" onClose={onClose}>
      <label style={labelStyle}>Button-Text</label>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="z.B. Kostenloses Erstgespräch"
        style={inputStyle}
        autoFocus
      />
      <label style={labelStyle}>Link-URL</label>
      <input
        value={href}
        onChange={(e) => setHref(e.target.value)}
        placeholder="/termin oder https://…"
        style={inputStyle}
      />
      <label style={labelStyle}>Stil</label>
      <div style={{ display: "flex", gap: 8 }}>
        {(["primary", "secondary"] as const).map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => setVariant(v)}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid " + (variant === v ? "#c8553d" : "#ddd"),
              background: variant === v ? "rgba(200,85,61,0.1)" : "#fff",
              color: variant === v ? "#c8553d" : "#333",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {v === "primary" ? "Primär (violett)" : "Sekundär (hell)"}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 20,
        }}
      >
        <button type="button" onClick={onClose} style={secondaryBtnStyle}>
          Abbrechen
        </button>
        <button
          type="button"
          onClick={submit}
          style={primaryBtnStyle}
          disabled={!label.trim() || !href.trim()}
        >
          Einfügen
        </button>
      </div>
    </DialogShell>
  );
}
