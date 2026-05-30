"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";

interface BlogArticleProps {
  badge: string;
  title: string;
  titleHighlight: string;
  date: string;
  readingTime: string;
  heroImage: string;
  children: React.ReactNode;
}

const HYPONOVA_LOGO =
  "https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos/hyponova-logo.png";

const COPY = {
  de: {
    backToBlog: "← Zurück zum Blog",
    readingSuffix: "Lesezeit",
    ctaTitle: "Bereit für den nächsten Schritt?",
    ctaDesc:
      "In einem kostenlosen Erstgespräch analysieren wir Ihre Hypotheken-Situation und vergleichen Angebote zahlreicher Banken, Versicherungen und Pensionskassen, transparent und unabhängig.",
    ctaButton: "Beratung buchen →",
  },
  en: {
    backToBlog: "← Back to blog",
    readingSuffix: "read",
    ctaTitle: "Ready for the next step?",
    ctaDesc:
      "In a free initial consultation, we analyse your mortgage situation and compare offers from numerous banks, insurance companies and pension funds, transparently and independently.",
    ctaButton: "Book consultation →",
  },
} as const;

function formatDate(dateStr: string, _lang: "de" | "en") {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BlogArticle({
  badge,
  title,
  titleHighlight,
  date,
  readingTime,
  heroImage,
  children,
}: BlogArticleProps) {
  const { lang } = useI18n();
  const c = COPY[lang];

  const fullTitle = `${title} ${titleHighlight}`.trim();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fullTitle,
    image: heroImage?.startsWith("http") ? heroImage : `https://www.hyponova.ch${heroImage}`,
    datePublished: new Date(date).toISOString(),
    dateModified: new Date(date).toISOString(),
    author: {
      "@type": "Organization",
      name: "HYPONOVA GmbH",
      url: "https://www.hyponova.ch",
    },
    publisher: {
      "@type": "Organization",
      name: "HYPONOVA",
      logo: {
        "@type": "ImageObject",
        url: HYPONOVA_LOGO,
      },
    },
    articleSection: badge,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm mb-6 transition-colors text-white/70 hover:text-white"
            >
              {c.backToBlog}
            </Link>
            <span
              style={{
                display: "inline-block",
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#f4a896",
                border: "1px solid rgba(200, 85, 61, 0.5)",
                borderRadius: 20,
                marginBottom: 20,
                background: "rgba(200, 85, 61, 0.08)",
              }}
            >
              {badge}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-4 text-white">
              {title}
              {titleHighlight ? (
                <>
                  {" "}
                  <span style={{ color: "#c8553d" }}>{titleHighlight}</span>
                </>
              ) : null}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm text-white/70">
              <time dateTime={date}>{formatDate(date, lang)}</time>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.5)",
                  display: "inline-block",
                }}
              />
              <span>
                {readingTime} {c.readingSuffix}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="blog-prose">{children}</div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div
              style={{
                background: "#0a0a0a",
                color: "#fff",
                borderRadius: 16,
                padding: "48px 40px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  margin: "0 0 12px",
                  lineHeight: 1.2,
                }}
              >
                {c.ctaTitle}
              </h2>
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.75)",
                  maxWidth: 540,
                  margin: "0 auto 28px",
                }}
              >
                {c.ctaDesc}
              </p>
              <Link
                href="/termin"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "#fff",
                  color: "#0a0a0a",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  transition: "opacity 0.15s",
                }}
              >
                {c.ctaButton}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
