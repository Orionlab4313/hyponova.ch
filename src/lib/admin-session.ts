import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Leichte signierte Tokens für den Admin-Auth-Flow.
 * Wird benutzt für:
 *   - Step-1 → Step-2 Brücken-Token (Passwort ok, jetzt 2FA-Code)
 *   - Final-Auth-Cookie (Passwort + 2FA ok)
 * Format: base64url(payload) + "." + base64url(hmac).
 */

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET fehlt oder ist zu kurz (mindestens 32 Zeichen). " +
        "In Vercel als Env-Variable setzen."
    );
  }
  return secret;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export type AdminTokenPayload = {
  stage: "pw-ok" | "full" | "site";
  exp: number;
  nonce: string;
};

export function signAdminToken(stage: "pw-ok" | "full" | "site", ttlSeconds: number): string {
  const payload: AdminTokenPayload = {
    stage,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(8).toString("hex"),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(createHmac("sha256", getSecret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null): AdminTokenPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    // Env fehlt → kein Token kann gueltig sein
    return null;
  }
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = unb64url(sig);
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(unb64url(body).toString("utf-8")) as AdminTokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
