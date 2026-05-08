-- Migration: Security-Hardening (Rate-Limit + Site-Password-Hash)
-- Datum: 2026-04-30
-- Beschreibung:
--   1. Tabelle `rate_limit_attempts` fuer DB-basierten Rate-Limiter
--      (Login + Passwort-Reset).
--   2. Stellt sicher, dass site_password_hash gesetzt ist, wenn die
--      Spalte leer war, wird der bisherige Default ("Möhlin4313") als
--      bcrypt-Hash via pgcrypto eingetragen.

CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  bucket text NOT NULL,
  key text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, key)
);

CREATE INDEX IF NOT EXISTS rate_limit_attempts_window_idx
  ON rate_limit_attempts (window_start);

-- Site-Password initial setzen, falls leer
CREATE EXTENSION IF NOT EXISTS pgcrypto;
UPDATE admin_settings
SET site_password_hash = crypt('Möhlin4313', gen_salt('bf', 10))
WHERE id = 1
  AND (site_password_hash IS NULL OR length(site_password_hash) = 0);
