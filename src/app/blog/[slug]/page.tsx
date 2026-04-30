import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import BlogContent from "@/components/blog/BlogContent";
import { getBlogPostBySlug, pickBlogContent } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function readLang(): Promise<"de" | "en"> {
  const c = await cookies();
  const v = c.get("hyponova-lang")?.value;
  return v === "en" ? "en" : "de";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Blogbeitrag nicht gefunden | HYPONOVA" };
  }
  const lang = await readLang();
  const picked = pickBlogContent(post, lang);
  const title = `${picked.title}${picked.title_highlight ? " " + picked.title_highlight : ""} | HYPONOVA`;
  const description = picked.meta_description || picked.excerpt;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.hyponova.ch/blog/${post.slug}`,
      siteName: "HYPONOVA",
      locale: lang === "en" ? "en_US" : "de_CH",
      type: "article",
      images: post.hero_image ? [{ url: post.hero_image }] : undefined,
    },
  };
}

export default async function DynamicBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const lang = await readLang();
  const picked = pickBlogContent(post, lang);

  const date =
    post.status === "scheduled" && post.publish_at
      ? post.publish_at
      : post.created_at;

  return (
    <BlogArticle
      badge={picked.badge}
      title={picked.title}
      titleHighlight={picked.title_highlight}
      date={date}
      readingTime={picked.reading_time}
      heroImage={post.hero_image}
    >
      <BlogContent html={picked.content_html} />
    </BlogArticle>
  );
}
