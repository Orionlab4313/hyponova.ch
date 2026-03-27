import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Impressum – HYPONOVA",
  description: "Impressum der HYPONOVA GmbH, Möhlin, Schweiz.",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="py-12 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
            Rechtliches
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-12" style={{ fontWeight: 300, color: "#1a1a1a" }}>
            <span style={{ fontWeight: 600 }}>Impressum</span>
          </h1>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: "#444" }}>
            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Firma</h2>
              <p>
                <strong>HYPONOVA GmbH</strong><br />
                Dahlienweg 22<br />
                4313 Möhlin<br />
                Schweiz
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Kontakt</h2>
              <p>
                E-Mail: info@hyponova.ch<br />
                Telefon: wird noch ergänzt
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Vertretungsberechtigte Person</h2>
              <p>
                Simon Topalli, Geschäftsführer
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Handelsregistereintrag</h2>
              <p>
                Eingetragen im Handelsregister des Kantons Aargau<br />
                UID: wird noch ergänzt
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Haftungsausschluss</h2>
              <p>
                Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. HYPONOVA übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen. Die Nutzung der Inhalte erfolgt auf eigene Verantwortung.
              </p>
              <p className="mt-3">
                Verweise und Links auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs. Eine Haftung für solche Websites wird abgelehnt. Der Zugang und die Nutzung solcher Websites erfolgt auf eigenes Risiko.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Urheberrecht</h2>
              <p>
                Die Inhalte und Werke auf dieser Website unterliegen dem Schweizer Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung von HYPONOVA.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>Rechtliches</h2>
              <p>
                <Link href="/agb" className="underline hover:text-[#c8553d] transition-colors">Allgemeine Geschäftsbedingungen</Link>
                <br />
                <Link href="/datenschutz" className="underline hover:text-[#c8553d] transition-colors">Datenschutzerklärung</Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
