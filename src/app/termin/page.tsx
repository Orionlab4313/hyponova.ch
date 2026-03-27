"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Link from "next/link";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";

export default function TerminPage() {
  return (
    <>
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                Terminbuchung
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                Kostenlose <span style={{ fontWeight: 600 }}>Beratung buchen.</span>
              </h1>
              <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
                Vereinbaren Sie ein unverbindliches Onlinegespräch — bequem von zu Hause aus.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── CAL.COM EMBED PLACEHOLDER ── */}
        <section className="pb-24 lg:pb-32">
          <div className="max-w-[900px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <div
                className="p-16 text-center"
                style={{ backgroundColor: "#f5f5f3", border: "2px dashed #e0e0e0" }}
              >
                <svg className="w-16 h-16 mx-auto mb-6" fill="none" stroke="#999" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a1a" }}>
                  Online-Terminbuchung
                </h3>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#6b6b6b" }}>
                  Die Online-Terminbuchung wird in Kürze hier verfügbar sein. In der Zwischenzeit können Sie uns gerne direkt kontaktieren.
                </p>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center px-7 py-3.5 text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#000", color: "#fff" }}
                >
                  Kontakt aufnehmen
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── WAS ERWARTET SIE ── */}
        <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f5f3" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                Ihr Beratungsgespräch
              </p>
              <h2 className="text-4xl md:text-5xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300 }}>
                Was Sie <span style={{ fontWeight: 600 }}>erwartet.</span>
              </h2>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-12 max-w-5xl" staggerDelay={0.1}>
              {[
                {
                  step: "1",
                  title: "Persönliche Analyse",
                  desc: "Wir besprechen Ihre aktuelle Situation, Ihre Wünsche und Ihre finanziellen Rahmenbedingungen — vertraulich und unverbindlich.",
                },
                {
                  step: "2",
                  title: "Marktvergleich",
                  desc: "Basierend auf Ihren Angaben holen wir die attraktivsten Angebote unserer Partnerbanken, Versicherungen und Pensionskassen ein.",
                },
                {
                  step: "3",
                  title: "Ihre Entscheidung",
                  desc: "Wir präsentieren Ihnen die besten Optionen übersichtlich aufbereitet. Sie wählen — ohne Druck, ohne Kosten.",
                },
              ].map((item) => (
                <StaggerItem key={item.step}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ border: "2px solid #000", borderRadius: "50%" }}>
                      <span className="text-xl font-semibold">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#000" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
                Lieber <span style={{ fontWeight: 600 }}>schriftlich?</span>
              </h2>
              <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
                Senden Sie uns Ihre Anfrage über unser Kontaktformular. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                style={{ backgroundColor: "#fff", color: "#000" }}
              >
                Kontaktformular öffnen
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
