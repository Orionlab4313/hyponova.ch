"use client";

const SUPABASE_URL = "https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos";

const partners = [
  { name: "Aargauische Kantonalbank", src: `${SUPABASE_URL}/akb.jpg` },
  { name: "Thurgauer Kantonalbank", src: `${SUPABASE_URL}/tkb.png` },
  { name: "Vaudoise", src: `${SUPABASE_URL}/vaudoise.jpg` },
  { name: "die Mobiliar", src: `${SUPABASE_URL}/mobiliar.jpg` },
  { name: "Migros Bank", src: `${SUPABASE_URL}/migros-bank.png` },
  { name: "UBS", src: `${SUPABASE_URL}/ubs.webp` },
  { name: "Bank Cler", src: `${SUPABASE_URL}/cler.jpg` },
  { name: "Raiffeisen", src: `${SUPABASE_URL}/raiffeisen.webp` },
  { name: "Basler Kantonalbank", src: `${SUPABASE_URL}/bkb.png` },
];

export default function LogoMarquee() {
  // Duplicate the list for seamless infinite scroll
  const logos = [...partners, ...partners];

  return (
    <section className="py-10 overflow-hidden" style={{ borderBottom: "1px solid #e5e5e5" }}>
      <p className="text-center text-lg uppercase tracking-[0.2em] font-semibold mb-10" style={{ color: "#6b6b6b" }}>
        Unsere Partner
      </p>
      <div className="relative">
        <div
          className="flex items-center gap-16 animate-marquee"
          style={{
            width: "max-content",
          }}
        >
          {logos.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 h-16 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300"
              style={{ minWidth: "180px" }}
            >
              <img
                src={partner.src}
                alt={partner.name}
                className="h-12 lg:h-14 w-auto max-w-[180px] object-contain"
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
