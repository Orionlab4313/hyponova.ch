"use client";

import { useState } from "react";

const MIGRATION_SQL = `-- Blog Posts Management Setup (zweisprachig DE + EN)
-- Einmalig im Supabase SQL-Editor ausführen

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title_de text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  title_highlight_de text,
  title_highlight_en text,
  badge_de text NOT NULL DEFAULT 'Blog',
  badge_en text NOT NULL DEFAULT 'Blog',
  slug text NOT NULL UNIQUE,
  excerpt_de text NOT NULL DEFAULT '',
  excerpt_en text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  content_html_de text NOT NULL DEFAULT '',
  content_html_en text NOT NULL DEFAULT '',
  reading_time_de text NOT NULL DEFAULT '5 min',
  reading_time_en text NOT NULL DEFAULT '5 min',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  publish_at timestamptz,
  meta_description_de text,
  meta_description_en text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_status_publish_at_idx ON blog_posts (status, publish_at);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);

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

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "blog_assets_public_read" ON storage.objects;
CREATE POLICY "blog_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-assets');

DROP POLICY IF EXISTS "blog_assets_service_role_all" ON storage.objects;
CREATE POLICY "blog_assets_service_role_all"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'blog-assets')
  WITH CHECK (bucket_id = 'blog-assets');

NOTIFY pgrst, 'reload schema';`;

export default function SetupNotice() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(MIGRATION_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: Textarea markieren
      const ta = document.getElementById("setup-sql") as HTMLTextAreaElement | null;
      if (ta) {
        ta.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
        Einmaliges Setup nötig
      </h1>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
        Die Tabelle <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 3 }}>blog_posts</code> und
        der Storage-Bucket <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 3 }}>blog-assets</code>{" "}
        existieren noch nicht in deiner Supabase-Datenbank. Einmal das folgende SQL im{" "}
        Supabase SQL-Editor ausführen, dann ist alles bereit.
      </p>

      <ol
        style={{
          fontSize: 14,
          color: "#333",
          lineHeight: 1.8,
          paddingLeft: 20,
          marginBottom: 20,
        }}
      >
        <li>
          Supabase Dashboard öffnen, links im Menü{" "}
          <strong>SQL Editor</strong> wählen
        </li>
        <li>
          <strong>New query</strong> klicken
        </li>
        <li>
          SQL unten kopieren (Button <strong>SQL kopieren</strong>)
        </li>
        <li>
          Ins SQL-Editor-Feld einfügen und <strong>Run</strong> klicken
        </li>
        <li>Diese Seite neu laden</li>
      </ol>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: "1px solid #e5e5e5",
            background: "#fafafa",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
            Migration SQL
          </span>
          <button
            type="button"
            onClick={copy}
            style={{
              padding: "6px 14px",
              background: copied ? "#0a7a2e" : "#c8553d",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {copied ? "Kopiert" : "SQL kopieren"}
          </button>
        </div>
        <textarea
          id="setup-sql"
          readOnly
          value={MIGRATION_SQL}
          style={{
            width: "100%",
            minHeight: 320,
            border: "none",
            outline: "none",
            padding: 14,
            fontFamily: "'SF Mono', Menlo, Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.5,
            color: "#222",
            background: "#fff",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "rgba(200,85,61,0.06)",
          border: "1px solid rgba(200,85,61,0.2)",
          borderRadius: 4,
          fontSize: 13,
          color: "#555",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#333" }}>Warum muss ich das manuell machen?</strong>
        <br />
        Supabase-Migrationen laufen nicht automatisch bei einem Vercel-Deploy.
        Das SQL oben ist idempotent (kann beliebig oft ausgeführt werden) und
        liegt auch als Datei unter{" "}
        <code>supabase/migrations/20260411_blog_posts.sql</code> im Repo.
      </div>
    </div>
  );
}
