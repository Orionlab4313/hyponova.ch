import { createServiceClient } from "./supabase";

/**
 * DB-basierter Rate-Limiter ueber die Tabelle `rate_limit_attempts`.
 *
 * Schema (Migration legt das an):
 *   bucket text, key text, count int, window_start timestamptz
 *
 * Idee: pro (bucket,key) ein laufendes Zaehlfenster. Wenn das Fenster
 * abgelaufen ist, wird beim naechsten Hit auf 1 zurueckgesetzt.
 *
 * Robustness: bei DB-Fehlern fail-OPEN (Login erlauben), wir wollen
 * niemanden ausschliessen wegen einer Infrastruktur-Stoerung.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function checkRateLimit(opts: {
  bucket: string;
  key: string;
  max: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { bucket, key, max, windowSeconds } = opts;
  const sb = createServiceClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);

  try {
    const { data: row } = await sb
      .from("rate_limit_attempts")
      .select("count, window_start")
      .eq("bucket", bucket)
      .eq("key", key)
      .maybeSingle();

    if (!row) {
      await sb
        .from("rate_limit_attempts")
        .insert({ bucket, key, count: 1, window_start: now.toISOString() });
      return { ok: true, remaining: max - 1, retryAfterSeconds: 0 };
    }

    const windowStart = new Date(row.window_start);
    if (windowStart < cutoff) {
      // Fenster abgelaufen → reset
      await sb
        .from("rate_limit_attempts")
        .update({ count: 1, window_start: now.toISOString() })
        .eq("bucket", bucket)
        .eq("key", key);
      return { ok: true, remaining: max - 1, retryAfterSeconds: 0 };
    }

    if (row.count >= max) {
      const retry = Math.max(
        0,
        windowSeconds - Math.floor((now.getTime() - windowStart.getTime()) / 1000)
      );
      return { ok: false, remaining: 0, retryAfterSeconds: retry };
    }

    await sb
      .from("rate_limit_attempts")
      .update({ count: row.count + 1 })
      .eq("bucket", bucket)
      .eq("key", key);
    return { ok: true, remaining: max - row.count - 1, retryAfterSeconds: 0 };
  } catch (err) {
    // Fail-open bei Infra-Fehler — sonst sperren wir uns selbst aus
    console.error("Rate-Limit DB error:", err);
    return { ok: true, remaining: max, retryAfterSeconds: 0 };
  }
}

/** Setzt den Counter zurueck (nach erfolgreichem Login). */
export async function resetRateLimit(bucket: string, key: string) {
  try {
    const sb = createServiceClient();
    await sb.from("rate_limit_attempts").delete().eq("bucket", bucket).eq("key", key);
  } catch (err) {
    console.error("Rate-Limit reset error:", err);
  }
}

/** IP aus Request-Headers extrahieren — Vercel setzt x-forwarded-for. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
