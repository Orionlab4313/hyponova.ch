import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Highlight-Box — editierbar im Editor, rendert als
 * <div data-type="highlight-box">…inner…</div> in HTML.
 * Im Frontend wird das zu .highlight-box (violetter Akzentkasten).
 */
export const HighlightBoxNode = Node.create({
  name: "highlightBox",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="highlight-box"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "highlight-box",
        class: "tiptap-highlight-box",
      }),
      0,
    ];
  },
});
