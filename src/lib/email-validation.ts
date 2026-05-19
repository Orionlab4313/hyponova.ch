/**
 * Email-Validation Helper (server-side, free).
 *
 * Layer 1: Format-Check (Regex, RFC-relaxed)
 * Layer 2: Disposable-Domain Blocklist (tempmail.com etc.)
 * Layer 3: DNS MX-Lookup (echte Mailserver existiert?)
 *
 * Layer 4 (mailcheck Did-You-Mean) laeuft client-side.
 */
import { promises as dns } from "node:dns";
import disposableDomainsList from "disposable-email-domains";

const disposableSet = new Set(disposableDomainsList);

export type EmailValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; reason: "format" | "disposable" | "no_mx" | "dns_error"; message: string };

const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validiert eine Email-Adresse in 3 Stufen.
 * Returns normalized email (lowercase + trimmed) on success.
 */
export async function validateEmail(rawEmail: string): Promise<EmailValidationResult> {
  const email = String(rawEmail || "").trim().toLowerCase();

  // Layer 1: Format
  if (!email || !FORMAT_RE.test(email)) {
    return { valid: false, reason: "format", message: "Ungültiges Email-Format" };
  }

  const domain = email.split("@")[1];
  if (!domain) {
    return { valid: false, reason: "format", message: "Domain fehlt" };
  }

  // Layer 2: Disposable
  if (disposableSet.has(domain)) {
    return {
      valid: false,
      reason: "disposable",
      message: "Wegwerf-Email-Adressen werden nicht akzeptiert",
    };
  }

  // Layer 3: DNS MX-Lookup
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: "no_mx",
        message: "Diese Email-Domain hat keinen Mailserver",
      };
    }
  } catch (err) {
    // ENODATA / ENOTFOUND = Domain hat keine MX-Records oder existiert nicht
    const errCode = (err as NodeJS.ErrnoException)?.code;
    if (errCode === "ENODATA" || errCode === "ENOTFOUND") {
      return {
        valid: false,
        reason: "no_mx",
        message: "Diese Email-Domain existiert nicht oder hat keinen Mailserver",
      };
    }
    // Andere DNS-Fehler (Timeout, Server-Down): pragmatisch akzeptieren statt blocken
    console.warn("[email-validation] DNS lookup failed for", domain, errCode);
    return { valid: true, normalized: email };
  }

  return { valid: true, normalized: email };
}
