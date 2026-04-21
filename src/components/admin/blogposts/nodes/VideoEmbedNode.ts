import { Node, mergeAttributes } from "@tiptap/core";

export const VideoEmbedNode = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      provider: { default: "youtube" },
      videoId: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
        getAttrs: (el) => ({
          provider: (el as HTMLElement).getAttribute("data-provider") || "youtube",
          videoId: (el as HTMLElement).getAttribute("data-id") || "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "video",
        "data-provider": node.attrs.provider,
        "data-id": node.attrs.videoId,
        class: "tiptap-video-embed",
      }),
      // Fallback-Inhalt für die Editor-Anzeige
      ["span", {}, `Video (${node.attrs.provider}): ${node.attrs.videoId}`],
    ];
  },
});
