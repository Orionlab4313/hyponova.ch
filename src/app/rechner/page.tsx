"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { useI18n } from "@/i18n/context";

export default function RechnerPage() {
  const { t, lang } = useI18n();

  const placeholder = {
    de: "Hypothekenrechner wird hier implementiert",
    en: "Mortgage calculator will be implemented here",
  };

  const placeholderSub = {
    de: "(Belehnung + Tragbarkeit mit Donut-Charts)",
    en: "(Loan-to-value + affordability with donut charts)",
  };

  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.calculator.title}</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
              {t.calculator.subtitle}
            </p>
          </div>

          {/* TODO: Calculator component */}
          <div className="max-w-4xl mx-auto p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center text-[var(--color-text-muted)]">
            <p>{placeholder[lang]}</p>
            <p className="text-sm mt-2">{placeholderSub[lang]}</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
