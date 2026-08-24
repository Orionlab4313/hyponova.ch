"use client";

import { useI18n } from "@/i18n/context";

// Lokal aus public/images/banken/ serviert (same-origin, kein Adblocker-Block).
// 20 Partner-Banken/Versicherungen/Pensionskassen von Simon, schriftliche Logo-Bewilligung vorhanden.
// Berner Kantonalbank (BEKB) am 08.07.2026 auf deren Verlangen entfernt, nicht wieder aufnehmen
// ohne neue schriftliche Freigabe von der BEKB.
// 24.08.2026: 6 neue Partner ergaenzt (Swiss Life, Suva, Pax, PK Stadt Winterthur, LLB, Glarner KB).
const partners = [
  { name: "Acrevis Bank", src: "/images/banken/acrevis.svg" },
  { name: "AXA Versicherung", src: "/images/banken/axa.svg" },
  { name: "Baloise Bank SoBa", src: "/images/banken/baloise.svg" },
  { name: "Bank EKI", src: "/images/banken/bank-eki.svg" },
  { name: "Bank SLM", src: "/images/banken/bank-slm.svg" },
  { name: "Bank Thalwil", src: "/images/banken/bank-thalwil.svg" },
  { name: "Banque Cantonale Neuchâteloise", src: "/images/banken/bcn.svg" },
  { name: "Basler Kantonalbank", src: "/images/banken/bkb.svg" },
  { name: "Bernerland Bank", src: "/images/banken/bernerland.svg" },
  { name: "Clientis Sparcassa 1816", src: "/images/banken/clientis-sparcassa.svg" },
  { name: "Glarner Kantonalbank", src: "/images/banken/glkb.svg" },
  { name: "Graubündner Kantonalbank", src: "/images/banken/gkb.svg" },
  { name: "Liechtensteinische Landesbank (LLB Schweiz)", src: "/images/banken/llb.svg" },
  { name: "Pax Versicherungen", src: "/images/banken/pax.svg" },
  { name: "Pensionskasse Stadt Winterthur", src: "/images/banken/pksw.svg" },
  { name: "Raiffeisen", src: "/images/banken/raiffeisen.svg" },
  { name: "St. Galler Kantonalbank", src: "/images/banken/sgkb.svg" },
  { name: "Suva", src: "/images/banken/suva.svg" },
  { name: "Swiss Life", src: "/images/banken/swisslife.svg" },
  { name: "Thurgauer Kantonalbank", src: "/images/banken/tkb.svg" },
];

export default function LogoMarquee() {
  const { lang } = useI18n();
  // Duplicate the list for seamless infinite scroll
  const logos = [...partners, ...partners];

  return (
    <section className="py-10 overflow-hidden" style={{ borderBottom: "1px solid #e5e5e5" }}>
      <p
        className="text-center text-sm sm:text-lg uppercase tracking-[0.12em] sm:tracking-[0.2em] font-semibold mb-10 px-4"
        style={{ color: "#6b6b6b" }}
      >
        {lang === "en" ? "A selection of our partners:" : "Eine Auswahl unserer Partner:"}
      </p>
      <div className="relative">
        <div
          className="flex items-center animate-marquee"
          style={{
            width: "max-content",
            gap: "72px",
          }}
        >
          {logos.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300"
              style={{ width: "200px", height: "80px" }}
            >
              <img
                src={partner.src}
                alt={lang === "en" ? `${partner.name}, HYPONOVA partner` : `${partner.name}, Partner von HYPONOVA`}
                className="object-contain"
                style={{ maxHeight: "48px", maxWidth: "170px", width: "auto", height: "auto" }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 43s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
