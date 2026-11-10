-- Werbung: Google Tag (Google Ads / gtag.js), gepflegt via /admin/werbung.
-- Die Tag-ID ist nicht geheim (steht im Seitenquelltext), deshalb reichen
-- zwei Spalten in admin_settings. Idempotent.

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS google_tag_id text,
  ADD COLUMN IF NOT EXISTS google_tag_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ads_updated_at timestamptz;

ALTER TABLE public.admin_settings
  DROP CONSTRAINT IF EXISTS admin_settings_google_tag_id_format;
ALTER TABLE public.admin_settings
  ADD CONSTRAINT admin_settings_google_tag_id_format
  CHECK (google_tag_id IS NULL OR google_tag_id ~ '^(AW|G|GT)-[A-Z0-9]{4,20}$');

COMMENT ON COLUMN public.admin_settings.google_tag_id IS 'Google-Tag-ID (z.B. AW-123456789). Wird auf allen oeffentlichen Seiten geladen, wenn google_tag_enabled = true.';
COMMENT ON COLUMN public.admin_settings.google_tag_enabled IS 'Schaltet den Google Tag auf der Website ein oder aus. Aktiv = Cookie-Banner fragt nach Einwilligung.';
