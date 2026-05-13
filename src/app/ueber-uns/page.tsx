"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";

export default function UeberUnsPage() {
  const { t, lang } = useI18n();

  const heroHeading = {
    de: { before: "Unabhängig. ", bold: "Nur Ihren Interessen verpflichtet." },
    en: { before: "Independent. ", bold: "Committed only to your interests." },
  };

  const missionLabel = {
    de: "Unsere Mission",
    en: "Our mission",
  };

  const missionHeading = {
    de: { before: "Wir finden die ", bold: "passende Hypothek zu den besten Konditionen." },
    en: { before: "We find the ", bold: "right mortgage at the best conditions." },
  };

  const whoLabel = {
    de: "Wer wir sind",
    en: "Who we are",
  };

  const whoHeading = {
    de: { before: "HYPONOVA, Ihr ", bold: "Hypothekenpartner", after: " in der Schweiz." },
    en: { before: "HYPONOVA, Your ", bold: "mortgage partner", after: " in Switzerland." },
  };

  const whoP1 = {
    de: "HYPONOVA ist ein unabhängiger Hypothekenbroker mit Sitz in Möhlin (AG). Wir vergleichen die Angebote zahlreicher Banken, Versicherungen und Pensionskassen, und finden für Sie die attraktivste Finanzierungslösung.",
    en: "HYPONOVA is an independent mortgage broker based in Möhlin (AG). We compare offers from numerous banks, insurance companies and pension funds, and find the most attractive financing solution for you.",
  };

  const whoP2 = {
    de: "Anders als Ihre Hausbank sind wir keinem Institut verpflichtet. Unsere Empfehlungen basieren ausschliesslich auf Ihren Bedürfnissen und den besten verfügbaren Konditionen am Markt. Die Beratung ist für Sie vollständig kostenlos.",
    en: "Unlike your bank, we are not bound to any institution. Our recommendations are based solely on your needs and the best available market conditions. The consultation is completely free for you.",
  };

  const whoP3 = {
    de: "Ob Neukauf oder Ablösung einer bestehenden Hypothek, wir begleiten Sie persönlich durch den gesamten Prozess. Digital, effizient und transparent.",
    en: "Whether buying new or refinancing an existing mortgage, we guide you personally through the entire process. Digital, efficient and transparent.",
  };

  const valuesLabel = {
    de: "Unsere Werte",
    en: "Our values",
  };

  const valuesHeading = {
    de: { before: "Wofür wir ", bold: "stehen." },
    en: { before: "What we ", bold: "stand for." },
  };

  const values = {
    de: [
      { num: "01", title: "Unabhängigkeit", desc: "Wir sind an kein Finanzinstitut gebunden. Das bedeutet: Unsere Empfehlungen orientieren sich ausschliesslich an Ihren Interessen, nicht an Vertriebszielen einer Bank." },
      { num: "02", title: "Transparenz", desc: "Sie erhalten alle Angebote übersichtlich aufbereitet, mit klarem Vergleich der Konditionen. Keine versteckten Kosten, keine Überraschungen." },
      { num: "03", title: "Kundenorientierung", desc: "Jede Finanzierungssituation ist einzigartig. Wir nehmen uns Zeit, Ihre persönliche Situation zu verstehen, und entwickeln eine massgeschneiderte Lösung." },
    ],
    en: [
      { num: "01", title: "Independence", desc: "We are not tied to any financial institution. This means: our recommendations are based solely on your interests, not on a bank's sales targets." },
      { num: "02", title: "Transparency", desc: "You receive all offers clearly prepared, with a clear comparison of conditions. No hidden costs, no surprises." },
      { num: "03", title: "Client focus", desc: "Every financing situation is unique. We take the time to understand your personal situation and develop a tailor-made solution." },
    ],
  };

  const founderLabel = {
    de: "Die Geschichte",
    en: "The story",
  };

  const founderP1 = {
    de: "Die HYPONOVA GmbH wurde von Simon Topalli gegründet. Während seiner knapp dreijährigen Tätigkeit in der Kundenberatung beim VZ VermögensZentrum eignete er sich fundiertes Fachwissen in den Bereichen Finanzierung, Vorsorge und Vermögensplanung an. Dabei erkannte er früh, wie komplex und intransparent der Hypothekenmarkt für viele Menschen wirkt. Doch Hypotheken sind nicht so kompliziert, wie sie oft dargestellt werden. Genau aus diesem Grund wurde HYPONOVA gegründet: mit dem Ziel, heutige und zukünftige Eigenheimbesitzer persönlich, transparent und unabhängig bei ihrer Finanzierung zu begleiten.",
    en: "HYPONOVA GmbH was founded by Simon Topalli. During his nearly three years in client advisory at VZ VermögensZentrum, he built deep expertise in financing, retirement planning and wealth management. He recognized early on how complex and opaque the mortgage market feels to many people. Yet mortgages are not as complicated as they are often portrayed. That is exactly why HYPONOVA was founded: to guide current and future homeowners personally, transparently and independently through their financing.",
  };

  const founderP2 = {
    de: "Simon Topalli entschied sich bewusst dagegen, an ein einzelnes Finanzinstitut gebunden zu sein. Stattdessen vergleicht HYPONOVA die Angebote von Banken, Versicherungen und Pensionskassen objektiv und unabhängig, um für jede Kundin und jeden Kunden die bestmögliche Finanzierungslösung zu finden.",
    en: "Simon Topalli deliberately chose not to be tied to a single financial institution. Instead, HYPONOVA compares offers from banks, insurance companies and pension funds objectively and independently to find the best possible financing solution for every client.",
  };

  const founderP3 = {
    de: "HYPONOVA. Ihre neue Hypothek.",
    en: "HYPONOVA. Your new mortgage.",
  };

  const founderCta = {
    de: "Persönliches Gespräch vereinbaren",
    en: "Schedule a personal meeting",
  };

  const ctaHeading = {
    de: { before: "Lernen Sie uns ", bold: "persönlich kennen." },
    en: { before: "Get to know us ", bold: "personally." },
  };

  const ctaDesc = {
    de: "Buchen Sie ein kostenloses, unverbindliches Beratungsgespräch, online oder telefonisch.",
    en: "Book a free, non-binding consultation, online or by phone.",
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
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-2 lg:pb-4">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {lang === "de" ? "Über HYPONOVA" : "About HYPONOVA"}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                {heroHeading[lang].before}<span style={{ fontWeight: 600 }}>{heroHeading[lang].bold}</span>
              </h1>
            </ScrollReveal>
          </div>
        </section>

        {/* -- MISSION -- */}
        <section className="bg-white pb-8 lg:pb-12">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <img
                src="/images/unsere-mission.png"
                alt={missionLabel[lang]}
                className="w-full h-auto mb-4 lg:mb-6"
              />
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-3" style={{ color: "#6b6b6b" }}>
                {missionLabel[lang]}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.15] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                {missionHeading[lang].before}<span style={{ fontWeight: 600 }}>{missionHeading[lang].bold}</span>
              </h2>
            </ScrollReveal>
          </div>
        </section>

        {/* -- ÜBER UNS TEXT -- */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <ScrollReveal direction="left">
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                  {whoLabel[lang]}
                </p>
                <h2 className="text-3xl md:text-4xl leading-[1.2] mb-6" style={{ fontWeight: 300 }}>
                  {whoHeading[lang].before}<span style={{ fontWeight: 600 }}>{whoHeading[lang].bold}</span>{whoHeading[lang].after}
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.15}>
                <p className="text-base leading-relaxed mb-6" style={{ color: "#6b6b6b" }}>
                  {whoP1[lang]}
                </p>
                <p className="text-base leading-relaxed mb-6" style={{ color: "#6b6b6b" }}>
                  {whoP2[lang]}
                </p>
                <p className="text-base leading-relaxed" style={{ color: "#6b6b6b" }}>
                  {whoP3[lang]}
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* -- WERTE -- */}
        <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f5f3" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {valuesLabel[lang]}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                {valuesHeading[lang].before}<span style={{ fontWeight: 600 }}>{valuesHeading[lang].bold}</span>
              </h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-12" staggerDelay={0.1}>
              {values[lang].map((item) => (
                <StaggerItem key={item.num}>
                  <div className="group">
                    <span className="text-5xl font-extralight group-hover:text-[#c8553d] transition-colors duration-300" style={{ color: "#ccc" }}>
                      {item.num}
                    </span>
                    <h3 className="text-lg font-semibold mt-2 mb-3">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* -- DIE GESCHICHTE -- */}
        <section className="py-24 lg:py-32">
          <div className="max-w-3xl mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {founderLabel[lang]}
              </p>
              <h2 className="text-3xl md:text-4xl leading-[1.2] mb-10" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                <span style={{ fontWeight: 600 }}>HYPONOVA.</span> {lang === "de" ? "Ihre neue Hypothek." : "Your new mortgage."}
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "#3a3a3a" }}>
                {founderP1[lang]}
              </p>
              <p className="text-base leading-relaxed mb-10" style={{ color: "#3a3a3a" }}>
                {founderP2[lang]}
              </p>
              <p className="text-xl md:text-2xl leading-[1.3] mb-10" style={{ fontWeight: 500, color: "#1a1a1a" }}>
                {founderP3[lang]}
              </p>
              <Link
                href="/termin"
                className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
                style={{ color: "#c8553d" }}
              >
                {founderCta[lang]}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
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
                  href="/termin"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  {t.booking.title}
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ border: "1px solid #fff", color: "#fff" }}
                >
                  {ctaContact[lang]}
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
