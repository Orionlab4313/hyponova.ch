import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#0f0f0f" }}>
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <img
                src="https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos/hyponova-logo.png"
                alt="HYPONOVA"
                className="h-16 lg:h-20 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: "#888" }}>
              Ihr unabhängiger Hypothekenpartner in der Schweiz. Effizient, transparent und vollständig unabhängig.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: "#666" }}>
              Dienstleistungen
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/dienstleistungen", label: "Eigenheim kaufen" },
                { href: "/dienstleistungen", label: "Hypothek ablösen" },
                { href: "/rechner", label: "Hypothekenrechner" },
                { href: "/termin", label: "Beratung buchen" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: "#aaa" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: "#666" }}>
              Information
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/ueber-uns", label: "Über HYPONOVA" },
                { href: "/faq", label: "Häufige Fragen" },
                { href: "/kontakt", label: "Kontakt" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: "#aaa" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Address */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: "#666" }}>
              Rechtliches
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/datenschutz", label: "Datenschutzerklärung" },
                { href: "/agb", label: "AGB" },
                { href: "/impressum", label: "Impressum" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: "#aaa" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-[13px] leading-relaxed" style={{ color: "#666" }}>
              <p>HYPONOVA GmbH</p>
              <p>Dahlienweg 22</p>
              <p>4313 Möhlin, Schweiz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #222" }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px]" style={{ color: "#555" }}>
            © {year} HYPONOVA GmbH. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/datenschutz" className="text-[12px] transition-colors duration-200 hover:text-white" style={{ color: "#555" }}>
              Datenschutz
            </Link>
            <Link href="/impressum" className="text-[12px] transition-colors duration-200 hover:text-white" style={{ color: "#555" }}>
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
