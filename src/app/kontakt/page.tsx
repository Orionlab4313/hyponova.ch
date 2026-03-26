import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
  title: "Kontakt – HYPONOVA",
  description: "Kontaktieren Sie HYPONOVA für Ihre Hypothekenberatung. Kostenlos und unverbindlich.",
};

export default function KontaktPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Kontakt</h1>
            <p className="text-lg text-[var(--color-text-muted)]">
              Haben Sie Fragen? Kontaktieren Sie uns.
            </p>
          </div>

          {/* TODO: Contact form with file upload */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-white text-center text-[var(--color-text-muted)]">
            <p>Kontaktformular wird hier implementiert</p>
            <p className="text-sm mt-2">(Mit Datei-Upload für Dokumente)</p>
          </div>

          <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            <p className="font-medium text-[var(--color-text)]">HYPONOVA GmbH</p>
            <p>Dahlienweg 22</p>
            <p>4313 Möhlin</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
