-- Add English file slots to dokument_vorlagen.
-- The existing file_url/file_name/file_size become the German default.
-- file_url_en is optional; when missing, the German file is used as fallback.

ALTER TABLE dokument_vorlagen
  ADD COLUMN IF NOT EXISTS file_url_en  text,
  ADD COLUMN IF NOT EXISTS file_name_en text,
  ADD COLUMN IF NOT EXISTS file_size_en bigint;

COMMENT ON COLUMN dokument_vorlagen.file_url  IS 'German PDF (default, required).';
COMMENT ON COLUMN dokument_vorlagen.file_url_en IS 'English PDF (optional). Falls back to file_url when null.';
