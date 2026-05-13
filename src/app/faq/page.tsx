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
    question: "Was ist ein Hypothekenbroker?",
    answer: "Ein Hypothekenbroker vergleicht die Angebote verschiedener Banken, Versicherungen und Pensionskassen und findet für Sie die attraktivste Finanzierungslösung. Anders als Ihre Hausbank sind wir unabhängig und nicht an ein einzelnes Institut gebunden.",
  },
  {
    question: "Ist die Beratung bei HYPONOVA wirklich kostenlos?",
    answer: "Ja, die Beratung und der gesamte Abschlussprozess sind für Sie vollständig kostenlos. Wir werden direkt von den Kreditgebern entschädigt. Sollte es zu keinem Abschluss kommen, entstehen Ihnen keinerlei Kosten.",
  },
  {
    question: "Was bedeutet Tragbarkeit?",
    answer: "Die Tragbarkeit beschreibt das Verhältnis zwischen den jährlichen Wohnkosten (Hypothekarzinsen, Amortisation und Nebenkosten) und Ihrem Bruttoeinkommen. In der Schweiz gilt eine Finanzierung als tragbar, wenn die kalkulatorischen Kosten maximal einen Drittel (33.3%) des Bruttoeinkommens ausmachen.",
  },
  {
    question: "Was bedeutet Belehnung?",
    answer: "In der Schweiz beträgt die maximale Belehnung in der Regel 80 % des Immobilienwerts. Eine höhere Belehnung ist nur möglich, wenn zusätzliche Sicherheiten gestellt werden, beispielsweise durch die Verpfändung von Pensionskassenguthaben, vorausgesetzt, die höhere Hypothek ist tragbar.",
  },
  {
    question: "Welche Eigenmittel benötige ich für den Kauf eines Eigenheims?",
    answer: "Für den Kauf eines selbstbewohnten Eigenheims benötigen Sie mindestens 20% des Kaufpreises als Eigenmittel. Davon müssen mindestens 10% aus sogenannten harten Eigenmitteln stammen (z.B. Ersparnisse, Schenkungen, Erbvorbezüge). Die restlichen 10% können aus der 2. Säule (Pensionskasse) bezogen werden.",
  },
  {
    question: "Was ist der Unterschied zwischen Festhypothek und SARON-Hypothek?",
    answer: "Bei einer Festhypothek wird der Zinssatz für eine feste Laufzeit (z.B. 2, 5 oder 10 Jahre) fixiert. Sie haben Planungssicherheit, können aber nicht von sinkenden Zinsen profitieren. Bei einer SARON-Hypothek wird der Zinssatz regelmässig an den aktuellen Geldmarktsatz (SARON) angepasst. Sie profitieren von Zinssenkungen, tragen aber auch das Risiko steigender Zinsen.",
  },
  {
    question: "Wann sollte ich meine bestehende Hypothek ablösen?",
    answer: "Am besten kontaktieren Sie uns 6 bis 12 Monate vor Ablauf Ihrer bestehenden Hypothek. So haben wir genügend Zeit, den Markt zu analysieren und die attraktivsten Angebote einzuholen. Auch ein Forward-Abschluss (Vorab-Fixierung des Zinssatzes) ist möglich.",
  },
  {
    question: "Wie läuft der Prozess bei HYPONOVA ab?",
    answer: "Der Ablauf ist einfach: Sie übermitteln uns Ihre Eckdaten, bequem über den Fragebogen auf unserer Website, per E-Mail oder telefonisch. Wenn Sie Unterstützung bei der Wahl der passenden Finanzierungsstrategie wünschen, vereinbaren wir ein persönliches Beratungsgespräch und analysieren Ihre individuelle Situation umfassend. Falls Sie bereits wissen, welches Hypothekarmodell und welche Laufzeit Sie bevorzugen, holen wir direkt Angebote von verschiedenen Finanzinstituten ein und vergleichen diese für Sie. Anschliessend präsentieren wir Ihnen die besten Offerten. Sie entscheiden, ohne Druck und ohne Kosten.",
  },
  {
    question: "Welche Dokumente benötige ich?",
    answer: "Für eine erste Einschätzung genügen Angaben zu Ihrem Einkommen, Ihren Eigenmitteln und der gewünschten Liegenschaft. Für die formelle Offerte benötigen wir in der Regel: Lohnausweise, Steuererklärung, Auszüge der Eigenmittel, Pensionskassenausweis sowie Unterlagen zur Liegenschaft (Grundbuchauszug, Schätzung, Pläne). Sobald Sie die gewünschte Dienstleistung ausgewählt und den Fragebogen ausgefüllt haben, erhalten Sie von uns eine persönliche E-Mail mit Ihrer individuellen Unterlagen-Checkliste sowie einem persönlichen Upload-Link. Über diesen Link können Sie uns Ihre Unterlagen sicher, schnell und unkompliziert übermitteln. Ein vollständiges Hypothekardossier bildet die Grundlage, damit wir für Sie die besten Angebote und Konditionen bei verschiedenen Finanzinstituten einholen können.",
  },
  {
    question: "Gibt es eine Mindestsumme, um vom Hypothekenvergleich profitieren zu können?",
    answer: "Nein. Im Gegensatz zu vielen anderen Hypothekenbrokern bietet HYPONOVA seine Dienstleistungen unabhängig von der Höhe der Hypothek an.\n\nUnser Ziel ist es, die Eigenheimfinanzierung für Kundinnen und Kunden in der ganzen Schweiz transparent, unabhängig und bestmöglich zu optimieren, unabhängig davon, ob es sich um kleinere oder grössere Finanzierungssummen handelt.",
  },
  {
    question: "Übernimmt HYPONOVA auch den Hypothekenvergleich für Renditeobjekte?",
    answer: "HYPONOVA hat sich bewusst nur auf Eigenheimfinanzierungen spezialisiert, da uns dieses Thema besonders am Herzen liegt. Dadurch können wir unsere Kundinnen und Kunden in diesem Bereich mit hoher Fachkompetenz, persönlicher Beratung und massgeschneiderten Finanzierungslösungen optimal begleiten. Renditeobjekte finanzieren wir nur auf Anfrage.",
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
    answer: "Affordability describes the ratio between annual housing costs (mortgage interest, amortization and ancillary costs) and your gross income. In Switzerland, financing is considered affordable when the imputed costs amount to a maximum of one third (33.3%) of gross income.",
  },
  {
    question: "What does loan-to-value mean?",
    answer: "In Switzerland, the maximum loan-to-value is generally 80 % of the property value. A higher ratio is only possible when additional collateral is provided, for example by pledging pension fund assets, provided the higher mortgage remains affordable.",
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
    answer: "The process is simple: you send us your key data, conveniently via the questionnaire on our website, by email or by phone. If you would like support choosing the right financing strategy, we arrange a personal consultation and analyze your individual situation in detail. If you already know which mortgage model and term you prefer, we directly request offers from various financial institutions and compare them for you. We then present the best offers. You decide, no pressure, no costs.",
  },
  {
    question: "What documents do I need?",
    answer: "For an initial assessment, information about your income, equity and desired property is sufficient. For the formal offer, we typically need: salary statements, tax returns, statements of your equity, pension fund certificate, and property documents (land registry extract, valuation, plans). Once you have selected the desired service and filled out the questionnaire, you will receive a personal email from us with your individual document checklist and a personal upload link. Via this link, you can send us your documents securely, quickly and conveniently. A complete mortgage dossier is the basis for us to obtain the best offers and conditions from various financial institutions for you.",
  },
  {
    question: "Is there a minimum amount to benefit from a mortgage comparison?",
    answer: "No. Unlike many other mortgage brokers, HYPONOVA offers its services regardless of the mortgage amount.\n\nOur goal is to optimize home financing for clients throughout Switzerland transparently, independently and to the best possible extent, regardless of whether smaller or larger financing amounts are involved.",
  },
  {
    question: "Does HYPONOVA also handle mortgage comparisons for investment properties?",
    answer: "HYPONOVA has deliberately specialized only in home financing, as this topic is particularly close to our hearts. This allows us to support our clients in this area with deep expertise, personal advice and tailor-made financing solutions. We finance investment properties only on request.",
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
