/**
 * Email-Validation Helper (server-side).
 *
 * Layer 1: Format-Check (Regex, RFC-relaxed)
 * Layer 2: TLD-Allowlist (faengt Tippfehler wie .con, .cm, .cmo, .om sofort offline)
 * Layer 3: Disposable-Domain Blocklist (tempmail.com etc.)
 * Layer 4: Reoon Email Verifier API (echte SMTP-Pruefung beim Mailserver)
 *          1000 Verifications/Monat free, dann $5/mo fuer 10k
 *          Falls REOON_API_KEY nicht gesetzt: Fallback auf DNS MX-Lookup
 *
 * Layer 5 (mailcheck Did-You-Mean) laeuft client-side.
 */
import { promises as dns } from "node:dns";
import disposableDomainsList from "disposable-email-domains";

const disposableSet = new Set(disposableDomainsList);

// ICANN gTLDs + gaengige ccTLDs + neue gTLDs.
// Strenge Liste: was hier nicht drin ist, wird zurueckgewiesen.
const ALLOWED_TLDS = new Set([
  "com", "org", "net", "info", "biz", "name", "pro", "aero", "museum",
  "ch", "li", "de", "at", "fr", "it", "es", "pt", "nl", "be", "lu",
  "uk", "co.uk", "ie", "dk", "se", "no", "fi", "is",
  "pl", "cz", "sk", "hu", "ro", "bg", "ru", "ua", "rs", "hr", "si",
  "gr", "tr", "cy", "mt",
  "us", "ca", "mx", "br", "ar", "cl", "co", "pe", "ve",
  "jp", "cn", "kr", "tw", "hk", "sg", "my", "th", "vn", "id", "ph", "in", "pk", "bd",
  "au", "nz",
  "ae", "sa", "il", "eg", "za", "ng", "ke", "ma",
  "app", "dev", "io", "ai", "tech", "shop", "online", "store", "cloud", "design",
  "blog", "news", "media", "agency", "studio", "digital", "global", "world", "today",
  "academy", "expert", "guru", "company", "business", "solutions", "services",
  "consulting", "international", "group", "center", "network", "systems",
  "email", "site", "website", "page", "wiki", "xyz", "top", "live", "life",
  "fyi", "rocks", "ninja", "cool", "fun", "club", "tv", "fm", "me", "cc", "ws",
  "eu", "int", "swiss",
]);

export type EmailValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; reason: "format" | "tld" | "disposable" | "no_mx" | "smtp_invalid" | "smtp_unknown"; message: string };

const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractTld(domain: string): string {
  const parts = domain.toLowerCase().split(".");
  if (parts.length < 2) return "";
  if (parts.length >= 3) {
    const twoLevel = parts.slice(-2).join(".");
    if (ALLOWED_TLDS.has(twoLevel)) return twoLevel;
  }
  return parts[parts.length - 1];
}

type ReoonResponse = {
  email?: string;
  status?: "valid" | "invalid" | "disposable" | "role_account" | "unknown" | "safe_to_send";
  is_deliverable?: boolean;
  is_disposable?: boolean;
  is_role_account?: boolean;
  is_safe_to_send?: boolean;
  mx_accepts_mail?: boolean;
  syntax_valid?: boolean;
  can_connect_smtp?: boolean;
  error?: string;
};

/**
 * Reoon Email Verifier API call.
 * https://emailverifier.reoon.com/
 * Returns null if API-Key not set or request fails (fallback to DNS).
 */
async function reoonVerify(email: string): Promise<ReoonResponse | null> {
  const apiKey = process.env.REOON_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${encodeURIComponent(apiKey)}&mode=power`;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000); // 8s Timeout
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn("[reoon] API status:", res.status);
      return null;
    }
    return (await res.json()) as ReoonResponse;
  } catch (err) {
    console.warn("[reoon] verify failed:", err);
    return null;
  }
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

  // Layer 2: TLD-Allowlist (offline, faengt .con, .cm, .cmo etc.)
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

  // Layer 4: Reoon API (echte SMTP-Pruefung)
  const reoon = await reoonVerify(email);
  if (reoon) {
    // Reoon meldet die Adresse als ungueltig
    if (reoon.status === "invalid" || reoon.is_deliverable === false) {
      return {
        valid: false,
        reason: "smtp_invalid",
        message: "Diese Email-Adresse existiert nicht. Bitte prüfen Sie auf Tippfehler.",
      };
    }
    // Reoon meldet disposable (zweite Schicht falls Liste unvollstaendig)
    if (reoon.is_disposable === true || reoon.status === "disposable") {
      return {
        valid: false,
        reason: "disposable",
        message: "Wegwerf-Email-Adressen werden nicht akzeptiert",
      };
    }
    // Reoon "valid" oder "safe_to_send": durchwinken
    if (reoon.status === "valid" || reoon.status === "safe_to_send" || reoon.is_safe_to_send === true) {
      return { valid: true, normalized: email };
    }
    // Reoon "unknown": MX-Server hat keine eindeutige Antwort gegeben
    // (passiert bei Gmail/Outlook absichtlich, bei catch-all Domains, etc.)
    // -> Pragmatisch akzeptieren statt blocken (besser false-positive als false-negative)
    if (reoon.status === "unknown") {
      console.log("[email-validation] Reoon unknown for", email, "- accepting");
      return { valid: true, normalized: email };
    }
  }

  // Layer 4-fallback: Wenn Reoon nicht verfuegbar, DNS MX + A-Record Check
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

  if (!hasMailHost) {
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords && aRecords.length > 0) {
        hasMailHost = true;
      }
    } catch (err) {
      const aErrCode = (err as NodeJS.ErrnoException)?.code;
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
    if (dnsErrorCode === "ENOTFOUND" || dnsErrorCode === "ENODATA") {
      return {
        valid: false,
        reason: "no_mx",
        message: "Diese Email-Domain existiert nicht oder hat keinen Mailserver",
      };
    }
    console.warn("[email-validation] DNS lookup failed for", domain, dnsErrorCode);
    return { valid: true, normalized: email };
  }

  return { valid: true, normalized: email };
}
