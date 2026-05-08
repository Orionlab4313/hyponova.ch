"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Accordion from "@/components/ui/Accordion";
import { useI18n } from "@/i18n/context";

const faqItemsDe = [
  {
    question: "Was ist ein Hypothekenvermittler?",
    answer: "Ein Hypothekenvermittler vergleicht die Angebote verschiedener Banken, Versicherungen und Pensionskassen und findet für Sie die attraktivste Finanzierungslösung. Anders als Ihre Hausbank sind wir unabhängig und nicht an ein einzelnes Institut gebunden.",
  },
  {
    question: "Ist die Beratung bei HYPONOVA wirklich kostenlos?",
    answer: "Ja, die Beratung und der gesamte Abschlussprozess sind für Sie vollständig kostenlos. Wir werden direkt von den Kreditgebern entschädigt. Sollte es zu keinem Abschluss kommen, entstehen Ihnen keinerlei Kosten.",
  },
  {
    question: "Was bedeutet Tragbarkeit?",
    answer: "Die Tragbarkeit beschreibt das Verhältnis zwischen den jährlichen Wohnkosten (Hypothekarzinsen, Amortisation und Nebenkosten) und Ihrem Bruttoeinkommen. In der Schweiz gilt eine Finanzierung als tragbar, wenn die kalkulatorischen Kosten maximal einen Drittel (33 %) des Bruttoeinkommens ausmachen.",
  },
  {
    question: "Was bedeutet Belehnung?",
    answer: "Die Belehnung (Loan-to-Value, LTV) beschreibt das Verhältnis zwischen der Hypothek und dem Verkehrswert der Liegenschaft. In der Schweiz beträgt die maximale Belehnung in der Regel 80 %. Das bedeutet, dass Sie mindestens 20 % Eigenmittel einbringen müssen, davon mindestens 10 % aus harten Eigenmitteln (nicht aus der Pensionskasse).",
  },
  {
    question: "Welche Eigenmittel benötige ich für den Kauf eines Eigenheims?",
    answer: "Für den Kauf eines selbstbewohnten Eigenheims benötigen Sie mindestens 20 % des Kaufpreises als Eigenmittel. Davon müssen mindestens 10 % aus sogenannten harten Eigenmitteln stammen (z. B. Ersparnisse, Schenkungen, Erbvorbezüge). Die restlichen 10 % können aus der 2. Säule (Pensionskasse) bezogen werden.",
  },
  {
    question: "Was ist der Unterschied zwischen Festhypothek und SARON-Hypothek?",
    answer: "Bei einer Festhypothek wird der Zinssatz für eine feste Laufzeit (z. B. 2, 5 oder 10 Jahre) fixiert. Sie haben Planungssicherheit, können aber nicht von sinkenden Zinsen profitieren. Bei einer SARON-Hypothek wird der Zinssatz regelmässig an den aktuellen Geldmarktsatz (SARON) angepasst. Sie profitieren von Zinssenkungen, tragen aber auch das Risiko steigender Zinsen.",
  },
  {
    question: "Wann sollte ich meine bestehende Hypothek ablösen?",
    answer: "Am besten kontaktieren Sie uns 6 bis 12 Monate vor Ablauf Ihrer bestehenden Hypothek. So haben wir genügend Zeit, den Markt zu analysieren und die attraktivsten Angebote einzuholen. Auch ein Forward-Abschluss (Vorab-Fixierung des Zinssatzes) ist möglich.",
  },
  {
    question: "Wie läuft der Prozess bei HYPONOVA ab?",
    answer: "Der Prozess ist einfach: (1) Sie teilen uns Ihre Eckdaten mit oder nutzen unseren Online-Rechner. (2) Wir vereinbaren ein kostenloses Beratungsgespräch und analysieren Ihre Situation. (3) Wir holen Angebote bei unseren Partnern ein und präsentieren Ihnen die besten Optionen. Sie entscheiden, ohne Druck und ohne Kosten.",
  },
  {
    question: "Welche Dokumente benötige ich?",
    answer: "Für eine erste Einschätzung genügen Angaben zu Ihrem Einkommen, Ihren Eigenmitteln und der gewünschten Liegenschaft. Für die formelle Offerte benötigen wir in der Regel: Lohnausweise, Steuererklärung, Kontoauszüge der Eigenmittel, Pensionskassenausweis sowie Unterlagen zur Liegenschaft (Grundbuchauszug, Schätzung, Pläne).",
  },
  {
    question: "Bietet HYPONOVA auch Beratungen ausserhalb des Kantons Aargau an?",
    answer: "Ja, wir beraten Kundinnen und Kunden in der gesamten Schweiz. Unsere Beratungen finden bequem per Videocall statt, sodass Sie unabhängig von Ihrem Standort von unserem Service profitieren können.",
  },
];

