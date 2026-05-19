-- Prefill-Tokens fuer Daten-Handoff Neukauf -> Termin
-- Plus Email-Lowercase Normalisierung fuer Lead-Deduplication

-- 1. Prefill-Tokens Table
CREATE TABLE IF NOT EXISTS prefill_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  source TEXT, -- 'neukauf' oder 'abloesung' oder 'kontakt' etc.
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prefill_tokens_token ON prefill_tokens(token) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prefill_tokens_expires ON prefill_tokens(expires_at);

ALTER TABLE prefill_tokens ENABLE ROW LEVEL SECURITY;

-- Service-Role bypasst RLS, kein anon/authenticated Policy noetig

-- 2. Email lowercase normalisieren
UPDATE leads SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));

-- 3. Index fuer case-insensitive Lookup
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads(LOWER(email));

-- NOTE: UNIQUE Constraint auf email folgt nachdem existierende Dubletten gemergt sind
