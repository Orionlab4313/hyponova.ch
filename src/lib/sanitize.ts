import DOMPurify from "isomorphic-dompurify";

/**
 * Saeubert HTML, das vom Tiptap-Editor kommt, bevor es in die DB gespeichert wird.
 *
 * Allowlist orientiert sich an dem, was der Tiptap-Editor + die Custom-Nodes
 * (Highlight-Box, Video-Embed, Button, Gallery) ueberhaupt ausgeben koennen.
 * Alles andere — insbesondere <script>, inline-Handler wie onerror, javascript:-URLs —
 * wird entfernt. Defense-in-Depth zur Auth-Schicht.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Block-Elemente
      "p", "div", "span", "br", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "pre", "code",
      "ul", "ol", "li",
      // Inline-Markup
      "a", "strong", "em", "b", "i", "u", "s", "mark", "sub", "sup",
      // Medien
      "img", "figure", "figcaption",
      // Tabellen
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "title",
      "src", "alt", "width", "height", "loading",
      "class", "id",
      "data-type", "data-provider", "data-id", "data-variant",
      "data-images", "data-columns",
      "colspan", "rowspan",
      "style",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
    // FORBID_TAGS doppelt gemoppelt — explizit verbieten falls jemand spaeter
    // die ALLOWED_TAGS-Liste lockert.
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
    // Kein SVG zulassen — kann Script enthalten und wird im Blog nicht gebraucht
    USE_PROFILES: { html: true },
  });
}
