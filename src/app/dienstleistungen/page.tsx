"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { useI18n } from "@/i18n/context";

export default function DienstleistungenPage() {
  const { t } = useI18n();

  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.services.title}</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
              {t.services.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Neukauf */}
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-3">{t.services.newPurchase}</h2>
              <p className="text-[var(--color-text-muted)] mb-6">
                {t.services.newPurchaseDesc}
              </p>
              <a href="/neukauf" className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                {t.services.ctaNewPurchase}
              </a>
            </div>

            {/* Ablösung */}
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-3">{t.services.refinance}</h2>
              <p className="text-[var(--color-text-muted)] mb-6">
                {t.services.refinanceDesc}
              </p>
              <a href="/abloesung" className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                {t.services.ctaRefinance}
              </a>
            </div>
          </div>

          {/* Kündigungsvorlage als Tertiär-Service */}
          <div className="max-w-4xl mx-auto mt-8">
            <a href="/kuendigung" className="block p-6 rounded-2xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] transition-colors">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {t.services.cancellationTemplate}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t.services.cancellationTemplateDesc}
                  </p>
                </div>
                <span className="text-[var(--color-primary)] text-sm font-medium whitespace-nowrap">
                  {t.services.cancellationTemplateCta} →
                </span>
              </div>
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
