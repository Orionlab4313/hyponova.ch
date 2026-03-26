"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactFloat from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ScrollReveal, { SlideUp, StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/ScrollReveal";
import LogoMarquee from "@/components/ui/LogoMarquee";
import CountUp from "@/components/ui/CountUp";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ── HERO (BKB-Style: Title + Full-width image with overlay) ── */}
        <section className="bg-white">
          {/* Title area */}
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]"
              style={{ fontWeight: 300, color: "#1a1a1a" }}
            >
              Die neue Art der Hypothekenberatung.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl mt-4 max-w-2xl"
              style={{ color: "#6b6b6b" }}
            >
              Digital. Unabhängig. Transparent.
            </motion.p>
          </div>

          {/* Full-width hero image with overlay card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-4 lg:mx-10 mb-52 sm:mb-0"
          >
            <div className="relative w-full overflow-visible" style={{ height: "clamp(350px, 55vh, 600px)" }}>
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"
                alt="Schweizer Eigenheim"
                className="w-full h-full object-cover"
              />
              {/* Overlay card — Mobile: centered below image | Desktop: floating bottom-right */}
              <div className="absolute left-4 right-4 -bottom-[30%] sm:bottom-[35px] sm:right-[60px] sm:left-auto sm:w-[480px] p-6 sm:p-8 lg:p-10" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999" }}>
                  Ihr Hypothekenpartner in der Schweiz
                </p>
                <p className="text-lg lg:text-xl font-medium text-white leading-snug mb-4">
                  Wir vergleichen Angebote zahlreicher Banken, Versicherungen und Pensionskassen — kostenlos und transparent.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/rechner"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors bg-white text-black hover:bg-gray-100"
                  >
                    Jetzt berechnen
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/termin"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    Beratung buchen
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── PARTNER LOGOS (Auto-Scroll Marquee) ── */}
        <LogoMarquee />

        {/* ── SERVICES ── */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                Dienstleistungen
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                Spezialisiert auf <span style={{ fontWeight: 600 }}>selbstbewohntes Wohneigentum.</span>
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <SlideUp delay={0.1}>
                <Link href="/dienstleistungen" className="group block">
                  <div className="aspect-[16/10] mb-6 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80"
                      alt="Eigenheim kaufen"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999" }}>Kauffinanzierung</p>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#c8553d] transition-colors">
                    Ich möchte ein Eigenheim kaufen
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#6b6b6b" }}>
                    Wir begleiten Sie vollumfänglich bei Ihrem Liegenschaftskauf — von der Finanzierungsberatung bis zur Unterzeichnung.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: "#c8553d" }}>
                    Prozess starten
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </SlideUp>

              <SlideUp delay={0.2}>
                <Link href="/dienstleistungen" className="group block">
                  <div className="aspect-[16/10] mb-6 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80"
                      alt="Hypothek ablösen"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999" }}>Hypothekenablösung</p>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#c8553d] transition-colors">
                    Ich habe bereits eine Hypothek
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#6b6b6b" }}>
                    Lassen Sie uns Ihre bestehende Hypothek prüfen. Wir holen die besten Angebote ein und zeigen Ihnen Ihr Einsparpotenzial.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: "#c8553d" }}>
                    Angebote einholen
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </SlideUp>
            </div>
          </div>
        </section>

        {/* ── RECHNER TEASER ── */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#0f0f0f" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left">
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#666" }}>
                  Hypothekenrechner
                </p>
                <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                  Berechnen Sie Ihre
                  <br />
                  <span style={{ fontWeight: 600 }}>Tragbarkeit in Sekunden.</span>
                </h2>
                <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "#888" }}>
                  Unser Rechner zeigt Ihnen sofort, ob Ihre Wunschimmobilie finanzierbar ist.
                  Belehnung, Tragbarkeit und monatliche Kosten — alles auf einen Blick.
                </p>
                <Link
                  href="/rechner"
                  className="inline-flex items-center px-7 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  Zum Rechner
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.2}>
                <div className="p-8" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Kaufpreis</p>
                      <p className="text-2xl font-semibold">
                        <CountUp end={1000000} prefix="CHF " duration={2500} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Eigenmittel</p>
                      <p className="text-2xl font-semibold">
                        <CountUp end={250000} prefix="CHF " duration={2000} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Belehnung</p>
                      <p className="text-2xl font-semibold" style={{ color: "#4ade80" }}>
                        <CountUp end={75} suffix="%" duration={1800} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Tragbarkeit</p>
                      <p className="text-2xl font-semibold" style={{ color: "#4ade80" }}>
                        <CountUp end={28.5} suffix="%" decimals={1} duration={1800} separator="" />
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#666" }}>Monatliche Kosten (kalkulatorisch)</p>
                    <p className="text-3xl font-bold">
                      <CountUp end={4722} prefix="CHF " duration={2500} />
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── WARUM HYPONOVA ── */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                Ihre Vorteile
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                Warum Sie Ihre Hypothek über <span style={{ fontWeight: 600 }}>HYPONOVA</span> abschliessen sollten.
              </h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" staggerDelay={0.1}>
              {[
                { num: "01", title: "Umfassender Vergleich", desc: "Wir vergleichen die Angebote verschiedener Partnerbanken, Versicherungen und Pensionskassen — und finden die attraktivste Offerte für Sie." },
                { num: "02", title: "Enorme Zeitersparnis", desc: "Sie sparen sich das Einreichen des Dossiers bei mehreren Banken und die gesamte Korrespondenz. Diese Zeit können Sie besser nutzen." },
                { num: "03", title: "Vollständig kostenlos", desc: "Die Beratung und der Abschlussprozess sind für Sie kostenlos. Wir werden direkt von den Kreditgebern entschädigt." },
                { num: "04", title: "Kein Risiko", desc: "Bei keinem Abschluss fallen für Sie keine Kosten an. Sie gehen keine Verpflichtung ein und können sich jederzeit anders entscheiden." },
                { num: "05", title: "Gezielte Marktanalyse", desc: "Wir analysieren den Markt systematisch nach den attraktivsten Konditionen und prüfen Struktur, Laufzeit und Flexibilität." },
                { num: "06", title: "Persönliche Beratung", desc: "Jede Finanzierungssituation ist einzigartig. Wir entwickeln eine Lösung, die exakt zu Ihrer Lebenssituation passt." },
              ].map((item) => (
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

        {/* ── FULL-WIDTH IMAGE SECTION ── */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80"
            alt="Schweizer Finanzplatz"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
              <ScrollReveal>
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                  In drei Schritten
                </p>
                <h2 className="text-4xl md:text-5xl text-white leading-[1.15] max-w-xl" style={{ fontWeight: 300 }}>
                  So einfach <span style={{ fontWeight: 600 }}>funktioniert&apos;s.</span>
                </h2>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 3 SCHRITTE ── */}
        <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f5f3" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                { step: "1", title: "Situation erfassen", desc: "Nutzen Sie unseren kostenlosen Hypothekenrechner oder teilen Sie uns Ihre Eckdaten mit — wir erstellen eine erste Einschätzung." },
                { step: "2", title: "Kostenlose Beratung", desc: "Buchen Sie ein unverbindliches Onlinegespräch. Gemeinsam definieren wir die optimale Strategie für Ihre Finanzierung." },
                { step: "3", title: "Beste Offerte wählen", desc: "Wir präsentieren Ihnen die attraktivsten Angebote unserer Partner. Sie entscheiden — ohne Druck, ohne Kosten." },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
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

        {/* ── TESTIMONIAL / TRUST ── */}
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=700&q=80"
                    alt="Beratungsgespräch"
                    className="w-full h-full object-cover"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.15}>
                <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                  Vertrauen
                </p>
                <h2 className="text-3xl md:text-4xl leading-[1.2] mb-6" style={{ fontWeight: 300 }}>
                  <span style={{ fontWeight: 600 }}>Unabhängig</span> und nur Ihren Interessen verpflichtet.
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: "#6b6b6b" }}>
                  Anders als Ihre Hausbank sind wir keinem Institut verpflichtet. Unsere Empfehlungen basieren ausschliesslich auf Ihren Bedürfnissen und den besten verfügbaren Konditionen am Markt.
                </p>
                <p className="text-base leading-relaxed mb-8" style={{ color: "#6b6b6b" }}>
                  HYPONOVA mit Sitz in Möhlin bietet unabhängige Hypothekenberatung für Kundinnen und Kunden in der gesamten Schweiz — vor Ort oder bequem per Videocall.
                </p>
                <Link
                  href="/ueber-uns"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
                  style={{ color: "#c8553d" }}
                >
                  Über HYPONOVA erfahren
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#000" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                Bereit für Ihre <span style={{ fontWeight: 600 }}>neue Hypothek?</span>
              </h2>
              <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
                Berechnen Sie jetzt Ihre Tragbarkeit oder buchen Sie direkt ein
                kostenloses Beratungsgespräch mit unseren Experten.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/rechner"
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fff", color: "#000" }}
                >
                  Hypothekenrechner
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
      <ContactFloat />
    </>
  );
}
