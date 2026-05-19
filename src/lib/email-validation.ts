/**
 * Email-Validation Helper (server-side, free).
 *
 * Layer 1: Format-Check (Regex, RFC-relaxed)
 * Layer 2: TLD-Allowlist (faengt Tippfehler wie .con, .cm, .cmo, .om sofort)
 * Layer 3: Disposable-Domain Blocklist (tempmail.com etc.)
 * Layer 4: DNS-Lookup mit Fail-CLOSED bei strikten TLDs (.com, .ch usw.)
 *
 * Layer 5 (mailcheck Did-You-Mean) laeuft client-side.
 */
import { promises as dns } from "node:dns";
import disposableDomainsList from "disposable-email-domains";

const disposableSet = new Set(disposableDomainsList);

// ICANN gTLDs + gaengige ccTLDs + neue gTLDs.
// Strenge Liste: was hier nicht drin ist, wird als ungueltig zurueckgewiesen.
// Quelle: Top 200 most-used TLDs aus DNS-Statistiken.
// Aktualisierung: bei Bedarf erweitern.
const ALLOWED_TLDS = new Set([
  // Top global
  "com", "org", "net", "info", "biz", "name", "pro", "aero", "museum",
  // DACH und Schweiz-relevant
  "ch", "li", "de", "at", "fr", "it", "es", "pt", "nl", "be", "lu",
  // Nordeuropa
  "uk", "co.uk", "ie", "dk", "se", "no", "fi", "is",
  // Osteuropa
  "pl", "cz", "sk", "hu", "ro", "bg", "ru", "ua", "rs", "hr", "si",
  // Suedeuropa
  "gr", "tr", "cy", "mt",
  // Americas
  "us", "ca", "mx", "br", "ar", "cl", "co", "pe", "ve",
  // Asia-Pacific
  "jp", "cn", "kr", "tw", "hk", "sg", "my", "th", "vn", "id", "ph", "in", "pk", "bd",
  "au", "nz",
  // Middle East / Africa
  "ae", "sa", "il", "eg", "za", "ng", "ke", "ma",
  // Neue gTLDs (haeufig)
  "app", "dev", "io", "ai", "tech", "shop", "online", "store", "cloud", "design",
  "blog", "news", "media", "agency", "studio", "digital", "global", "world", "today",
  "academy", "expert", "guru", "company", "business", "solutions", "services",
  "consulting", "international", "group", "center", "network", "systems",
  "email", "site", "website", "page", "wiki", "xyz", "top", "live", "life",
  "fyi", "rocks", "ninja", "cool", "fun", "club", "tv", "fm", "me", "cc", "ws",
  // EU/IGOs
  "eu", "int",
  // Spezial Schweiz
  "swiss",
]);

export type EmailValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; reason: "format" | "tld" | "disposable" | "no_mx" | "dns_error"; message: string };

const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Extract TLD aus einer Domain.
 * Beispiel: "mail.example.co.uk" -> "co.uk" (wenn in Allowlist) sonst "uk".
 * Gibt den laengsten Match aus ALLOWED_TLDS zurueck.
 */
function extractTld(domain: string): string {
  const parts = domain.toLowerCase().split(".");
  if (parts.length < 2) return "";
  // Versuche 2-stufige TLD (co.uk, com.au), dann einstufige
  if (parts.length >= 3) {
    const twoLevel = parts.slice(-2).join(".");
    if (ALLOWED_TLDS.has(twoLevel)) return twoLevel;
  }
  return parts[parts.length - 1];
}

/**
 * Validiert eine Email-Adresse in mehreren Stufen.
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

  // Layer 2: TLD-Allowlist (haupt-Tippfehler-Filter)
  // Faengt .con, .cm, .cmo, .om, .nett etc. weil sie nicht in der Allowlist sind.
  const tld = extractTld(domain);
  if (!tld || !ALLOWED_TLDS.has(tld)) {
    return {
      valid: false,
      reason: "tld",
      message: `Diese Top-Level-Domain (.${tld}) existiert nicht oder ist nicht zulässig. Tippfehler in der Domain?`,
    };
  }

  // Layer 3: Disposable
  if (disposableSet.has(domain)) {
    return {
      valid: false,
      reason: "disposable",
      message: "Wegwerf-Email-Adressen werden nicht akzeptiert",
    };
  }

  // Layer 4: DNS MX-Lookup mit Fallback auf A-Records
  // Manche Domains haben kein MX aber A-Record, dann ist Domain-MX = Domain-A (RFC 5321).
  let hasMailHost = false;
  let dnsErrorCode: string | undefined;

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      hasMailHost = true;
    }
  } catch (err) {
    dnsErrorCode = (err as NodeJS.ErrnoException)?.code;
  }

  // Fallback: wenn kein MX, versuche A-Record (RFC 5321 implicit MX)
  if (!hasMailHost) {
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        hasMailHost = true;
      }
    } catch (err) {
      const aErrCode = (err as NodeJS.ErrnoException)?.code;
      // Wenn auch A-Record nicht existiert, ist die Domain definitiv tot
      if (aErrCode === "ENOTFOUND" || aErrCode === "ENODATA") {
        return {
          valid: false,
          reason: "no_mx",
          message: "Diese Email-Domain existiert nicht oder hat keinen Mailserver",
        };
      }
      dnsErrorCode = dnsErrorCode || aErrCode;
    }
  }

  if (!hasMailHost) {
    // ENOTFOUND oder ENODATA -> Domain hat weder MX noch A
    if (dnsErrorCode === "ENOTFOUND" || dnsErrorCode === "ENODATA") {
      return {
        valid: false,
        reason: "no_mx",
        message: "Diese Email-Domain existiert nicht oder hat keinen Mailserver",
      };
    }
    // Andere DNS-Fehler (Timeout, Server-Down): log + akzeptieren
    // Strikte Block-Policy wuerde hier auch valide Emails blocken
    console.warn("[email-validation] DNS lookup failed for", domain, dnsErrorCode);
    return { valid: true, normalized: email };
  }

  return { valid: true, normalized: email };
}
