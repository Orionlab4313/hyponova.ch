import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Galerie, atomarer Block. Bilder werden als base64-enkodiertes JSON
 * im data-images-Attribut gespeichert, damit HTML-String-Parsing einfach bleibt.
 */
export const GalleryNode = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      images: { default: [] as { src: string; alt?: string }[] },
      columns: { default: 2 },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="gallery"]',
        getAttrs: (el) => {
          const raw = (el as HTMLElement).getAttribute("data-images") || "";
          let images: { src: string; alt?: string }[] = [];
          try {
            const decoded =
              typeof atob === "function" ? atob(raw) : Buffer.from(raw, "base64").toString("utf-8");
            const parsed = JSON.parse(decoded);
            if (Array.isArray(parsed)) images = parsed;
          } catch {
            images = [];
          }
          return {
            images,
            columns: Number((el as HTMLElement).getAttribute("data-columns") || "2") || 2,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const json = JSON.stringify(node.attrs.images || []);
    const b64 =
      typeof btoa === "function" ? btoa(json) : Buffer.from(json).toString("base64");
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "gallery",
        "data-images": b64,
        "data-columns": String(node.attrs.columns || 2),
        class: "tiptap-gallery",
      }),
      ["span", {}, `Galerie: ${(node.attrs.images || []).length} Bild(er)`],
    ];
  },
});
