"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogContent from "@/components/blog/BlogContent";
import { useI18n } from "@/i18n/context";
import { pickLegalContent, type LegalPage } from "@/lib/legal-pages";

interface Props {
  page: LegalPage;
}

const STAND_LABEL = { de: "Stand", en: "Last updated" } as const;
const RECHTLICHES_LABEL = { de: "Rechtliches", en: "Legal" } as const;

function formatDate(iso: string, _lang: "de" | "en"): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function LegalPageView({ page }: Props) {
  const { lang } = useI18n();
  const picked = pickLegalContent(page, lang);

  return (
    <>
      <Header />
      <main className="py-12 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10">
          <p
            className="text-sm uppercase tracking-[0.15em] font-medium mb-4"
            style={{ color: "#6b6b6b" }}
          >
            {RECHTLICHES_LABEL[lang]}
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-12"
            style={{ fontWeight: 300, color: "#1a1a1a" }}
          >
            {picked.title && <>{picked.title} </>}
            <span style={{ fontWeight: 600 }}>{picked.title_highlight}</span>
          </h1>

          <div className="blog-prose" style={{ color: "#444" }}>
            <BlogContent html={picked.content_html} />
          </div>

          <div
            className="pt-6 mt-10 text-sm"
            style={{ borderTop: "1px solid #e5e5e5", color: "#999" }}
          >
            {STAND_LABEL[lang]}: {formatDate(page.updated_at, lang)}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
