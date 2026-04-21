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
          title: "",
          title_highlight: "",
          badge: "Blog",
          slug: "",
          excerpt: "",
          hero_image: "",
          content_html: "",
          reading_time: "5 min",
          status: "draft",
          publish_at: null,
          meta_description: "",
        }}
      />
    </div>
  );
}
