-- UNIQUE Constraint auf leads.email
-- Sicher anzuwenden nach Cleanup vom 19.05.2026 (nur Pavisan uebrig)
-- Verhindert Lead-Dubletten auf DB-Ebene (zusaetzlich zur App-Logik in
-- /api/public/neukauf, /api/public/abloesung und /api/booking, die alle
-- email lowercase + .ilike() Lookup machen)
ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
