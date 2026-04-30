"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconH1,
  IconH2,
  IconH3,
  IconParagraph,
  IconBulletList,
  IconOrderedList,
  IconQuote,
  IconDivider,
  IconHighlight,
  IconVideo,
  IconButton,
  IconGallery,
  IconImage,
} from "./EditorIcons";

interface SlashItem {
  title: string;
  description: string;
  keywords: string[];
  icon: ReactNode;
  run: (editor: Editor) => void;
}

const ITEMS: SlashItem[] = [
  {
    title: "Überschrift 1",
    description: "Grosse Überschrift",
    keywords: ["h1", "heading", "uberschrift", "titel"],
    icon: <IconH1 />,
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Überschrift 2",
    description: "Mittelgrosse Überschrift",
    keywords: ["h2", "heading", "uberschrift"],
    icon: <IconH2 />,
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Überschrift 3",
    description: "Kleine Überschrift",
    keywords: ["h3", "heading", "uberschrift"],
    icon: <IconH3 />,
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Absatz",
    description: "Normaler Text",
    keywords: ["p", "paragraph", "absatz", "text"],
    icon: <IconParagraph />,
    run: (e) => e.chain().focus().setParagraph().run(),
  },
  {
    title: "Aufzählung",
    description: "Liste mit Punkten",
    keywords: ["ul", "list", "liste", "bullet", "punkte"],
    icon: <IconBulletList />,
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Nummerierte Liste",
    description: "Liste mit 1. 2. 3.",
    keywords: ["ol", "list", "liste", "nummer", "ordered"],
    icon: <IconOrderedList />,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Zitat",
    description: "Blockzitat",
    keywords: ["quote", "zitat", "blockquote"],
    icon: <IconQuote />,
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Trennlinie",
    description: "Horizontale Linie",
    keywords: ["hr", "divider", "trennlinie", "line"],
    icon: <IconDivider />,
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Highlight-Box",
    description: "Violetter Akzentkasten",
    keywords: ["highlight", "hinweis", "box", "info", "note"],
    icon: <IconHighlight />,
    run: (e) =>
      e
        .chain()
        .focus()
        .insertContent({
          type: "highlightBox",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Wichtiger Hinweis…" }],
            },
          ],
        })
        .run(),
  },
  {
    title: "Bild",
    description: "Bild hochladen",
    keywords: ["image", "bild", "foto", "upload"],
    icon: <IconImage />,
    run: () => {
      // Triggert den Hidden-File-Input der Toolbar via Click.
      // Der Input hat immer die class "blogpost-image-upload-input".
      const el = document.querySelector<HTMLInputElement>(
        ".blogpost-image-upload-input"
      );
      el?.click();
    },
  },
  {
    title: "Video",
    description: "YouTube oder Vimeo einbetten",
    keywords: ["video", "youtube", "vimeo", "embed"],
    icon: <IconVideo />,
    run: (e) => {
      // Öffnet den Video-Dialog via CustomEvent auf dem Editor-Container.
      e.view.dom.dispatchEvent(
        new CustomEvent("blogpost:openDialog", {
          bubbles: true,
          detail: { type: "video" },
        })
      );
    },
  },
  {
    title: "Galerie",
    description: "Mehrere Bilder im Grid",
    keywords: ["gallery", "galerie", "images", "grid"],
    icon: <IconGallery />,
    run: (e) => {
      e.view.dom.dispatchEvent(
        new CustomEvent("blogpost:openDialog", {
          bubbles: true,
          detail: { type: "gallery" },
        })
      );
    },
  },
  {
    title: "Button",
    description: "Call-to-Action Button",
    keywords: ["button", "cta", "action", "link"],
    icon: <IconButton />,
    run: (e) => {
      e.view.dom.dispatchEvent(
        new CustomEvent("blogpost:openDialog", {
          bubbles: true,
          detail: { type: "button" },
        })
      );
    },
  },
];

interface Props {
  editor: Editor;
}

export default function SlashMenu({ editor }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [slashStart, setSlashStart] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; flipUp: boolean }>({
    top: 0,
    left: 0,
    flipUp: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Text am Cursor lesen, `/xyz` Pattern erkennen
  useEffect(() => {
    const update = () => {
      const { selection } = editor.state;
      if (!selection.empty) {
        setOpen(false);
        return;
      }
      const { $from } = selection;
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        "\ufffc"
      );

      // Match /word am Ende (Wort aus Buchstaben, Zahlen, ä/ö/ü)
      const match = textBefore.match(/(?:^|\s)\/([\wäöüÄÖÜ]*)$/);
      if (!match) {
        setOpen(false);
        return;
      }

      const queryStr = match[1];
      const startOffset =
        $from.pos - queryStr.length - 1; // Position des "/"

      // Cursor-Koordinaten
      try {
        const coords = editor.view.coordsAtPos($from.pos);
        const menuHeight = 340;
        const menuWidth = 280;
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;

        let top = coords.bottom + 6;
        const flipUp = top + menuHeight > viewportH - 20;
        if (flipUp) top = coords.top - menuHeight - 6;
        if (top < 10) top = 10;

        let left = coords.left;
        if (left + menuWidth > viewportW - 10) {
          left = viewportW - menuWidth - 10;
        }
        if (left < 10) left = 10;

        setPos({ top, left, flipUp });
      } catch {
        // ignore
      }

      setQuery(queryStr);
      setSlashStart(startOffset);
      setSelectedIdx(0);
      setOpen(true);
    };

    editor.on("selectionUpdate", update);
    editor.on("update", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("update", update);
    };
  }, [editor]);

  const filtered = (() => {
    const q = query.toLowerCase().trim();
    if (!q) return ITEMS;
    return ITEMS.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      return item.keywords.some((k) => k.includes(q));
    });
  })();

  // Keyboard-Nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) =>
          filtered.length ? (i - 1 + filtered.length) % filtered.length : 0
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (filtered[selectedIdx]) {
          e.preventDefault();
          runItem(filtered[selectedIdx]);
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, selectedIdx]);

  function runItem(item: SlashItem) {
    const { selection } = editor.state;
    const to = selection.from;
    // "/query" entfernen
    editor
      .chain()
      .focus()
      .deleteRange({ from: slashStart, to })
      .run();
    // Command ausführen
    item.run(editor);
    setOpen(false);
  }

  if (!open || !filtered.length) return null;

  return (
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Block einfügen"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 280,
        maxHeight: 340,
        overflowY: "auto",
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
        zIndex: 2000,
        padding: 6,
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "6px 10px 4px",
        }}
      >
        Block einfügen
      </div>
      {filtered.map((item, i) => (
        <button
          key={item.title}
          type="button"
          role="option"
          aria-selected={i === selectedIdx}
          onMouseEnter={() => setSelectedIdx(i)}
          onMouseDown={(e) => {
            // mousedown damit der Editor den Fokus nicht verliert
            e.preventDefault();
            runItem(item);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 10px",
            border: "none",
            background: i === selectedIdx ? "rgba(200,85,61,0.1)" : "transparent",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
            borderRadius: 4,
            color: "#1a1a1a",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              flexShrink: 0,
              color: i === selectedIdx ? "#c8553d" : "#555",
              background: i === selectedIdx ? "#fff" : "#f5f5f5",
              border: "1px solid #e5e5e5",
              borderRadius: 4,
            }}
          >
            {item.icon}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
              {item.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 2,
                lineHeight: 1.3,
              }}
            >
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
