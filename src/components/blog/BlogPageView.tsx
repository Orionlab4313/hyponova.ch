"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BlogCard from "@/components/blog/BlogCard";
import { useI18n } from "@/i18n/context";

interface Post {
  title: string;
  slug: string;
  date: string;
  readingTime: string;
  image: string;
  excerpt: string;
  badge: string;
}

interface Props {
  posts: Post[];
}

const COPY = {
  de: {
    badge: "Ratgeber",
    headline_pre: "Wissen rund um",
    headline_highlight: "Hypotheken",
    intro:
      "Praxiswissen zu Hypotheken, Eigenheim und Finanzierung in der Schweiz — verständlich erklärt und direkt anwendbar.",
    empty: "Noch keine Beiträge veröffentlicht.",
    backToHome: "← Zurück zur Startseite",
  },
  en: {
    badge: "Insights",
    headline_pre: "Knowledge about",
    headline_highlight: "mortgages",
    intro:
      "Practical knowledge on mortgages, home ownership and financing in Switzerland — clearly explained and directly applicable.",
    empty: "No posts published yet.",
    backToHome: "← Back to home",
  },
} as const;

export default function BlogPageView({ posts }: Props) {
  const { lang } = useI18n();
  const c = COPY[lang];

  return (
    <>
      <section className="pt-12 md:pt-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#666",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            className="hover:text-[#c8553d]"
          >
            {c.backToHome}
          </Link>
        </div>
      </section>

      <section className="pt-12 md:pt-16 pb-24 md:pb-32 px-6">
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
              {c.badge}
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-6"
              style={{ color: "#1a1a1a" }}
            >
              {c.headline_pre}{" "}
              <span style={{ color: "#c8553d" }}>{c.headline_highlight}</span>
            </h1>
            <p
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "#555" }}
            >
              {c.intro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
              {c.empty}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 80}>
                  <BlogCard
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.image}
                    badge={post.badge}
                    date={post.date}
                    readingTime={post.readingTime}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
