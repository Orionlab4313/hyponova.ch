"use client";

import { useI18n } from "@/i18n/context";

// Lokal aus public/images/banken/ serviert (same-origin, kein Adblocker-Block).
// 13 Partner-Banken/Versicherungen von Simon, schriftliche Logo-Bewilligung vorhanden.
const partners = [
  { name: "Acrevis Bank", src: "/images/banken/acrevis.svg" },
  { name: "AXA Versicherung", src: "/images/banken/axa.svg" },
  { name: "Baloise Bank SoBa", src: "/images/banken/baloise.svg" },
  { name: "Bank EKI", src: "/images/banken/bank-eki.svg" },
  { name: "Bank SLM", src: "/images/banken/bank-slm.svg" },
  { name: "Bank Thalwil", src: "/images/banken/bank-thalwil.svg" },
  { name: "Banque Cantonale Neuchâteloise", src: "/images/banken/bcn.svg" },
  { name: "Berner Kantonalbank", src: "/images/banken/bekb.svg" },
  { name: "Bernerland Bank", src: "/images/banken/bernerland.svg" },
  { name: "Clientis Sparcassa 1816", src: "/images/banken/clientis-sparcassa.svg" },
  { name: "Graubündner Kantonalbank", src: "/images/banken/gkb.svg" },
  { name: "St. Galler Kantonalbank", src: "/images/banken/sgkb.svg" },
  { name: "Thurgauer Kantonalbank", src: "/images/banken/tkb.svg" },
  { name: "Raiffeisen", src: "/images/banken/raiffeisen.svg" },
  { name: "Basler Kantonalbank", src: "/images/banken/bkb.svg" },
];

export default function LogoMarquee() {
  const { lang } = useI18n();
  // Duplicate the list for seamless infinite scroll
  const logos = [...partners, ...partners];

  return (
    <section className="py-10 overflow-hidden" style={{ borderBottom: "1px solid #e5e5e5" }}>
      <p className="text-center text-lg uppercase tracking-[0.2em] font-semibold mb-10" style={{ color: "#6b6b6b" }}>
        {lang === "en" ? "Our Partners" : "Unsere Partner"}
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
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
