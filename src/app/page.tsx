"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactFloat from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ScrollReveal, { SlideUp, StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/ScrollReveal";
// import LogoMarquee from "@/components/ui/LogoMarquee"; // 2026-05-18: temporaer ausgeblendet, siehe Hero-Section
import CountUp from "@/components/ui/CountUp";
import { useI18n } from "@/i18n/context";

export default function Home() {
  const { t, lang } = useI18n();

  const heroLabels = {
    de: "Ihre neue Hypothek.",
    en: "Your new mortgage.",
  };

  const heroPartnerBadge = {
    de: "Ihr Hypothekenpartner in der Schweiz",
    en: "Your mortgage partner in Switzerland",
  };

  const heroOverlayDesc = {
    de: "Wir vergleichen Angebote zahlreicher Banken, Versicherungen und Pensionskassen, kostenlos und transparent.",
    en: "We compare offers from numerous banks, insurance companies and pension funds, free and transparent.",
  };

  const servicesLabel = {
    de: "Dienstleistungen",
    en: "Services",
  };

  const servicesHeading = {
    de: { before: "Spezialisiert auf ", bold: "selbstbewohntes Wohneigentum." },
    en: { before: "Specialized in ", bold: "owner-occupied properties." },
  };

  const purchaseCategory = {
    de: "Kauffinanzierung",
    en: "Purchase financing",
  };

  const purchaseDesc = {
    de: "Wir begleiten Sie vollumfänglich bei Ihrem Liegenschaftskauf, von der Finanzierungsberatung bis zur Unterzeichnung.",
    en: "We support you throughout your property purchase, from financing advice to signing.",
  };

  const purchaseCta = {
    de: "Prozess starten",
    en: "Start process",
  };

  const refinanceCategory = {
    de: "Hypothekenablösung",
    en: "Mortgage refinancing",
  };

  const refinanceDesc = {
    de: "Lassen Sie uns Ihre bestehende Hypothek prüfen. Wir holen die besten Angebote ein und zeigen Ihnen Ihr Einsparpotenzial.",
    en: "Let us review your existing mortgage. We get the best offers and show you your savings potential.",
  };

  const refinanceCta = {
    de: "Angebote einholen",
    en: "Get quotes",
  };

  const calcLabel = {
    de: "Hypothekenrechner",
    en: "Mortgage Calculator",
  };

  const calcHeading = {
    de: { before: "Berechnen Sie Ihre", bold: "Tragbarkeit in Sekunden." },
    en: { before: "Calculate your", bold: "affordability in seconds." },
  };

  const calcDesc = {
    de: "Unser Rechner zeigt Ihnen sofort, ob Ihre Wunschimmobilie finanzierbar ist. Belehnung, Tragbarkeit und monatliche Kosten, alles auf einen Blick.",
    en: "Our calculator instantly shows you whether your dream property is financeable. Loan-to-value, affordability and monthly costs, all at a glance.",
  };

  const calcCta = {
    de: "Zum Rechner",
    en: "To calculator",
  };

  const calcLabels = {
    de: { price: "Kaufpreis", equity: "Eigenmittel", ltv: "Belehnung", afford: "Tragbarkeit", monthly: "Monatliche Kosten (kalkulatorisch)" },
    en: { price: "Purchase price", equity: "Equity", ltv: "Loan-to-value", afford: "Affordability", monthly: "Monthly costs (imputed)" },
  };

  const advantagesLabel = {
    de: "Ihre Vorteile",
    en: "Your advantages",
  };

  const advantagesHeading = {
    de: { before: "Warum Sie Ihre Hypothek über ", bold: "HYPONOVA", after: " abschliessen sollten." },
    en: { before: "Why you should close your mortgage through ", bold: "HYPONOVA", after: "." },
  };

  const advantages = {
    de: [
      { num: "01", title: "Bestes Zinsangebot", desc: "Wir fragen mehrere Anbieter gleichzeitig an und vergleichen die Angebote direkt miteinander. So sichern Sie sich die besten Konditionen am Markt." },
      { num: "02", title: "Unabhängigkeit", desc: "Wir sind nicht an eine einzelne Bank gebunden. Stattdessen vergleichen wir Banken, Versicherungen und Pensionskassen und empfehlen die Lösung, die zu Ihrer Situation passt." },
      { num: "03", title: "Objektbewertung", desc: "Immobilien werden je nach Anbieter unterschiedlich bewertet. Wir finden Finanzierungspartner, die den Objektwert realistisch einschätzen und optimale Bedingungen ermöglichen." },
      { num: "04", title: "Zeitersparnis", desc: "Sie vermeiden mehrere Banktermine und doppelten Aufwand. Wir bereiten alle Unterlagen auf und übernehmen Vergleich sowie Verhandlung für Sie." },
      { num: "05", title: "Finanzierungsstrategie", desc: "Wir entwickeln eine durchdachte Struktur für Ihre Finanzierung, abgestimmt auf Laufzeiten, Eigenmittel, Amortisation und Vorsorgelösungen." },
      { num: "06", title: "Schnelle Erreichbarkeit", desc: "Während des gesamten Prozesses steht Ihnen ein persönlicher Ansprechpartner zur Seite und sorgt für eine reibungslose Koordination." },
    ],
    en: [
      { num: "01", title: "Best interest rate", desc: "We request quotes from multiple providers simultaneously and compare the offers side by side. This way you secure the best conditions on the market." },
      { num: "02", title: "Independence", desc: "We are not tied to a single bank. Instead, we compare banks, insurance companies and pension funds and recommend the solution that fits your situation." },
      { num: "03", title: "Property valuation", desc: "Properties are valued differently by each provider. We find financing partners who realistically assess the property value and enable optimal conditions." },
      { num: "04", title: "Time savings", desc: "You avoid multiple bank appointments and duplicated effort. We prepare all documents and handle comparison and negotiation for you." },
      { num: "05", title: "Financing strategy", desc: "We develop a thoughtful structure for your financing, tailored to terms, equity, amortization and pension solutions." },
      { num: "06", title: "Quick availability", desc: "Throughout the entire process, a personal contact is by your side and ensures smooth coordination." },
    ],
  };

  const imageLabel = {
    de: "In drei Schritten",
    en: "In three steps",
  };

  const imageHeading = {
    de: { before: "So einfach ", bold: "funktioniert's." },
    en: { before: "It's that ", bold: "simple." },
  };

  const steps = {
    de: [
      { step: "1", title: "Situation erfassen", desc: "Wählen Sie die passende Dienstleistung und erfassen Sie Ihre Angaben im Fragebogen." },
      { step: "2", title: "Kostenlose Beratung", desc: "Buchen Sie bei Bedarf eine Beratung. Gemeinsam entwickeln wir Ihre optimale Finanzierungsstrategie." },
      { step: "3", title: "Beste Offerte wählen", desc: "Wir präsentieren Ihnen die attraktivsten Angebote unserer Partner. Sie entscheiden, ohne Druck, ohne Kosten." },
    ],
    en: [
      { step: "1", title: "Assess your situation", desc: "Choose the right service and enter your details in the questionnaire." },
      { step: "2", title: "Free consultation", desc: "Book a consultation if needed. Together we develop your optimal financing strategy." },
      { step: "3", title: "Choose the best offer", desc: "We present you the most attractive offers from our partners. You decide, no pressure, no costs." },
    ],
  };

  const trustLabel = {
    de: "Vertrauen",
    en: "Trust",
  };

  const trustHeading = {
    de: { bold: "Unabhängig", after: " und nur Ihren Interessen verpflichtet." },
    en: { bold: "Independent", after: " and committed only to your interests." },
  };

  const trustP1 = {
    de: "Anders als Ihre Hausbank sind wir keinem Institut verpflichtet. Unsere Empfehlungen basieren ausschliesslich auf Ihren Bedürfnissen und den besten verfügbaren Konditionen am Markt.",
    en: "Unlike your bank, we are not bound to any institution. Our recommendations are based solely on your needs and the best available market conditions.",
  };

  const trustP2 = {
    de: "HYPONOVA mit Sitz in Möhlin bietet unabhängige Hypothekenberatung für Kundinnen und Kunden in der gesamten Schweiz, vor Ort oder bequem per Videocall.",
    en: "HYPONOVA, based in Möhlin, offers independent mortgage consulting for clients throughout Switzerland, on-site or conveniently via video call.",
  };

  const trustCta = {
    de: "Mehr über HYPONOVA",
    en: "More about HYPONOVA",
  };

  const ctaHeading = {
    de: { before: "Bereit für Ihre ", bold: "neue Hypothek?" },
    en: { before: "Ready for your ", bold: "new mortgage?" },
  };

  const ctaDesc = {
    de: "Holen Sie sich jetzt Ihr passendes Angebot ein oder buchen Sie direkt ein kostenloses Beratungsgespräch.",
    en: "Get your matching offer now or book a free consultation directly.",
  };

  const ctaPrimary = {
    de: "Angebote einholen",
    en: "Get quotes",
  };

  return (
    <>
      <Header />
      <main>
        {/* -- HERO (BKB-Style: Title + Full-width image with overlay) -- */}
        <section className="bg-white">
          {/* Title area */}
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-5 lg:pt-8 pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]"
              style={{ fontWeight: 300, color: "#1a1a1a" }}
            >
              {heroLabels[lang]}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-lg md:text-xl mt-4 max-w-2xl"
              style={{ color: "#6b6b6b" }}
            >
              {t.hero.subtitle}
            </motion.p>
          </div>

          {/* Full-width hero image with overlay card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative mx-4 lg:mx-10 mb-40 sm:mb-0"
          >
            <div className="relative w-full overflow-visible" style={{ height: "clamp(350px, 55vh, 600px)" }}>
              <Image
                src="/images/eigenheim-modern.png"
                alt="Schweizer Eigenheim"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1400px"
                className="object-cover"
              />
              {/* Overlay card */}
              <div className="absolute left-4 right-4 -bottom-[30%] sm:bottom-[35px] sm:right-[60px] sm:left-auto sm:w-[480px] p-6 sm:p-8 lg:p-10" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999" }}>
                  {heroPartnerBadge[lang]}
                </p>
                <p className="text-lg lg:text-xl font-medium text-white leading-snug mb-4">
                  {heroOverlayDesc[lang]}
                </p>
                <div className="flex">
                  <Link
                    href="/dienstleistungen"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors bg-white text-black hover:bg-gray-100"
                  >
                    {t.hero.ctaCalculator}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* -- PARTNER LOGOS (Auto-Scroll Marquee) -- */}
        {/* Ausgeblendet 2026-05-18: Simon klaert Logo-Nutzungsrechte direkt mit den Banken (Termine ausstehend). */}
        {/* Reaktivierung: dieses Kommentar entfernen und naechste Zeile einkommentieren, sobald schriftliche Bewilligung vorliegt. */}
        {/* <LogoMarquee /> */}

        {/* -- SERVICES -- */}
        <section className="pt-8 pb-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {servicesLabel[lang]}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                {servicesHeading[lang].before}<span style={{ fontWeight: 600 }}>{servicesHeading[lang].bold}</span>
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <SlideUp delay={0.05}>
                <Link href="/dienstleistungen/eigenheim-kaufen" className="group block">
                  <div className="aspect-[16/10] mb-6 overflow-hidden relative">
                    <Image
                      src="/images/eigenheim-kaufen.png"
                      alt={t.services.newPurchase}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999" }}>{purchaseCategory[lang]}</p>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#c8553d] transition-colors">
                    {t.services.ctaNewPurchase}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#6b6b6b" }}>
                    {purchaseDesc[lang]}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: "#c8553d" }}>
                    {purchaseCta[lang]}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </SlideUp>

              <SlideUp delay={0.1}>
                <Link href="/dienstleistungen/hypothek-abloesen" className="group block">
                  <div className="aspect-[16/10] mb-6 overflow-hidden relative">
                    <Image
                      src="/images/beratung-paar.png"
                      alt={t.services.refinance}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999" }}>{refinanceCategory[lang]}</p>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#c8553d] transition-colors">
                    {t.services.ctaRefinance}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#6b6b6b" }}>
                    {refinanceDesc[lang]}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: "#c8553d" }}>
                    {refinanceCta[lang]}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </SlideUp>
            </div>
          </div>
        </section>

        {/* -- RECHNER TEASER -- */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#0f0f0f" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left">
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#666" }}>
                  {calcLabel[lang]}
                </p>
                <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                  {calcHeading[lang].before}
                  <br />
                  <span style={{ fontWeight: 600 }}>{calcHeading[lang].bold}</span>
                </h2>
                <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "#888" }}>
                  {calcDesc[lang]}
                </p>
                <Link
                  href="/rechner"
                  className="inline-flex items-center px-7 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  {calcCta[lang]}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.1}>
                <div className="p-8" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>{calcLabels[lang].price}</p>
                      <p className="text-2xl font-semibold">
                        <CountUp end={1000000} prefix="CHF " duration={1200} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>{calcLabels[lang].equity}</p>
                      <p className="text-2xl font-semibold">
                        <CountUp end={250000} prefix="CHF " duration={1000} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>{calcLabels[lang].ltv}</p>
                      <p className="text-2xl font-semibold" style={{ color: "#4ade80" }}>
                        <CountUp end={75} suffix="%" duration={800} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>{calcLabels[lang].afford}</p>
                      <p className="text-2xl font-semibold" style={{ color: "#4ade80" }}>
                        <CountUp end={28.5} suffix="%" decimals={1} duration={800} separator="" />
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#666" }}>{calcLabels[lang].monthly}</p>
                    <p className="text-3xl font-bold">
                      <CountUp end={4722} prefix="CHF " duration={1200} />
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* -- WARUM HYPONOVA -- */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {advantagesLabel[lang]}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                {advantagesHeading[lang].before}<span style={{ fontWeight: 600 }}>{advantagesHeading[lang].bold}</span>{advantagesHeading[lang].after}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" staggerDelay={0.1}>
              {advantages[lang].map((item) => (
                <StaggerItem key={item.num}>
                  <div className="group">
                    <span className="text-5xl font-extralight group-hover:text-[#c8553d] transition-colors duration-300" style={{ color: "#e5e5e5" }}>
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

        {/* -- FULL-WIDTH IMAGE SECTION -- */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <Image
            src="/images/eigenheim-modern.png"
            alt="Modernes Eigenheim"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
              <ScrollReveal>
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {imageLabel[lang]}
                </p>
                <h2 className="text-4xl md:text-5xl text-white leading-[1.15] max-w-xl" style={{ fontWeight: 300 }}>
                  {imageHeading[lang].before}<span style={{ fontWeight: 600 }}>{imageHeading[lang].bold}</span>
                </h2>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* -- 3 SCHRITTE -- */}
        <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f5f3" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {steps[lang].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ border: "2px solid #000", borderRadius: "50%" }}>
                      <span className="text-xl font-semibold">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* -- TESTIMONIAL / TRUST -- */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <Image
                    src="/images/beratung-paar.png"
                    alt="Beratungsgespräch"
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.08}>
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                  {trustLabel[lang]}
                </p>
                <h2 className="text-3xl md:text-4xl leading-[1.2] mb-6" style={{ fontWeight: 300 }}>
                  <span style={{ fontWeight: 600 }}>{trustHeading[lang].bold}</span>{trustHeading[lang].after}
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: "#6b6b6b" }}>
                  {trustP1[lang]}
                </p>
                <p className="text-base leading-relaxed mb-8" style={{ color: "#6b6b6b" }}>
                  {trustP2[lang]}
                </p>
                <Link
                  href="/ueber-uns"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
                  style={{ color: "#c8553d" }}
                >
                  {trustCta[lang]}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </ScrollReveal>
            </div>
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
                  href="/dienstleistungen"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  {ctaPrimary[lang]}
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
      <ContactFloat />
    </>
  );
}
