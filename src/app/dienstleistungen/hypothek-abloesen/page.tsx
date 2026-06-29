"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ScrollReveal, { SlideUp } from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";

const ACCENT = "#c8553d";

export default function HypothekAbloesenPage() {
  const { lang } = useI18n();

  const c = {
    de: {
      eyebrow: "Dienstleistungen",
      back: "← Alle Dienstleistungen",
      kategorie: "Hypothekenablösung",
      title: "Hypothek ablösen",
      intro: "Lassen Sie uns Ihre bestehende Hypothek prüfen. Wir holen die besten Angebote von zahlreichen Schweizer Anbietern ein und zeigen Ihnen Ihr konkretes Einsparpotenzial, kostenlos und unverbindlich.",
      forwhomTitle: "Für wen",
      forwhom: [
        "Ihre Hypothek läuft in den nächsten zwei Jahren aus.",
        "Sie sind unsicher, ob Sie aktuell die besten Konditionen haben.",
        "Sie haben eine Variable Hypothek und denken über eine Festzins- oder SARON-Lösung nach.",
      ],
      processTitle: "So läuft es ab",
      process: [
        { num: "1", t: "Fragebogen ausfüllen", d: "Sie tragen Ihre aktuellen Tranchen ein. Wir prüfen automatisch, ob eine Ablösung möglich ist." },
        { num: "2", t: "Unterlagen hochladen", d: "Über einen sicheren, personalisierten Link senden Sie uns die nötigen Dokumente." },
        { num: "3", t: "Marktvergleich", d: "Wir holen Angebote ein und vergleichen sie für Sie transparent." },
        { num: "4", t: "Vorsorgliche Kündigung", d: "Sobald die besten Konditionen feststehen, kündigen Sie Ihre aktuelle Hypothek mit unserer Vorlage." },
        { num: "5", t: "Ihre Entscheidung", d: "Sie wählen die für Sie passende Variante, ohne Druck." },
      ],
      includesTitle: "Was im Service enthalten ist",
      includes: [
        "Automatische Prüfung der Ablösbarkeit",
        "Vergleich mit zahlreichen Schweizer Anbietern",
        "Sicheres Dokumenten-Upload-Portal",
        "Kündigungsvorlage als PDF (per Einschreiben)",
        "Persönliche Beratung in Deutsch oder Englisch",
      ],
      costsTitle: "Was es kostet",
      costsBody: "Für Sie kostenlos. Wir werden bei einem erfolgreichen Abschluss direkt vom neuen Kreditgeber entschädigt, ohne Auswirkung auf Ihre Konditionen.",
      ctaTitle: "Bereit für den Vergleich?",
      ctaBody: "Starten Sie jetzt unseren Fragebogen. In wenigen Minuten wissen Sie, ob eine Ablösung für Sie möglich ist.",
      ctaBtn: "Fragebogen starten →",
      ctaSecondary: "Lieber direkt einen Termin buchen",
    },
    en: {
      eyebrow: "Services",
      back: "← All services",
      kategorie: "Mortgage refinancing",
      title: "Refinance mortgage",
      intro: "Let us review your existing mortgage. We obtain the best offers from numerous Swiss providers and show you your concrete savings potential, free and without obligation.",
      forwhomTitle: "Who it's for",
      forwhom: [
        "Your mortgage expires within the next two years.",
        "You're not sure whether your current conditions are still the best.",
        "You have a variable mortgage and consider switching to fixed-rate or SARON.",
      ],
      processTitle: "How it works",
      process: [
        { num: "1", t: "Fill out the questionnaire", d: "Enter your current tranches. We automatically check whether refinancing is possible." },
        { num: "2", t: "Upload documents", d: "Use the secure personalised link to send us the required documents." },
        { num: "3", t: "Market comparison", d: "We obtain offers and compare them for you transparently." },
        { num: "4", t: "Precautionary cancellation", d: "Once the best conditions are clear, cancel your current mortgage using our template." },
        { num: "5", t: "Your decision", d: "Choose the option that suits you best, no pressure." },
      ],
      includesTitle: "What's included",
      includes: [
        "Automatic refinancing eligibility check",
        "Comparison with numerous Swiss providers",
        "Secure document upload portal",
        "Cancellation template as PDF (registered mail)",
        "Personal consultation in German or English",
      ],
      costsTitle: "What it costs",
      costsBody: "Free for you. On successful completion, we're compensated directly by the new lender, with no impact on your conditions.",
      ctaTitle: "Ready to compare?",
      ctaBody: "Start our questionnaire now. In a few minutes you'll know whether refinancing is possible for you.",
      ctaBtn: "Start questionnaire →",
      ctaSecondary: "Or book an appointment directly",
    },
  } as const;
  const t = c[lang];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 lg:py-28">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
            <Link href="/dienstleistungen" className="text-sm mb-6 inline-block" style={{ color: "#6b6b6b", textDecoration: "none" }}>
              {t.back}
            </Link>
            <ScrollReveal>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999" }}>{t.kategorie}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-8" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                <span style={{ fontWeight: 600 }}>{t.title}</span>
              </h1>
              <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "#555" }}>{t.intro}</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Hero-Image */}
        <section className="px-6 lg:px-10 mb-24 lg:mb-32">
          <div className="max-w-[1400px] mx-auto">
            <div className="aspect-[16/7] overflow-hidden relative">
              <Image
                src="/images/hypothek-abloesen-beratung.webp"
                alt={t.title}
                fill
                sizes="(max-width: 1400px) 100vw, 1400px"
                fetchPriority="high"
                loading="eager"
                className="object-cover"
                style={{ borderRadius: 0 }}
              />
            </div>
          </div>
        </section>

        {/* Für wen */}
        <Section title={t.forwhomTitle}>
          <ul className="space-y-4">
            {t.forwhom.map((line, i) => (
              <SlideUp key={i} delay={i * 0.05}>
                <li className="flex items-start gap-4 text-lg" style={{ color: "#444", lineHeight: 1.6 }}>
                  <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0 }}>,</span>
                  <span>{line}</span>
                </li>
              </SlideUp>
            ))}
          </ul>
        </Section>

        {/* Prozess */}
        <Section title={t.processTitle}>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {t.process.map((p, i) => (
              <SlideUp key={i} delay={i * 0.05}>
                <div>
                  <div className="text-5xl mb-4" style={{ fontWeight: 200, color: ACCENT, lineHeight: 1 }}>{p.num}</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "#1a1a1a" }}>{p.t}</h3>
                  <p style={{ color: "#666", lineHeight: 1.6 }}>{p.d}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </Section>

        {/* Includes + Kosten */}
        <section className="py-16 lg:py-20" style={{ background: "#fafafa" }}>
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12">
            <ScrollReveal>
              <h3 className="text-sm uppercase tracking-[0.15em] font-medium mb-6" style={{ color: "#6b6b6b" }}>{t.includesTitle}</h3>
              <ul className="space-y-3">
                {t.includes.map((line, i) => (
                  <li key={i} className="flex items-start gap-3 text-base" style={{ color: "#333", lineHeight: 1.55 }}>
                    <span style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal>
              <h3 className="text-sm uppercase tracking-[0.15em] font-medium mb-6" style={{ color: "#6b6b6b" }}>{t.costsTitle}</h3>
              <p className="text-base" style={{ color: "#333", lineHeight: 1.7 }}>{t.costsBody}</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 lg:py-32 text-white" style={{ background: "#0f0f0f" }}>
          <div className="max-w-[800px] mx-auto px-6 lg:px-10 text-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6" style={{ fontWeight: 300 }}>{t.ctaTitle}</h2>
              <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{t.ctaBody}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/abloesung" className="inline-flex items-center justify-center px-7 py-4 text-sm font-medium" style={{ background: "#fff", color: "#000", textDecoration: "none" }}>
                  {t.ctaBtn}
                </Link>
                <Link href="/termin" className="inline-flex items-center justify-center px-7 py-4 text-sm font-medium" style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff", textDecoration: "none" }}>
                  {t.ctaSecondary}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <ScrollReveal>
          <h3 className="text-sm uppercase tracking-[0.15em] font-medium mb-10" style={{ color: "#6b6b6b" }}>{title}</h3>
        </ScrollReveal>
        {children}
      </div>
    </section>
  );
}
