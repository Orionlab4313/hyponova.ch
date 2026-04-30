import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  getVisibleBlogPosts,
  effectivePublishDate,
  pickBlogListItem,
} from "@/lib/blog-posts";
import BlogPageView from "@/components/blog/BlogPageView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function readLang(): Promise<"de" | "en"> {
  const c = await cookies();
  const v = c.get("hyponova-lang")?.value;
  return v === "en" ? "en" : "de";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await readLang();
  if (lang === "en") {
    return {
      title: "Insights | HYPONOVA",
      description:
        "Practical knowledge on mortgages, home ownership and financing in Switzerland.",
      openGraph: {
        title: "Insights | HYPONOVA",
        description:
          "Practical knowledge on mortgages, home ownership and financing in Switzerland.",
        url: "https://www.hyponova.ch/blog",
        siteName: "HYPONOVA",
        locale: "en_US",
        type: "website",
      },
    };
  }
  return {
    title: "Ratgeber | HYPONOVA",
    description:
      "Aktuelle Beiträge rund um Hypotheken, Eigenheim und Finanzierung in der Schweiz.",
    openGraph: {
      title: "Ratgeber | HYPONOVA",
      description:
        "Aktuelle Beiträge rund um Hypotheken, Eigenheim und Finanzierung in der Schweiz.",
      url: "https://www.hyponova.ch/blog",
      siteName: "HYPONOVA",
      locale: "de_CH",
      type: "website",
    },
  };
}

export default async function BlogPage() {
  const dbPosts = await getVisibleBlogPosts();
  const lang = await readLang();
  const allPosts = dbPosts
    .map((p) => {
      const picked = pickBlogListItem(p, lang);
      return {
        title: picked.title,
        slug: p.slug,
        date: effectivePublishDate(p),
        readingTime: picked.reading_time,
        image: p.hero_image,
        excerpt: picked.excerpt,
        badge: picked.badge,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <BlogPageView posts={allPosts} />;
}
