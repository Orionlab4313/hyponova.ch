"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ScrollReveal, { SlideUp } from "@/components/ui/ScrollReveal";
import { useI18n } from "@/i18n/context";

const ACCENT = "#c8553d";

export default function DienstleistungenPage() {
  const { lang } = useI18n();

  const labels = {
    de: {
      eyebrow: "Dienstleistungen",
      headlinePre: "Spezialisiert auf ",
      headlineHl: "selbstbewohntes Wohneigentum.",
      kaufKategorie: "Kauffinanzierung",
      kaufTitel: "Eigenheim kaufen",
      kaufDesc: "Wir begleiten Sie vollumfänglich bei Ihrem Liegenschaftskauf, von der Finanzierungsberatung bis zur Unterzeichnung.",
      kaufCta: "Mehr erfahren",
      abloesungKategorie: "Hypothekenablösung",
      abloesungTitel: "Hypothek ablösen",
      abloesungDesc: "Lassen Sie Ihre bestehende Hypothek prüfen. Wir holen die besten Angebote ein und zeigen Ihr Einsparpotenzial.",
      abloesungCta: "Mehr erfahren",
    },
    en: {
      eyebrow: "Services",
      headlinePre: "Specialized in ",
      headlineHl: "owner-occupied properties.",
      kaufKategorie: "Purchase financing",
      kaufTitel: "Buy a property",
      kaufDesc: "We support you throughout your property purchase, from financing advice to signing.",
      kaufCta: "Learn more",
      abloesungKategorie: "Mortgage refinancing",
      abloesungTitel: "Refinance mortgage",
      abloesungDesc: "Let us review your existing mortgage. We get the best offers and show your savings potential.",
      abloesungCta: "Learn more",
    },
  } as const;
  const l = labels[lang];

  return (
    <>
      <Header />
      <main>
        <section className="py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <ScrollReveal>
              <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
                {l.eyebrow}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-16 max-w-2xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
                {l.headlinePre}<span style={{ fontWeight: 600 }}>{l.headlineHl}</span>
              </h1>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <SlideUp delay={0.05}>
                <Link href="/dienstleistungen/eigenheim-kaufen" className="group block" style={{ color: "inherit", textDecoration: "none" }}>
                  <div className="aspect-[16/10] mb-6 overflow-hidden relative">
                    <img
                      src="/images/eigenheim-kaufen.png"
                      alt={l.kaufTitel}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999" }}>{l.kaufKategorie}</p>
                  <h2 className="text-2xl font-semibold mb-3 transition-colors group-hover:text-[#c8553d]" style={{ color: "#1a1a1a" }}>
                    {l.kaufTitel}
                  </h2>
                  <p className="text-base leading-relaxed mb-5" style={{ color: "#6b6b6b" }}>
                    {l.kaufDesc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: ACCENT }}>
                    {l.kaufCta}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </SlideUp>

              <SlideUp delay={0.1}>
                <Link href="/dienstleistungen/hypothek-abloesen" className="group block" style={{ color: "inherit", textDecoration: "none" }}>
                  <div className="aspect-[16/10] mb-6 overflow-hidden relative">
                    <img
                      src="/images/beratung-paar.png"
                      alt={l.abloesungTitel}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999" }}>{l.abloesungKategorie}</p>
                  <h2 className="text-2xl font-semibold mb-3 transition-colors group-hover:text-[#c8553d]" style={{ color: "#1a1a1a" }}>
                    {l.abloesungTitel}
                  </h2>
                  <p className="text-base leading-relaxed mb-5" style={{ color: "#6b6b6b" }}>
                    {l.abloesungDesc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: ACCENT }}>
                    {l.abloesungCta}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </SlideUp>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
