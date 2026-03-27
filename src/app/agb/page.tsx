import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "AGB – HYPONOVA",
  description: "Allgemeine Geschäftsbedingungen der HYPONOVA GmbH.",
};

export default function AGBPage() {
  return (
    <>
      <Header />
      <main className="py-12 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
            Rechtliches
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-12" style={{ fontWeight: 300, color: "#1a1a1a" }}>
            Allgemeine <span style={{ fontWeight: 600 }}>Geschäftsbedingungen</span>
          </h1>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: "#444" }}>
            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>1. Geltungsbereich</h2>
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Dienstleistungen der HYPONOVA GmbH, Dahlienweg 22, 4313 Möhlin, Schweiz (nachfolgend «HYPONOVA»). Mit der Nutzung unserer Website oder der Inanspruchnahme unserer Dienstleistungen erklären Sie sich mit diesen AGB einverstanden.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>2. Dienstleistungen</h2>
              <p>
                HYPONOVA erbringt Vermittlungsdienstleistungen im Bereich der Hypothekarfinanzierung. Wir vergleichen die Angebote verschiedener Banken, Versicherungen und Pensionskassen und unterstützen Kundinnen und Kunden bei der Auswahl und dem Abschluss einer Hypothek.
              </p>
              <p className="mt-3">
                HYPONOVA ist kein Finanzinstitut und vergibt keine Kredite. Sämtliche Kreditentscheide liegen bei den jeweiligen Finanzierungspartnern. HYPONOVA übernimmt keine Garantie für die Gewährung einer Finanzierung.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>3. Kostenfreiheit für Kundinnen und Kunden</h2>
              <p>
                Die Beratung und der Vermittlungsprozess sind für Kundinnen und Kunden kostenlos. HYPONOVA wird im Falle eines erfolgreichen Abschlusses direkt vom jeweiligen Kreditgeber entschädigt. Sollte es zu keinem Abschluss kommen, entstehen Ihnen keinerlei Kosten.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>4. Pflichten der Kundinnen und Kunden</h2>
              <p>
                Kundinnen und Kunden sind verpflichtet, wahrheitsgemässe und vollständige Angaben zu machen. HYPONOVA übernimmt keine Haftung für Nachteile, die aufgrund unzutreffender oder unvollständiger Angaben entstehen.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>5. Haftungsausschluss</h2>
              <p>
                HYPONOVA bemüht sich um korrekte und aktuelle Informationen auf der Website und im Beratungsprozess. Eine Garantie für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen wird jedoch nicht übernommen.
              </p>
              <p className="mt-3">
                Die Haftung von HYPONOVA für leichte Fahrlässigkeit ist — soweit gesetzlich zulässig — ausgeschlossen. Dies gilt insbesondere für indirekte Schäden, Folgeschäden und entgangenen Gewinn.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>6. Datenschutz</h2>
              <p>
                Der Schutz Ihrer persönlichen Daten ist uns wichtig. Einzelheiten zur Erhebung, Verarbeitung und Nutzung Ihrer Daten entnehmen Sie bitte unserer{" "}
                <Link href="/datenschutz" className="underline hover:text-[#c8553d] transition-colors">
                  Datenschutzerklärung
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>7. Geistiges Eigentum</h2>
              <p>
                Sämtliche Inhalte der Website (Texte, Grafiken, Logos, Bilder) sind urheberrechtlich geschützt und Eigentum von HYPONOVA oder der jeweiligen Rechteinhaber. Eine Vervielfältigung, Verbreitung oder sonstige Nutzung ohne schriftliche Genehmigung ist nicht gestattet.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>8. Änderungen der AGB</h2>
              <p>
                HYPONOVA behält sich vor, diese AGB jederzeit zu ändern. Die jeweils aktuelle Fassung ist auf der Website einsehbar. Durch die weitere Nutzung unserer Dienstleistungen nach einer Änderung erklären Sie sich mit den angepassten AGB einverstanden.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>9. Anwendbares Recht und Gerichtsstand</h2>
              <p>
                Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist Möhlin (AG), Schweiz, sofern nicht zwingende gesetzliche Bestimmungen einen anderen Gerichtsstand vorsehen.
              </p>
            </section>

            <section className="pt-6" style={{ borderTop: "1px solid #e5e5e5" }}>
              <p style={{ color: "#999" }}>
                Stand: März 2026
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
