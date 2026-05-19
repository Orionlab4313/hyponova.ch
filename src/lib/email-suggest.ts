/**
 * Client-side Email "Did You Mean" Suggestion via mailcheck.
 * Erkennt Tippfehler in Domain (gmial.com -> gmail.com) und TLD (.co -> .com).
 */

// mailcheck hat keine TypeScript-Types
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Mailcheck from "mailcheck";

export type EmailSuggestion = {
  full: string;
  address: string;
  domain: string;
};

/**
 * Schlaegt eine korrigierte Email-Adresse vor wenn ein wahrscheinlicher
 * Tippfehler erkannt wird. Returns null wenn keine Suggestion vorhanden.
 *
 * Beispiel:
 *   suggestEmail("test@gmial.com") -> { full: "test@gmail.com", ... }
 *   suggestEmail("test@gmail.com") -> null
 */
export function suggestEmail(email: string): EmailSuggestion | null {
  if (!email || typeof email !== "string") return null;
  const cleaned = email.trim();
  if (!cleaned || !cleaned.includes("@")) return null;

  let result: EmailSuggestion | null = null;
  Mailcheck.run({
    email: cleaned,
    suggested: (suggestion: EmailSuggestion) => {
      result = suggestion;
    },
    empty: () => {
      result = null;
    },
  });
  return result;
}
