import { Node, mergeAttributes } from "@tiptap/core";

export const ButtonNode = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      href: { default: "#" },
      label: { default: "Mehr erfahren" },
      variant: { default: "primary" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="button"]',
        getAttrs: (el) => ({
          href: (el as HTMLElement).getAttribute("href") || "#",
          label: (el as HTMLElement).textContent || "",
          variant:
            (el as HTMLElement).getAttribute("data-variant") || "primary",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-type": "button",
        "data-variant": node.attrs.variant,
        href: node.attrs.href,
        class: "tiptap-cta-button",
      }),
      node.attrs.label || "Mehr erfahren",
    ];
  },
});
