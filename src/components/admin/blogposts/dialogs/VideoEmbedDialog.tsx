"use client";

import { useState } from "react";
import DialogShell, {
  inputStyle,
  labelStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
} from "./DialogShell";
import { parseVideoUrl } from "@/components/blog/BlogVideoEmbed";

interface Props {
  onClose: () => void;
  onSubmit: (provider: "youtube" | "vimeo", videoId: string) => void;
}

export default function VideoEmbedDialog({ onClose, onSubmit }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const parsed = parseVideoUrl(url.trim());
    if (!parsed) {
      setError("URL nicht erkannt. YouTube oder Vimeo-Link einfügen.");
      return;
    }
    onSubmit(parsed.provider, parsed.id);
  }

  return (
    <DialogShell title="Video einbetten" onClose={onClose}>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
        YouTube- oder Vimeo-URL einfügen. Das Video wird responsive im 16:9-Format gerendert.
      </p>
      <label style={labelStyle}>Video-URL</label>
      <input
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError("");
        }}
        placeholder="https://www.youtube.com/watch?v=…"
        style={inputStyle}
        autoFocus
      />
      {error && (
        <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>
      )}
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
        <button type="button" onClick={submit} style={primaryBtnStyle}>
          Einfügen
        </button>
      </div>
    </DialogShell>
  );
}
