import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import BlogContent from "@/components/blog/BlogContent";
import { getBlogPostBySlug } from "@/lib/blog-posts";

// Dynamisch rendern: neu erstellte oder umbenannte DB-Posts sollen ohne
// Rebuild sichtbar werden. revalidatePath aus den Admin-Routen invalidiert
// zusaetzlich den Cache sofort nach einer Mutation.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Blogbeitrag nicht gefunden | HYPONOVA" };
  }
  const title = `${post.title}${post.title_highlight ? " " + post.title_highlight : ""} | HYPONOVA`;
  const description = post.meta_description || post.excerpt;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.hyponova.ch/blog/${post.slug}`,
      siteName: "HYPONOVA",
      locale: "de_CH",
      type: "article",
      images: post.hero_image ? [{ url: post.hero_image }] : undefined,
    },
  };
}

export default async function DynamicBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const date =
    post.status === "scheduled" && post.publish_at
      ? post.publish_at
      : post.created_at;

  return (
    <BlogArticle
      badge={post.badge}
      title={post.title}
      titleHighlight={post.title_highlight || ""}
      date={date}
      readingTime={post.reading_time}
      heroImage={post.hero_image}
    >
      <BlogContent html={post.content_html} />
    </BlogArticle>
  );
}
