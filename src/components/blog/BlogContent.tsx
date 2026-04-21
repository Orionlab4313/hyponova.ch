import { Fragment, type ReactNode } from "react";
import BlogVideoEmbed from "./BlogVideoEmbed";
import BlogButton from "./BlogButton";
import BlogGallery from "./BlogGallery";

interface Props {
  html: string;
}

/**
 * Splittet das HTML an Custom-Block-Markern und rendert die Teile:
 * Reguläres HTML via dangerouslySetInnerHTML (bleibt im .blog-prose-Kontext),
 * Custom-Nodes (data-type="…") als React-Components mit echter Isolation.
 *
 * Das spart einen vollwertigen HTML-Parser (JSDOM etc.) und läuft überall,
 * auch in Next.js Server Components ohne Browser-APIs.
 */
export default function BlogContent({ html }: Props) {
  const parts = splitContent(html);

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part.kind === "html" ? (
            <div dangerouslySetInnerHTML={{ __html: part.html }} />
          ) : (
            part.node
          )}
        </Fragment>
      ))}
    </>
  );
}

type Part = { kind: "html"; html: string } | { kind: "react"; node: ReactNode };

/**
 * Ein Custom-Block matcht als kompletter Outer-HTML-Ausdruck:
 *   <div data-type="video" data-provider="youtube" data-id="xxx"></div>
 *   <a data-type="button" data-variant="primary" href="…">Label</a>
 *   <div data-type="gallery" data-images="…base64-json…"></div>
 *   <div data-type="highlight-box">…inner html…</div>
 *
 * Wir scannen den HTML-String linear und extrahieren diese Blöcke.
 */
function splitContent(html: string): Part[] {
  const parts: Part[] = [];
  let cursor = 0;

  // Regex um die Start-Tags der Custom-Blocks zu finden.
  // Capture-Group 1 = Tag-Name, Group 2 = Attribute-String
  const openTag = /<(div|a)\b([^>]*?\bdata-type="(video|button|gallery|highlight-box)"[^>]*?)>/gi;

  let m: RegExpExecArray | null;
  while ((m = openTag.exec(html)) !== null) {
    const matchStart = m.index;
    const tagName = m[1].toLowerCase();
    const attrs = m[2];
    const type = m[3];
    const openEnd = openTag.lastIndex;

    // HTML vor dem Block
    if (matchStart > cursor) {
      parts.push({ kind: "html", html: html.slice(cursor, matchStart) });
    }

    // Finde das passende Close-Tag (nicht geschachtelt: wir akzeptieren nur
    // Blöcke ohne verschachtelte div/a mit data-type).
    const closeRegex = new RegExp(`</${tagName}>`, "i");
    closeRegex.lastIndex = openEnd;
    const closeMatch = html.slice(openEnd).match(new RegExp(`</${tagName}>`, "i"));
    let innerHtml = "";
    let blockEnd = openEnd;
    if (closeMatch && closeMatch.index !== undefined) {
      innerHtml = html.slice(openEnd, openEnd + closeMatch.index);
      blockEnd = openEnd + closeMatch.index + closeMatch[0].length;
    } else {
      // Kein Close-Tag gefunden → belasse Rest als HTML und brich ab
      parts.push({ kind: "html", html: html.slice(cursor) });
      cursor = html.length;
      break;
    }

    const node = renderCustomBlock(type, tagName, attrs, innerHtml);
    parts.push({ kind: "react", node });

    cursor = blockEnd;
    openTag.lastIndex = blockEnd;
  }

  if (cursor < html.length) {
    parts.push({ kind: "html", html: html.slice(cursor) });
  }

  return parts;
}

function renderCustomBlock(
  type: string,
  _tagName: string,
  attrs: string,
  innerHtml: string
): ReactNode {
  switch (type) {
    case "video": {
      const provider = (attrGet(attrs, "data-provider") || "youtube") as
        | "youtube"
        | "vimeo";
      const id = attrGet(attrs, "data-id") || "";
      if (!id) return null;
      return <BlogVideoEmbed provider={provider} videoId={id} />;
    }
    case "button": {
      const href = attrGet(attrs, "href") || "#";
      const variant = (attrGet(attrs, "data-variant") || "primary") as
        | "primary"
        | "secondary";
      const label = stripTags(innerHtml).trim() || "Mehr erfahren";
      return <BlogButton href={href} label={label} variant={variant} />;
    }
    case "gallery": {
      const imagesB64 = attrGet(attrs, "data-images") || "";
      let images: { src: string; alt?: string }[] = [];
      try {
        const parsed = JSON.parse(b64decode(imagesB64));
        if (Array.isArray(parsed)) images = parsed;
      } catch {
        images = [];
      }
      const cols = Number(attrGet(attrs, "data-columns") || "2") === 3 ? 3 : 2;
      return <BlogGallery images={images} columns={cols} />;
    }
    case "highlight-box": {
      return (
        <div
          className="highlight-box"
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
      );
    }
    default:
      return null;
  }
}

function attrGet(attrs: string, name: string): string | null {
  const re = new RegExp(`${name}="([^"]*)"`, "i");
  const m = attrs.match(re);
  return m ? m[1] : null;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

function b64decode(s: string): string {
  if (!s) return "";
  // Funktioniert in Node (SSR) und Browser
  if (typeof atob === "function") {
    try {
      return decodeURIComponent(escape(atob(s)));
    } catch {
      return atob(s);
    }
  }
  return Buffer.from(s, "base64").toString("utf-8");
}
