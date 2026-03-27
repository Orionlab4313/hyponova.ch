import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Datenschutz – HYPONOVA",
  description: "Datenschutzerklärung der HYPONOVA GmbH gemäss dem Schweizer Datenschutzgesetz (nDSG).",
};

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="py-12 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10">
          <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
            Rechtliches
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-12" style={{ fontWeight: 300, color: "#1a1a1a" }}>
            Datenschutz<span style={{ fontWeight: 600 }}>erklärung</span>
          </h1>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: "#444" }}>
            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>1. Verantwortliche Stelle</h2>
              <p>
                Verantwortlich für die Datenbearbeitung ist:
              </p>
              <p className="mt-3">
                <strong>HYPONOVA GmbH</strong><br />
                Dahlienweg 22<br />
                4313 Möhlin<br />
                Schweiz<br />
                E-Mail: info@hyponova.ch<br />
                Telefon: +41 79 249 70 90
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>2. Grundsätze</h2>
              <p>
                Wir bearbeiten Personendaten im Einklang mit dem Schweizer Bundesgesetz über den Datenschutz (nDSG) und, soweit anwendbar, der Europäischen Datenschutz-Grundverordnung (DSGVO). Wir erheben nur diejenigen Daten, die für die Erbringung unserer Dienstleistungen erforderlich sind.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>3. Erhobene Personendaten</h2>
              <p>Wir können folgende Personendaten erheben:</p>
              <ul className="list-disc ml-5 mt-3 space-y-1">
                <li>Kontaktdaten (Name, E-Mail, Telefonnummer, Adresse)</li>
                <li>Finanzielle Angaben (Einkommen, Eigenmittel, bestehende Hypotheken)</li>
                <li>Angaben zur Liegenschaft (Adresse, Kaufpreis, Verkehrswert)</li>
                <li>Dokumente (Lohnausweise, Steuererklärungen, Pensionskassenausweise)</li>
                <li>Technische Daten (IP-Adresse, Browser, Betriebssystem, Zugriffszeit)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>4. Zweck der Datenbearbeitung</h2>
              <p>Wir verwenden Ihre Daten für folgende Zwecke:</p>
              <ul className="list-disc ml-5 mt-3 space-y-1">
                <li>Erbringung unserer Vermittlungsdienstleistungen</li>
                <li>Einholung von Hypothekarangeboten bei unseren Partnerinstituten</li>
                <li>Kommunikation mit Ihnen (E-Mail, Telefon, Videocall)</li>
                <li>Verbesserung unserer Website und Dienstleistungen</li>
                <li>Erfüllung gesetzlicher Pflichten</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>5. Weitergabe an Dritte</h2>
              <p>
                Wir geben Ihre Personendaten nur an Dritte weiter, wenn dies zur Erbringung unserer Dienstleistungen erforderlich ist — insbesondere an Partnerbanken, Versicherungen und Pensionskassen im Rahmen der Offerteinholung. Eine Weitergabe erfolgt nur mit Ihrer Einwilligung oder auf gesetzlicher Grundlage.
              </p>
              <p className="mt-3">
                Wir verkaufen Ihre Daten nicht an Dritte und nutzen sie nicht für Werbezwecke Dritter.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>6. Cookies und Tracking</h2>
              <p>
                Unsere Website kann Cookies verwenden, um die Benutzererfahrung zu verbessern. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Sie können die Verwendung von Cookies in Ihren Browser-Einstellungen einschränken oder deaktivieren.
              </p>
              <p className="mt-3">
                Wir setzen derzeit keine Analyse- oder Tracking-Tools von Drittanbietern ein. Sollte sich dies ändern, werden wir Sie an dieser Stelle darüber informieren.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>7. Datensicherheit</h2>
              <p>
                Wir treffen angemessene technische und organisatorische Massnahmen, um Ihre Personendaten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen. Die Datenübertragung erfolgt verschlüsselt (SSL/TLS).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>8. Aufbewahrungsdauer</h2>
              <p>
                Wir bewahren Ihre Personendaten nur so lange auf, wie es für die Erfüllung des jeweiligen Zwecks erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Danach werden die Daten gelöscht oder anonymisiert.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>9. Ihre Rechte</h2>
              <p>
                Sie haben jederzeit das Recht auf:
              </p>
              <ul className="list-disc ml-5 mt-3 space-y-1">
                <li>Auskunft über die bei uns gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten (soweit keine gesetzliche Aufbewahrungspflicht besteht)</li>
                <li>Einschränkung der Bearbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerruf einer erteilten Einwilligung</li>
              </ul>
              <p className="mt-3">
                Um Ihre Rechte auszuüben, kontaktieren Sie uns bitte unter info@hyponova.ch.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: "#1a1a1a" }}>10. Änderungen</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen. Die aktuelle Fassung ist auf unserer Website einsehbar.
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
