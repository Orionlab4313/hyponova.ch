-- Migration: Fragebogen-Antworten + tokenized Customer-Upload-System
-- Datum: 2026-05-01
-- Bereits via MCP angewandt, Datei dient nur der Repo-History.

-- 1. Submissions
CREATE TABLE IF NOT EXISTS questionnaire_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('abloesung','neukauf')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','done','rejected')),
  lang text NOT NULL DEFAULT 'de' CHECK (lang IN ('de','en')),
  end_path text CHECK (end_path IN ('offerten','termin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questionnaire_submissions_lead_idx ON questionnaire_submissions(lead_id);
CREATE INDEX IF NOT EXISTS questionnaire_submissions_type_status_idx ON questionnaire_submissions(type, status);
CREATE INDEX IF NOT EXISTS questionnaire_submissions_created_idx ON questionnaire_submissions(created_at DESC);

CREATE OR REPLACE FUNCTION set_questionnaire_submissions_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaire_submissions_updated_at ON questionnaire_submissions;
CREATE TRIGGER questionnaire_submissions_updated_at
  BEFORE UPDATE ON questionnaire_submissions
  FOR EACH ROW EXECUTE FUNCTION set_questionnaire_submissions_updated_at();

-- 2. Tokenized Upload-Links
CREATE TABLE IF NOT EXISTS lead_upload_tokens (
  token text PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES questionnaire_submissions(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_upload_tokens_lead_idx ON lead_upload_tokens(lead_id);
CREATE INDEX IF NOT EXISTS lead_upload_tokens_expires_idx ON lead_upload_tokens(expires_at);

-- 3. Documents-Tabelle erweitern
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS submission_id uuid REFERENCES questionnaire_submissions(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','reviewing','accepted','rejected'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_via text DEFAULT 'admin' CHECK (uploaded_via IN ('admin','customer'));

CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);
CREATE INDEX IF NOT EXISTS documents_submission_idx ON documents(submission_id);

-- 4. Storage-Bucket fuer Kundendokumente (PRIVATE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-docs', 'customer-docs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "customer_docs_service_role_all" ON storage.objects;
CREATE POLICY "customer_docs_service_role_all"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'customer-docs')
  WITH CHECK (bucket_id = 'customer-docs');
