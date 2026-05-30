"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ScrollReveal, { SlideUp } from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";

const ACCENT = "#c8553d";

export default function EigenheimKaufenPage() {
  const { lang } = useI18n();

  const c = {
    de: {
      eyebrow: "Dienstleistungen",
      back: "← Alle Dienstleistungen",
      kategorie: "Kauffinanzierung",
      title: "Eigenheim kaufen",
      intro: "Wir begleiten Sie vollumfänglich bei Ihrem Liegenschaftskauf, von der ersten Tragbarkeitsprüfung bis zur Unterzeichnung des Hypothekarvertrags. Ohne Druck. Ohne versteckte Kosten.",
      forwhomTitle: "Für wen",
      forwhom: [
        "Sie kaufen erstmals ein Eigenheim und brauchen einen Überblick.",
        "Sie haben bereits eine Liegenschaft im Auge und benötigen eine Finanzierungslösung.",
        "Sie planen einen Neubau oder kaufen ab Plan.",
      ],
      processTitle: "So läuft es ab",
      process: [
        { num: "1", t: "Fragebogen ausfüllen", d: "In wenigen Minuten erfassen wir Ihre Situation und Wünsche." },
        { num: "2", t: "Beratungstermin", d: "Persönliches Online-Gespräch mit Ihrem Hypothekenberater, kostenlos und unverbindlich." },
        { num: "3", t: "Marktvergleich", d: "Wir holen Angebote von Banken, Versicherungen und Pensionskassen ein." },
        { num: "4", t: "Ihre Entscheidung", d: "Wir präsentieren die besten Optionen. Sie wählen ohne Druck." },
      ],
      includesTitle: "Was im Service enthalten ist",
      includes: [
        "Tragbarkeits- und Belehnungsprüfung",
        "Vergleich mit zahlreichen Schweizer Anbietern",
        "Persönliche Beratung in Deutsch oder Englisch",
        "Unterstützung bei der Dokumenten-Zusammenstellung",
        "Begleitung bis zur Vertragsunterzeichnung",
      ],
      costsTitle: "Was es kostet",
      costsBody: "Für Sie kostenlos. Wir werden bei einem erfolgreichen Abschluss direkt vom jeweiligen Kreditgeber entschädigt, ohne Auswirkung auf Ihre Konditionen.",
      ctaTitle: "Bereit für den Start?",
      ctaBody: "Starten Sie jetzt unseren Fragebogen. In wenigen Minuten haben wir die Basis für Ihr persönliches Beratungsgespräch.",
      ctaBtn: "Fragebogen starten →",
      ctaSecondary: "Lieber direkt einen Termin buchen",
    },
    en: {
      eyebrow: "Services",
      back: "← All services",
      kategorie: "Purchase financing",
      title: "Buy a property",
      intro: "We support you throughout your property purchase, from the first affordability check to signing the mortgage contract. No pressure. No hidden costs.",
      forwhomTitle: "Who it's for",
      forwhom: [
        "You're buying a property for the first time and need an overview.",
        "You've already found a property and need a financing solution.",
        "You're planning a new build or buying off-plan.",
      ],
      processTitle: "How it works",
      process: [
        { num: "1", t: "Fill out the questionnaire", d: "In a few minutes, we'll capture your situation and wishes." },
        { num: "2", t: "Consultation", d: "Personal online meeting with your advisor, free and without obligation." },
        { num: "3", t: "Market comparison", d: "We obtain offers from banks, insurance companies and pension funds." },
        { num: "4", t: "Your decision", d: "We present the best options. You choose without pressure." },
      ],
      includesTitle: "What's included",
      includes: [
        "Affordability and loan-to-value check",
        "Comparison with numerous Swiss providers",
        "Personal consultation in German or English",
        "Support compiling documents",
        "Support until contract signing",
      ],
      costsTitle: "What it costs",
      costsBody: "Free for you. On successful completion, we're compensated directly by the lender, with no impact on your conditions.",
      ctaTitle: "Ready to start?",
      ctaBody: "Start our questionnaire now. In a few minutes we'll have the basis for your personal consultation.",
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
                src="/images/eigenheim-kaufen.png"
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

        {/* Includes + Kosten side-by-side */}
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
                <Link href="/neukauf" className="inline-flex items-center justify-center px-7 py-4 text-sm font-medium" style={{ background: "#fff", color: "#000", textDecoration: "none" }}>
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
