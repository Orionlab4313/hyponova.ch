"use client";

import Link from "next/link";
import BlogPostForm from "@/components/admin/blogposts/BlogPostForm";

export default function NewBlogpostPage() {
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
        Neuer Blogpost
      </h1>
      <BlogPostForm
        initial={{
          title_de: "",
          title_en: "",
          title_highlight_de: "",
          title_highlight_en: "",
          badge_de: "Blog",
          badge_en: "Blog",
          slug: "",
          excerpt_de: "",
          excerpt_en: "",
          hero_image: "",
          content_html_de: "",
          content_html_en: "",
          reading_time_de: "5 min",
          reading_time_en: "5 min",
          status: "draft",
          publish_at: null,
          meta_description_de: "",
          meta_description_en: "",
        }}
      />
    </div>
  );
}
