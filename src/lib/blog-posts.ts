import { createServiceClient } from "@/lib/supabase";

export type BlogPostStatus = "draft" | "published" | "scheduled";
export type BlogLang = "de" | "en";

export interface BlogPost {
  id: string;
  // Sprachabhaengige Felder (DE + EN)
  title_de: string;
  title_en: string;
  title_highlight_de: string | null;
  title_highlight_en: string | null;
  badge_de: string;
  badge_en: string;
  excerpt_de: string;
  excerpt_en: string;
  content_html_de: string;
  content_html_en: string;
  reading_time_de: string;
  reading_time_en: string;
  meta_description_de: string | null;
  meta_description_en: string | null;
  // Sprachunabhaengig
  slug: string;
  hero_image: string;
  status: BlogPostStatus;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListItem {
  id: string;
  title_de: string;
  title_en: string;
  title_highlight_de: string | null;
  title_highlight_en: string | null;
  badge_de: string;
  badge_en: string;
  excerpt_de: string;
  excerpt_en: string;
  reading_time_de: string;
  reading_time_en: string;
  slug: string;
  hero_image: string;
  status: BlogPostStatus;
  publish_at: string | null;
  created_at: string;
}

const LIST_FIELDS =
  "id,title_de,title_en,title_highlight_de,title_highlight_en,badge_de,badge_en,excerpt_de,excerpt_en,reading_time_de,reading_time_en,slug,hero_image,status,publish_at,created_at";

/**
 * Liefert die Datums-Zeichenkette (ISO), die ein Post nach aussen hat:
 * published → created_at, scheduled → publish_at
 */
export function effectivePublishDate(post: {
  status: BlogPostStatus;
  publish_at: string | null;
  created_at: string;
}): string {
  if (post.status === "scheduled" && post.publish_at) return post.publish_at;
  return post.created_at;
}

/**
 * Waehlt die Inhalte fuer die aktuelle Sprache mit Fallback auf DE,
 * falls die EN-Version leer ist. So bricht der Blog nicht, solange Simon
 * die englischen Versionen noch nicht ergaenzt hat.
 */
export function pickBlogContent(post: BlogPost, lang: BlogLang) {
  const useEn = lang === "en" && post.content_html_en.trim().length > 0;
  return {
    title: useEn ? post.title_en : post.title_de,
    title_highlight: (useEn ? post.title_highlight_en : post.title_highlight_de) || "",
    badge: useEn ? post.badge_en : post.badge_de,
    excerpt: useEn ? post.excerpt_en : post.excerpt_de,
    content_html: useEn ? post.content_html_en : post.content_html_de,
    reading_time: useEn ? post.reading_time_en : post.reading_time_de,
    meta_description:
      (useEn ? post.meta_description_en : post.meta_description_de) || "",
    is_fallback: lang === "en" && !useEn,
  };
}

export function pickBlogListItem(post: BlogPostListItem, lang: BlogLang) {
  const useEn = lang === "en" && post.title_en.trim().length > 0;
  return {
    title: useEn ? post.title_en : post.title_de,
    title_highlight: (useEn ? post.title_highlight_en : post.title_highlight_de) || "",
    badge: useEn ? post.badge_en : post.badge_de,
    excerpt: useEn ? post.excerpt_en : post.excerpt_de,
    reading_time: useEn ? post.reading_time_en : post.reading_time_de,
  };
}

/**
 * Fetcht alle oeffentlich sichtbaren Blog-Posts (published oder scheduled mit
 * Datum in der Vergangenheit). Sortiert nach Publish-Datum absteigend.
 *
 * Bewusst tolerant: bei Fehlern kommt ein leeres Array zurueck.
 */
export async function getVisibleBlogPosts(): Promise<BlogPostListItem[]> {
  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(LIST_FIELDS)
      .or(`status.eq.published,and(status.eq.scheduled,publish_at.lte.${now})`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getVisibleBlogPosts error:", error.message);
      return [];
    }
    return (data || []) as BlogPostListItem[];
  } catch (err) {
    console.error("getVisibleBlogPosts threw:", err);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .or(`status.eq.published,and(status.eq.scheduled,publish_at.lte.${now})`)
      .maybeSingle();

    if (error) {
      console.error("getBlogPostBySlug error:", error.message);
      return null;
    }
    return (data as BlogPost) || null;
  } catch (err) {
    console.error("getBlogPostBySlug threw:", err);
    return null;
  }
}

export async function getBlogPostBySlugAny(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("getBlogPostBySlugAny error:", error.message);
      return null;
    }
    return (data as BlogPost) || null;
  } catch (err) {
    console.error("getBlogPostBySlugAny threw:", err);
    return null;
  }
}
