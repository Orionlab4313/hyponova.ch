"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n/context";
import BrandText from "@/components/BrandText";

export default function Footer() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();

  const tagline = {
    de: "Ihr unabhängiger Hypothekenpartner in der Schweiz. Effizient, transparent und vollständig unabhängig.",
    en: "Your independent mortgage partner in Switzerland. Efficient, transparent and fully independent.",
  };

  const servicesHeading = {
    de: "Dienstleistungen",
    en: "Services",
  };

  const serviceLinks = {
    de: [
      { href: "/dienstleistungen", label: "Eigenheim kaufen" },
      { href: "/dienstleistungen", label: "Hypothek ablösen" },
      { href: "/rechner", label: "Hypothekenrechner" },
      { href: "/termin", label: "Beratung buchen" },
    ],
    en: [
      { href: "/dienstleistungen", label: "Buy a property" },
      { href: "/dienstleistungen", label: "Refinance mortgage" },
      { href: "/rechner", label: "Mortgage calculator" },
      { href: "/termin", label: "Book consultation" },
    ],
  };

  const infoHeading = {
    de: "Information",
    en: "Information",
  };

  const credit = {
    de: "Webdesign von Orionlab",
    en: "Web design by Orionlab",
  };

  const creditTitle = {
    de: "Orionlab: Webdesign, KI und Automatisierung aus Möhlin",
    en: "Orionlab: web design, AI and automation from Möhlin, Switzerland",
  };

  const infoLinks = {
    de: [
      { href: "/ueber-uns", label: "Über HYPONOVA" },
      { href: "/blog", label: "Ratgeber" },
      { href: "/faq", label: "Häufige Fragen" },
      { href: "/kontakt", label: "Kontakt" },
    ],
    en: [
      { href: "/ueber-uns", label: "About HYPONOVA" },
      { href: "/blog", label: "Insights" },
      { href: "/faq", label: "FAQ" },
      { href: "/kontakt", label: "Contact" },
    ],
  };

  const legalHeading = {
    de: "Rechtliches",
    en: "Legal",
  };

  const legalLinks = {
    de: [
      { href: "/datenschutz", label: "Datenschutzerklärung" },
      { href: "/agb", label: "AGB" },
      { href: "/impressum", label: "Impressum" },
    ],
    en: [
      { href: "/datenschutz", label: "Privacy Policy" },
      { href: "/agb", label: "Terms & Conditions" },
      { href: "/impressum", label: "Imprint" },
    ],
  };

  const country = {
    de: "Schweiz",
    en: "Switzerland",
  };

  const copyright = t.footer.copyright.replace("{year}", String(year));

  return (
    <footer style={{ backgroundColor: "#0f0f0f" }}>
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Image
                src="https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos/hyponova-logo-white.png"
                alt="HYPONOVA"
                width={308}
                height={84}
                loading="lazy"
                className="h-12 lg:h-14 w-auto"
              />
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: "#b8b8b8" }}>
              {tagline[lang]}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: "#b8b8b8" }}>
              {servicesHeading[lang]}
            </h3>
            <ul className="space-y-3">
              {serviceLinks[lang].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: "#c5c5c5" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: "#b8b8b8" }}>
              {infoHeading[lang]}
            </h3>
            <ul className="space-y-3">
              {infoLinks[lang].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: "#c5c5c5" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Address */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: "#b8b8b8" }}>
              {legalHeading[lang]}
            </h3>
            <ul className="space-y-3">
              {legalLinks[lang].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: "#c5c5c5" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-[13px] leading-relaxed" style={{ color: "#b8b8b8" }}>
              <p><BrandText>{t.footer.company}</BrandText></p>
              <p>Dahlienweg 22</p>
              <p>4313 Möhlin, {country[lang]}</p>
              <p className="mt-3">
                <a href="tel:+41791307000" className="transition-colors duration-200 hover:text-white" style={{ color: "#c5c5c5" }}>
                  +41 79 130 70 00
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #222" }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px]" style={{ color: "#a3a3a3" }}>
            <BrandText>{copyright}</BrandText>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/datenschutz" className="text-[12px] transition-colors duration-200 hover:text-white" style={{ color: "#a3a3a3" }}>
              {t.footer.privacy}
            </Link>
            <Link href="/impressum" className="text-[12px] transition-colors duration-200 hover:text-white" style={{ color: "#a3a3a3" }}>
              {t.footer.imprint}
            </Link>
            <a
              href="https://www.orionlab.ch"
              target="_blank"
              rel="noopener"
              title={creditTitle[lang]}
              className="text-[12px] transition-colors duration-200 hover:text-white"
              style={{ color: "#a3a3a3" }}
            >
              {credit[lang]}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
