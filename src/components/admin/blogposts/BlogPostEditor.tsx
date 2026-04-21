"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { HighlightBoxNode } from "./nodes/HighlightBoxNode";
import { VideoEmbedNode } from "./nodes/VideoEmbedNode";
import { ButtonNode } from "./nodes/ButtonNode";
import { GalleryNode } from "./nodes/GalleryNode";
import BlogPostToolbar from "./BlogPostToolbar";
import SlashMenu from "./SlashMenu";

interface Props {
  initialHtml: string;
  onChange: (html: string) => void;
}

/**
 * Notion-Style Enter-Verhalten:
 * Bricht die aktuelle Zeile auf wie gewohnt, startet den neuen Absatz aber
 * ohne aktive Marks (Bold, Italic, Underline etc.). Innerhalb von Listen,
 * Zitaten und Code-Blöcken wird das Default-Verhalten beibehalten, sonst
 * zerstören wir deren Enter-Logik.
 */
const ResetMarksOnEnter = Extension.create({
  name: "resetMarksOnEnter",
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this;
        // In Listen / Zitaten / Code-Blöcken Default lassen
        if (
          editor.isActive("listItem") ||
          editor.isActive("blockquote") ||
          editor.isActive("codeBlock")
        ) {
          return false;
        }
        // Nur wenn tatsächlich Marks aktiv sind, greifen wir ein
        const hasMarks =
          editor.isActive("bold") ||
          editor.isActive("italic") ||
          editor.isActive("underline") ||
          editor.isActive("strike") ||
          editor.isActive("code");
        if (!hasMarks) return false;
        return editor.chain().splitBlock({ keepMarks: false }).run();
      },
    };
  },
});

export default function BlogPostEditor({ initialHtml, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder: "Schreib hier deinen Artikel…",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      ResetMarksOnEnter,
      HighlightBoxNode,
      VideoEmbedNode,
      ButtonNode,
      GalleryNode,
    ],
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div
        style={{
          minHeight: 400,
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 6,
          padding: 16,
          color: "#999",
        }}
      >
        Editor wird geladen…
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <BlogPostToolbar editor={editor} />
      <EditorContent editor={editor} />
      <SlashMenu editor={editor} />
      <style>{`
        .tiptap-editor-content {
          min-height: 400px;
          padding: 20px 24px;
          outline: none;
          font-size: 16px;
          line-height: 1.7;
          color: #1a1a1a;
        }
        .tiptap-editor-content p { margin: 0 0 1em 0; }
        .tiptap-editor-content p:last-child { margin-bottom: 0; }
        .tiptap-editor-content h1 { font-size: 1.8rem; font-weight: 700; margin: 1.5em 0 0.6em; line-height: 1.2; }
        .tiptap-editor-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5em 0 0.6em; line-height: 1.3; }
        .tiptap-editor-content h3 { font-size: 1.2rem; font-weight: 600; margin: 1.3em 0 0.5em; line-height: 1.4; }
        /* Listen-Marker explizit wiederherstellen (Tailwind Preflight killt sie global) */
        .tiptap-editor-content ul {
          list-style: disc outside;
          padding-left: 1.5em;
          margin: 0 0 1em;
        }
        .tiptap-editor-content ol {
          list-style: decimal outside;
          padding-left: 1.5em;
          margin: 0 0 1em;
        }
        .tiptap-editor-content ul ul { list-style: circle outside; }
        .tiptap-editor-content ul ul ul { list-style: square outside; }
        .tiptap-editor-content li {
          margin-bottom: 0.4em;
        }
        .tiptap-editor-content li > p {
          margin: 0;
        }
        .tiptap-editor-content li::marker {
          color: #7c5cfc;
        }
        .tiptap-editor-content blockquote {
          border-left: 3px solid #7c5cfc;
          padding: 0.5em 1em;
          color: #555;
          margin: 1em 0;
          background: rgba(124, 92, 252, 0.04);
        }
        .tiptap-editor-content img { max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0; }
        .tiptap-editor-content a { color: #7c5cfc; text-decoration: underline; }
        .tiptap-editor-content strong { font-weight: 700; }
        .tiptap-editor-content em { font-style: italic; }
        .tiptap-editor-content u { text-decoration: underline; }
        .tiptap-editor-content s { text-decoration: line-through; }
        .tiptap-editor-content code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'SF Mono', Menlo, monospace;
          font-size: 0.92em;
        }
        .tiptap-editor-content pre {
          background: #111;
          color: #eee;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
        }
        .tiptap-editor-content hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 2em 0;
        }
        .tiptap-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #bbb;
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor-content .tiptap-highlight-box {
          background: rgba(124, 92, 252, 0.06);
          border-left: 3px solid #7c5cfc;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          margin: 1.5rem 0;
        }
        .tiptap-editor-content .tiptap-video-embed,
        .tiptap-editor-content .tiptap-gallery {
          display: block;
          margin: 1.5rem 0;
          padding: 16px 20px;
          background: #f8f8f8;
          border: 1px dashed #ccc;
          border-radius: 6px;
          font-size: 14px;
          color: #555;
          user-select: none;
        }
        .tiptap-editor-content .tiptap-cta-button {
          display: inline-block;
          margin: 1rem 0;
          padding: 10px 20px;
          background: #7c5cfc;
          color: #fff;
          border-radius: 4px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
        }
        .tiptap-editor-content .ProseMirror-selectednode {
          outline: 2px solid #7c5cfc;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
