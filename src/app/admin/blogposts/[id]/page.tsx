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
          title: post.title || "",
          title_highlight: post.title_highlight || "",
          badge: post.badge || "Blog",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          hero_image: post.hero_image || "",
          content_html: post.content_html || "",
          reading_time: post.reading_time || "5 min",
          status: post.status || "draft",
          publish_at: post.publish_at || null,
          meta_description: post.meta_description || "",
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
