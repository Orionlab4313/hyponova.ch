import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
  title: "Dienstleistungen – HYPONOVA",
  description: "Hypothek aufnehmen, verlängern oder ablösen. HYPONOVA unterstützt Sie bei der Finanzierung Ihres Eigenheims.",
};

export default function DienstleistungenPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Unsere Dienstleistungen</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
              Wir sind spezialisiert in der Finanzierung von selbstbewohnten Eigenheimen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Neukauf */}
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-3">Eigenheim kaufen</h2>
              <p className="text-[var(--color-text-muted)] mb-6">
                Gerne unterstützen wir Sie bei Ihrem Liegenschaftskauf oder der Finanzierung eines Neubaus.
              </p>
              <a href="/dienstleistungen/neukauf" className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                Ich möchte ein Eigenheim kaufen
              </a>
            </div>

            {/* Ablösung */}
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-white hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-3">Hypothek ablösen</h2>
              <p className="text-[var(--color-text-muted)] mb-6">
                Jetzt Angebote einholen und von besseren Konditionen profitieren.
              </p>
              <a href="/dienstleistungen/abloesung" className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                Ich habe bereits eine Hypothek
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
