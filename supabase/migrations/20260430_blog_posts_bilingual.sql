-- Migration: Blog-Posts zweisprachig (DE + EN)
-- Datum: 2026-04-30
-- Beschreibung: Bestehende sprachabhaengige Spalten zu _de umbenennen,
--               _en-Spalten ergaenzen. Slug, hero_image, status, publish_at
--               bleiben sprachunabhaengig.

ALTER TABLE blog_posts RENAME COLUMN title TO title_de;
ALTER TABLE blog_posts ADD COLUMN title_en text NOT NULL DEFAULT '';

ALTER TABLE blog_posts RENAME COLUMN title_highlight TO title_highlight_de;
ALTER TABLE blog_posts ADD COLUMN title_highlight_en text;

ALTER TABLE blog_posts RENAME COLUMN badge TO badge_de;
ALTER TABLE blog_posts ADD COLUMN badge_en text NOT NULL DEFAULT 'Blog';

ALTER TABLE blog_posts RENAME COLUMN excerpt TO excerpt_de;
ALTER TABLE blog_posts ADD COLUMN excerpt_en text NOT NULL DEFAULT '';

ALTER TABLE blog_posts RENAME COLUMN content_html TO content_html_de;
ALTER TABLE blog_posts ADD COLUMN content_html_en text NOT NULL DEFAULT '';

ALTER TABLE blog_posts RENAME COLUMN reading_time TO reading_time_de;
ALTER TABLE blog_posts ADD COLUMN reading_time_en text NOT NULL DEFAULT '5 min';

ALTER TABLE blog_posts RENAME COLUMN meta_description TO meta_description_de;
ALTER TABLE blog_posts ADD COLUMN meta_description_en text;
