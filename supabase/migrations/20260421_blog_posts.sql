-- Migration: Blog Posts Management
-- Datum: 2026-04-11
-- Beschreibung: Erstellt blog_posts Tabelle für den Admin-Blogpost-Editor
--              und Storage-Bucket für Blog-Assets inkl. Policies.

-- ============================================================
-- 1. blog_posts Tabelle
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  title_highlight text,
  badge text NOT NULL DEFAULT 'Blog',
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  content_html text NOT NULL DEFAULT '',
  reading_time text NOT NULL DEFAULT '5 min',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  publish_at timestamptz,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_status_publish_at_idx
  ON blog_posts (status, publish_at);

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx
  ON blog_posts (slug);

-- Trigger: updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION set_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_posts_updated_at();

-- ============================================================
-- 2. Storage Bucket für Blog-Assets (öffentlich lesbar)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access (anonyme Besucher können Bilder anzeigen)
DROP POLICY IF EXISTS "blog_assets_public_read" ON storage.objects;
CREATE POLICY "blog_assets_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-assets');

-- Service-Role darf alles (wird von unseren Admin-API-Routes verwendet,
-- daher streng genommen nicht nötig, aber hilft falls jemand direkt
-- mit dem Anon-Key uploaden will, wir blocken das bewusst).
DROP POLICY IF EXISTS "blog_assets_service_role_all" ON storage.objects;
CREATE POLICY "blog_assets_service_role_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'blog-assets')
  WITH CHECK (bucket_id = 'blog-assets');

-- ============================================================
-- 3. PostgREST Schema-Cache neu laden, damit die API die Tabelle sofort kennt
-- ============================================================

NOTIFY pgrst, 'reload schema';