const faqItemsEn = [
  {
    question: "What is a mortgage broker?",
    answer: "A mortgage broker compares offers from various banks, insurance companies and pension funds to find the most attractive financing solution for you. Unlike your bank, we are independent and not tied to any single institution.",
  },
  {
    question: "Is the consultation at HYPONOVA really free?",
    answer: "Yes, the consultation and the entire closing process are completely free for you. We are compensated directly by the lenders. If no deal is closed, you incur no costs whatsoever.",
  },
  {
    question: "What does affordability mean?",
    answer: "Affordability describes the ratio between annual housing costs (mortgage interest, amortization and ancillary costs) and your gross income. In Switzerland, financing is considered affordable when the imputed costs amount to a maximum of one third (33%) of gross income.",
  },
  {
    question: "What does loan-to-value mean?",
    answer: "The loan-to-value ratio (LTV) describes the ratio between the mortgage and the market value of the property. In Switzerland, the maximum LTV is generally 80%. This means you must contribute at least 20% equity, of which at least 10% must come from hard equity (not from pension funds).",
  },
  {
    question: "How much equity do I need to buy a property?",
    answer: "To purchase an owner-occupied property, you need at least 20% of the purchase price as equity. At least 10% must come from so-called hard equity (e.g., savings, gifts, advance inheritance). The remaining 10% can be drawn from the 2nd pillar (pension fund).",
  },
  {
    question: "What is the difference between a fixed-rate and a SARON mortgage?",
    answer: "With a fixed-rate mortgage, the interest rate is fixed for a set term (e.g., 2, 5 or 10 years). You have planning security but cannot benefit from falling rates. With a SARON mortgage, the interest rate is regularly adjusted to the current money market rate (SARON). You benefit from rate decreases but also bear the risk of rising rates.",
  },
  {
    question: "When should I refinance my existing mortgage?",
    answer: "It's best to contact us 6 to 12 months before your existing mortgage expires. This gives us enough time to analyze the market and obtain the most attractive offers. A forward contract (pre-fixing the interest rate) is also possible.",
  },
  {
    question: "How does the process at HYPONOVA work?",
    answer: "The process is simple: (1) Share your key data with us or use our online calculator. (2) We arrange a free consultation and analyze your situation. (3) We obtain offers from our partners and present you with the best options. You decide, no pressure, no costs.",
  },
  {
    question: "What documents do I need?",
    answer: "For an initial assessment, information about your income, equity and desired property is sufficient. For the formal offer, we typically need: salary statements, tax returns, account statements for equity, pension fund certificate, and property documents (land registry extract, valuation, plans).",
  },
  {
    question: "Does HYPONOVA also offer consultations outside the Canton of Aargau?",
    answer: "Yes, we advise clients throughout Switzerland. Our consultations take place conveniently via video call, so you can benefit from our service regardless of your location.",
  },
];

export default function FAQPage() {
  const { t, lang } = useI18n();

  const faqItems = lang === "de" ? faqItemsDe : faqItemsEn;

  const heroHeading = {
    de: { before: "Häufig gestellte ", bold: "Fragen." },
    en: { before: "Frequently asked ", bold: "questions." },
  };

  const heroDesc = {
    de: "Antworten auf die wichtigsten Fragen rund um Hypotheken und unsere Beratung.",
    en: "Answers to the most important questions about mortgages and our consulting services.",
  };

  const ctaHeading = {
    de: { before: "Noch ", bold: "Fragen?" },
    en: { before: "Still have ", bold: "questions?" },
  };

  const ctaDesc = {
    de: "Kontaktieren Sie uns direkt oder buchen Sie ein kostenloses Beratungsgespräch.",
    en: "Contact us directly or book a free consultation.",
  };

  const ctaContact = {
    de: "Kontakt aufnehmen",
    en: "Get in touch",
  };

  return (
    <>
      <Header />
      <main>
        {/* -- HERO -- */}
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {t.nav.faq}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                {heroHeading[lang].before}<span style={{ fontWeight: 600 }}>{heroHeading[lang].bold}</span>
              </h1>
              <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
                {heroDesc[lang]}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* -- FAQ ACCORDION -- */}
        <section className="pb-24 lg:pb-32">
          <div className="max-w-[900px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <div style={{ borderTop: "1px solid #e5e5e5" }}>
                <Accordion items={faqItems} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* -- CTA -- */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#000" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                {ctaHeading[lang].before}<span style={{ fontWeight: 600 }}>{ctaHeading[lang].bold}</span>
              </h2>
              <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
                {ctaDesc[lang]}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  {ctaContact[lang]}
                </Link>
                <Link
                  href="/termin"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ border: "1px solid #fff", color: "#fff" }}
                >
                  {t.booking.title}
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
