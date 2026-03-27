"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Accordion from "@/components/ui/Accordion";

const faqItems = [
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
    answer: "Die Belehnung (Loan-to-Value, LTV) beschreibt das Verhältnis zwischen der Hypothek und dem Verkehrswert der Liegenschaft. In der Schweiz beträgt die maximale Belehnung in der Regel 80 %. Das bedeutet, dass Sie mindestens 20 % Eigenmittel einbringen müssen — davon mindestens 10 % aus harten Eigenmitteln (nicht aus der Pensionskasse).",
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
    answer: "Der Prozess ist einfach: (1) Sie teilen uns Ihre Eckdaten mit oder nutzen unseren Online-Rechner. (2) Wir vereinbaren ein kostenloses Beratungsgespräch und analysieren Ihre Situation. (3) Wir holen Angebote bei unseren Partnern ein und präsentieren Ihnen die besten Optionen. Sie entscheiden — ohne Druck und ohne Kosten.",
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

export default function FAQPage() {
  return (
    <>
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                FAQ
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                Häufig gestellte <span style={{ fontWeight: 600 }}>Fragen.</span>
              </h1>
              <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
                Antworten auf die wichtigsten Fragen rund um Hypotheken und unsere Beratung.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── FAQ ACCORDION ── */}
        <section className="pb-24 lg:pb-32">
          <div className="max-w-[900px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <div style={{ borderTop: "1px solid #e5e5e5" }}>
                <Accordion items={faqItems} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#000" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                Noch <span style={{ fontWeight: 600 }}>Fragen?</span>
              </h2>
              <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
                Kontaktieren Sie uns direkt oder buchen Sie ein kostenloses Beratungsgespräch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  Kontakt aufnehmen
                </Link>
                <Link
                  href="/termin"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ border: "1px solid #fff", color: "#fff" }}
                >
                  Termin buchen
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
