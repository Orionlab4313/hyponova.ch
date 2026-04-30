"use client";

import { useState } from "react";
import DialogShell, {
  labelStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
} from "./DialogShell";
import { IconX } from "../EditorIcons";

interface Props {
  onClose: () => void;
  onSubmit: (images: { src: string; alt?: string }[], columns: number) => void;
}

export default function GalleryDialog({ onClose, onSubmit }: Props) {
  const [images, setImages] = useState<{ src: string; alt?: string }[]>([]);
  const [columns, setColumns] = useState<2 | 3>(2);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: { src: string; alt?: string }[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "gallery");
      try {
        const res = await fetch("/api/admin/blogposts/upload", {
          method: "POST",
          body: form,
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url) uploaded.push({ src: json.url, alt: file.name });
        }
      } catch {
        // skip
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function remove(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <DialogShell title="Galerie einfügen" onClose={onClose} width={640}>
      <label style={labelStyle}>Bilder hochladen</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={uploading}
      />
      {uploading && (
        <div style={{ fontSize: 13, color: "#c8553d", marginTop: 8 }}>
          Hochladen …
        </div>
      )}

      {images.length > 0 && (
        <>
          <label style={labelStyle}>Vorschau ({images.length} Bilder)</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 6,
            }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                style={{ position: "relative", aspectRatio: "1 / 1" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  aria-label="Entfernen"
                >
                  <IconX width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <label style={labelStyle}>Spalten</label>
      <div style={{ display: "flex", gap: 8 }}>
        {([2, 3] as const).map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setColumns(c)}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid " + (columns === c ? "#c8553d" : "#ddd"),
              background: columns === c ? "rgba(200,85,61,0.1)" : "#fff",
              color: columns === c ? "#c8553d" : "#333",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {c} Spalten
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
          onClick={() => onSubmit(images, columns)}
          style={primaryBtnStyle}
          disabled={!images.length}
        >
          Einfügen
        </button>
      </div>
    </DialogShell>
  );
}
