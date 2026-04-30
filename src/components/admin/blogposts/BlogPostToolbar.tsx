"use client";

import { Editor, useEditorState } from "@tiptap/react";
import { useEffect, useId, useState, type ReactNode } from "react";
import VideoEmbedDialog from "./dialogs/VideoEmbedDialog";
import ButtonDialog from "./dialogs/ButtonDialog";
import GalleryDialog from "./dialogs/GalleryDialog";
import { resizeImage } from "./imageResize";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrike,
  IconInlineCode,
  IconH1,
  IconH2,
  IconH3,
  IconParagraph,
  IconBulletList,
  IconOrderedList,
  IconQuote,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLink,
  IconImage,
  IconDivider,
  IconHighlight,
  IconVideo,
  IconGallery,
  IconButton,
} from "./EditorIcons";

interface Props {
  editor: Editor;
}

type ActiveDialog = null | "video" | "button" | "gallery";

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isCode: boolean;
  isH1: boolean;
  isH2: boolean;
  isH3: boolean;
  isParagraph: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isAlignLeft: boolean;
  isAlignCenter: boolean;
  isAlignRight: boolean;
  isLink: boolean;
}

export default function BlogPostToolbar({ editor }: Props) {
  const imageInputId = useId();
  const [uploading, setUploading] = useState(false);
  const [dialog, setDialog] = useState<ActiveDialog>(null);

  // Reaktiver State: liest die aktuell aktiven Marks/Nodes aus dem Editor.
  // useEditorState abonniert Transaktionen, sodass die Toolbar-Buttons
  // live auf Cursor-Bewegung und Selektionswechsel reagieren.
  const state = useEditorState<ToolbarState>({
    editor,
    selector: ({ editor }): ToolbarState => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isStrike: editor.isActive("strike"),
      isCode: editor.isActive("code"),
      isH1: editor.isActive("heading", { level: 1 }),
      isH2: editor.isActive("heading", { level: 2 }),
      isH3: editor.isActive("heading", { level: 3 }),
      isParagraph: editor.isActive("paragraph"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isAlignLeft: editor.isActive({ textAlign: "left" }),
      isAlignCenter: editor.isActive({ textAlign: "center" }),
      isAlignRight: editor.isActive({ textAlign: "right" }),
      isLink: editor.isActive("link"),
    }),
  });

  async function uploadImage(file: File): Promise<{ url: string } | { error: string }> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "inline");
    try {
      const res = await fetch("/api/admin/blogposts/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j.error) msg = j.error;
        } catch {
          try {
            const t = await res.text();
            if (t) msg = t.slice(0, 200);
          } catch {
            // ignore
          }
        }
        return { error: msg };
      }
      const json = await res.json();
      if (!json.url) return { error: "Keine URL in der Antwort" };
      return { url: json.url };
    } catch (err) {
      return { error: "Netzwerkfehler: " + String(err) };
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resized = await resizeImage(file).catch(() => file);
      const result = await uploadImage(resized);
      if ("url" in result) {
        editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      } else {
        alert("Bild-Upload fehlgeschlagen: " + result.error);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // Slash-Menu kann über CustomEvents die Dialog-Buttons triggern
  useEffect(() => {
    const el = editor.view.dom;
    const handler = (e: Event) => {
      const type = (e as CustomEvent).detail?.type;
      if (type === "video" || type === "button" || type === "gallery") {
        setDialog(type);
      }
    };
    el.addEventListener("blogpost:openDialog", handler as EventListener);
    return () => {
      el.removeEventListener("blogpost:openDialog", handler as EventListener);
    };
  }, [editor]);

  function addLink() {
    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("Link-URL", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const btn = (
    icon: ReactNode,
    isActive: boolean,
    onClick: () => void,
    title: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      style={{
        width: 34,
        height: 34,
        border: "1px solid " + (isActive ? "#c8553d" : "#e5e5e5"),
        background: isActive ? "rgba(200,85,61,0.1)" : "#fff",
        color: isActive ? "#c8553d" : "#333",
        borderRadius: 4,
        cursor: "pointer",
        fontFamily: "inherit",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {icon}
    </button>
  );

  const imageButtonStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: uploading ? "#c8553d" : "#333",
    borderRadius: 4,
    cursor: uploading ? "wait" : "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  const sep = (
    <div
      style={{
        width: 1,
        background: "#e5e5e5",
        alignSelf: "stretch",
        margin: "0 4px",
        flexShrink: 0,
      }}
    />
  );

  return (
    <>
      <div
        className="blogpost-toolbar"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          gap: 4,
          padding: "10px 12px",
          borderBottom: "1px solid #e5e5e5",
          background: "#fafafa",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {btn(<IconBold />, state.isBold, () => editor.chain().focus().toggleBold().run(), "Fett")}
        {btn(<IconItalic />, state.isItalic, () => editor.chain().focus().toggleItalic().run(), "Kursiv")}
        {btn(<IconUnderline />, state.isUnderline, () => editor.chain().focus().toggleUnderline().run(), "Unterstrichen")}
        {btn(<IconStrike />, state.isStrike, () => editor.chain().focus().toggleStrike().run(), "Durchgestrichen")}
        {btn(<IconInlineCode />, state.isCode, () => editor.chain().focus().toggleCode().run(), "Inline-Code")}
        {sep}
        {btn(<IconH1 />, state.isH1, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Überschrift 1")}
        {btn(<IconH2 />, state.isH2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Überschrift 2")}
        {btn(<IconH3 />, state.isH3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Überschrift 3")}
        {btn(<IconParagraph />, state.isParagraph && !state.isH1 && !state.isH2 && !state.isH3, () => editor.chain().focus().setParagraph().run(), "Absatz")}
        {sep}
        {btn(<IconBulletList />, state.isBulletList, () => editor.chain().focus().toggleBulletList().run(), "Aufzählung")}
        {btn(<IconOrderedList />, state.isOrderedList, () => editor.chain().focus().toggleOrderedList().run(), "Nummerierte Liste")}
        {btn(<IconQuote />, state.isBlockquote, () => editor.chain().focus().toggleBlockquote().run(), "Zitat")}
        {sep}
        {btn(<IconAlignLeft />, state.isAlignLeft, () => editor.chain().focus().setTextAlign("left").run(), "Linksbündig")}
        {btn(<IconAlignCenter />, state.isAlignCenter, () => editor.chain().focus().setTextAlign("center").run(), "Zentriert")}
        {btn(<IconAlignRight />, state.isAlignRight, () => editor.chain().focus().setTextAlign("right").run(), "Rechtsbündig")}
        {sep}
        {btn(<IconLink />, state.isLink, addLink, "Link einfügen")}
        <label htmlFor={imageInputId} style={imageButtonStyle} title="Bild hochladen" aria-label="Bild hochladen">
          <IconImage />
        </label>
        {btn(<IconDivider />, false, () => editor.chain().focus().setHorizontalRule().run(), "Trennlinie")}
        {sep}
        {btn(
          <IconHighlight />,
          false,
          () => {
            editor
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
              .run();
          },
          "Highlight-Box"
        )}
        {btn(<IconVideo />, false, () => setDialog("video"), "Video einbetten")}
        {btn(<IconGallery />, false, () => setDialog("gallery"), "Galerie")}
        {btn(<IconButton />, false, () => setDialog("button"), "Button")}
      </div>

      <input
        id={imageInputId}
        className="blogpost-image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: "none" }}
      />

      {dialog === "video" && (
        <VideoEmbedDialog
          onClose={() => setDialog(null)}
          onSubmit={(provider, videoId) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "videoEmbed",
                attrs: { provider, videoId },
              })
              .run();
            setDialog(null);
          }}
        />
      )}
      {dialog === "button" && (
        <ButtonDialog
          onClose={() => setDialog(null)}
          onSubmit={(label, href, variant) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "ctaButton",
                attrs: { label, href, variant },
              })
              .run();
            setDialog(null);
          }}
        />
      )}
      {dialog === "gallery" && (
        <GalleryDialog
          onClose={() => setDialog(null)}
          onSubmit={(images, columns) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "gallery",
                attrs: { images, columns },
              })
              .run();
            setDialog(null);
          }}
        />
      )}
    </>
  );
}
