import { createServiceClient } from "@/lib/supabase";

export type BlogPostStatus = "draft" | "published" | "scheduled";

export interface BlogPost {
  id: string;
  title: string;
  title_highlight: string | null;
  badge: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  content_html: string;
  reading_time: string;
  status: BlogPostStatus;
  publish_at: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  title_highlight: string | null;
  badge: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  reading_time: string;
  status: BlogPostStatus;
  publish_at: string | null;
  created_at: string;
}

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
 * Fetcht alle öffentlich sichtbaren Blog-Posts (published oder scheduled mit Datum in der Vergangenheit).
 * Sortiert nach effektivem Publish-Datum absteigend.
 *
 * Bewusst tolerant: Wenn die Tabelle noch nicht existiert oder die
 * Verbindung scheitert, kommt ein leeres Array zurück — damit crasht die
 * öffentliche /blog-Seite nicht, solange die Migration noch nicht läuft.
 */
export async function getVisibleBlogPosts(): Promise<BlogPostListItem[]> {
  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id,title,title_highlight,badge,slug,excerpt,hero_image,reading_time,status,publish_at,created_at"
      )
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

/**
 * Fetcht einen Post per Slug — nur wenn sichtbar.
 */
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

/**
 * Fetcht einen Post per Slug unabhängig vom Status (für Admin-Vorschau).
 */
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
