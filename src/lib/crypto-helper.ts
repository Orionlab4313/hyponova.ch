import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * AES-256-GCM Verschluesselung fuer kleine Geheimnisse (z.B. TOTP-Secret in DB).
 *
 * Format der verschluesselten Strings: "v1:" + base64(iv | tag | ciphertext)
 * iv = 12 bytes, tag = 16 bytes, ciphertext = variable
 */

const VERSION = "v1";

function getKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET fehlt oder zu kurz fuer Crypto-Helper.");
  }
  // Aus dem Session-Secret einen festen 32-byte Key ableiten
  return createHash("sha256").update(secret).update("|crypto-helper|v1").digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

export function decryptSecret(stored: string): string | null {
  try {
    if (!stored.startsWith(`${VERSION}:`)) {
      // Legacy plain string (vor Migration), toleranter Fallback,
      // damit bestehende TOTP-Secrets nicht broken sind. Beim naechsten
      // setTotpSecret werden sie automatisch verschluesselt.
      return stored;
    }
    const buf = Buffer.from(stored.slice(VERSION.length + 1), "base64");
    if (buf.length < 28) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString("utf8");
  } catch {
    return null;
  }
}
