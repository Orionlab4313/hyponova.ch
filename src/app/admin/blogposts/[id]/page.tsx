"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import BlogPostForm, {
  type BlogPostFormData,
} from "@/components/admin/blogposts/BlogPostForm";

export default function EditBlogpostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<BlogPostFormData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/blogposts/${id}`);
        if (!res.ok) {
          setError("Post nicht gefunden");
          return;
        }
        const post = await res.json();
        setData({
          id: post.id,
          title_de: post.title_de || "",
          title_en: post.title_en || "",
          title_highlight_de: post.title_highlight_de || "",
          title_highlight_en: post.title_highlight_en || "",
          badge_de: post.badge_de || "Blog",
          badge_en: post.badge_en || "Blog",
          slug: post.slug || "",
          excerpt_de: post.excerpt_de || "",
          excerpt_en: post.excerpt_en || "",
          hero_image: post.hero_image || "",
          content_html_de: post.content_html_de || "",
          content_html_en: post.content_html_en || "",
          reading_time_de: post.reading_time_de || "5 min",
          reading_time_en: post.reading_time_en || "5 min",
          status: post.status || "draft",
          publish_at: post.publish_at || null,
          meta_description_de: post.meta_description_de || "",
          meta_description_en: post.meta_description_en || "",
        });
      } catch {
        setError("Fehler beim Laden");
      }
    }
    load();
  }, [id]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/admin/blogposts"
          style={{ fontSize: 13, color: "#666", textDecoration: "none" }}
        >
          &larr; Zurück zur Liste
        </Link>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 20px" }}>
        Blogpost bearbeiten
      </h1>
      {error && (
        <div
          style={{
            padding: 14,
            background: "rgba(239,68,68,0.08)",
            color: "#c00",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}
      {!data && !error && (
        <div style={{ color: "#888", padding: 40, textAlign: "center" }}>
          Laden …
        </div>
      )}
      {data && <BlogPostForm initial={data} />}
    </div>
  );
}
