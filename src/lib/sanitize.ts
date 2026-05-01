/**
 * Server-side HTML-Sanitizer fuer Tiptap-Editor-Output.
 *
 * Implementiert als reine String-Manipulation OHNE externe Dependency,
 * nachdem isomorphic-dompurify auf Vercel/Next 16 mit Module-Load-Crash
 * geantwortet hat (JSDOM/cssom Konflikt).
 *
 * Defense-in-Depth: Auth-Schicht ist die primaere Verteidigung. Sanitize
 * killt zusaetzlich die haeufigsten XSS-Vektoren falls ein Admin-Account
 * mal kompromittiert oder ein Bug im Editor.
 */

const DANGEROUS_TAG_REGEX = /<\s*(script|style|iframe|object|embed|form|input|button|link|meta|base)\b[^>]*>([\s\S]*?<\s*\/\s*\1\s*>)?/gi;
const VOID_DANGEROUS_TAG_REGEX = /<\s*\/?\s*(link|meta|base)\b[^>]*>/gi;
const EVENT_HANDLER_REGEX = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL_REGEX = /(href|src|action|formaction|background|poster)\s*=\s*("|')\s*(javascript|vbscript|data):[^"']*\2/gi;

export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";

  let out = String(html);
  out = out.replace(DANGEROUS_TAG_REGEX, "");
  out = out.replace(VOID_DANGEROUS_TAG_REGEX, "");
  out = out.replace(EVENT_HANDLER_REGEX, "");
  out = out.replace(JS_URL_REGEX, '$1=$2#$2');

  return out;
}
