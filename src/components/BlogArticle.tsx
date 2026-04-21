import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface BlogArticleProps {
  badge: string;
  title: string;
  titleHighlight: string;
  date: string;
  readingTime: string;
  heroImage: string;
  children: React.ReactNode;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
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
  const fullTitle = `${title} ${titleHighlight}`.trim();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fullTitle,
    image: heroImage?.startsWith("http") ? heroImage : `https://www.orionlab.ch${heroImage}`,
    datePublished: new Date(date).toISOString(),
    dateModified: new Date(date).toISOString(),
    author: {
      "@type": "Organization",
      name: "OrionLab",
      url: "https://www.orionlab.ch",
    },
    publisher: {
      "@type": "Organization",
      name: "OrionLab",
      logo: {
        "@type": "ImageObject",
        url: "https://www.orionlab.ch/logo.svg",
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
            filter: "brightness(0.3)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm mb-6 transition-colors text-white/70 hover:text-white"
            >
              &larr; Zurück zum Blog
            </Link>
            <span className="badge mb-4 block mx-auto w-fit" style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.4)", border: "1px solid rgba(167,139,250,0.4)" }}>{badge}</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-4 text-white">
              {title}{" "}
              <span className="gradient-text">{titleHighlight}</span>
            </h1>
            <div
              className="flex items-center justify-center gap-3 text-sm text-white/70"
            >
              <time dateTime={date}>{formatDate(date)}</time>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.5)",
                  display: "inline-block",
                }}
              />
              <span>{readingTime} Lesezeit</span>
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
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div
              className="rounded-2xl p-10 md:p-14"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124, 92, 252, 0.12) 0%, rgba(124, 92, 252, 0.04) 100%)",
                border: "1px solid rgba(124, 92, 252, 0.2)",
              }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Bereit für den nächsten Schritt?
              </h2>
              <p
                className="text-lg leading-relaxed mb-8 max-w-xl mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Lassen Sie uns in einem kostenlosen Erstgespräch herausfinden,
                wie KI Ihre Prozesse konkret verbessern kann. Unverbindlich,
                praxisnah und auf Ihr Unternehmen zugeschnitten.
              </p>
              <Link href="/termin" className="btn-primary">
                Kostenloses Erstgespräch buchen
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
