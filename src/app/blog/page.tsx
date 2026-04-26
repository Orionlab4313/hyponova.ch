import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getVisibleBlogPosts, effectivePublishDate } from "@/lib/blog-posts";

// Dynamisch rendern, damit neue/umbenannte DB-Posts sofort im Grid
// auftauchen. revalidatePath aus den Admin-Routen sorgt zusätzlich
// für sofortige Invalidierung bei Mutationen.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const dbPosts = await getVisibleBlogPosts();
  const allPosts = dbPosts
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      date: effectivePublishDate(p),
      readingTime: p.reading_time,
      image: p.hero_image,
      excerpt: p.excerpt,
      badge: p.badge,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      {/* Hero */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <span
              style={{
                display: "inline-block",
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#c8553d",
                border: "1px solid rgba(200, 85, 61, 0.4)",
                borderRadius: 20,
                marginBottom: 20,
                background: "rgba(200, 85, 61, 0.05)",
              }}
            >
              Ratgeber
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-6"
              style={{ color: "#1a1a1a" }}
            >
              Wissen rund um <span style={{ color: "#c8553d" }}>Hypotheken</span>
            </h1>
            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "#555" }}
            >
              Praxiswissen zu Hypotheken, Eigenheim und Finanzierung in der
              Schweiz — verständlich erklärt und direkt anwendbar.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {allPosts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
              Noch keine Beiträge veröffentlicht.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 80}>
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <article
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "border-color 0.2s, transform 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#c8553d";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e5e5";
                      }}
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div
                        style={{
                          padding: 24,
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        {post.badge && (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "#c8553d",
                              marginBottom: 10,
                            }}
                          >
                            {post.badge}
                          </span>
                        )}
                        <h2
                          style={{
                            fontSize: 17,
                            fontWeight: 600,
                            lineHeight: 1.35,
                            margin: "0 0 8px",
                            color: "#1a1a1a",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.title}
                        </h2>
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "#555",
                            flex: 1,
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.excerpt}
                        </p>
                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid #f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "#888",
                          }}
                        >
                          <span>
                            {formatDate(post.date)} · {post.readingTime}
                          </span>
                          <span style={{ color: "#1a1a1a", fontWeight: 500 }}>
                            Weiterlesen →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
