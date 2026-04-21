import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getVisibleBlogPosts, effectivePublishDate } from "@/lib/blog-posts";

// Dynamisch rendern, damit neue/umbenannte DB-Posts sofort im Grid
// auftauchen. revalidatePath aus den Admin-Routen sorgt zusaetzlich
// fuer sofortige Invalidierung bei Mutationen.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog | HYPONOVA",
  description: "Aktuelle Beiträge rund um Hypotheken, Eigenheim und Finanzierung.",
  openGraph: {
    title: "Blog | HYPONOVA",
    description: "Aktuelle Beiträge rund um Hypotheken, Eigenheim und Finanzierung.",
    url: "https://www.hyponova.ch/blog",
    siteName: "HYPONOVA",
    locale: "de_CH",
    type: "website",
  },
};

const posts: any[] = [];


function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  // DB-Posts laden und mit statischen Alt-Posts mergen
  const dbPosts = await getVisibleBlogPosts();
  const dbPostsAsCards = dbPosts.map((p) => ({
    title: p.title,
    slug: p.slug,
    date: effectivePublishDate(p),
    readingTime: p.reading_time,
    image: p.hero_image,
    excerpt: p.excerpt,
  }));
  const allPosts = [...dbPostsAsCards, ...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <>
      {/* Hero */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <span className="badge mb-4 inline-block">Blog</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-6">
              Wissen & <span className="gradient-text">Insights</span>
            </h1>
            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Praxiswissen zu KI, Automatisierung und Software. Konkret,
              verständlich, direkt anwendbar.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 80}>
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <article className="card h-full flex flex-col overflow-hidden">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div
                        className="flex items-center gap-3 text-xs mb-3"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <time dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                        <span
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: "50%",
                            background: "var(--text-tertiary)",
                            display: "inline-block",
                          }}
                        />
                        <span>{post.readingTime} Lesezeit</span>
                      </div>
                      <h2 className="text-base font-semibold leading-snug mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p
                        className="text-sm leading-relaxed flex-1 line-clamp-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {post.excerpt}
                      </p>
                      <div className="mt-4 pt-4 divider">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          Weiterlesen &rarr;
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
