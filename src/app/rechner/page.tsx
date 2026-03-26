import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
  title: "Hypothekenrechner – HYPONOVA",
  description: "Berechnen Sie Ihre Belehnung und Tragbarkeit in Echtzeit. Kostenloser Hypothekenrechner für die Schweiz.",
};

export default function RechnerPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Hypothekenrechner</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
              Berechnen Sie Ihre Belehnung und Tragbarkeit in Echtzeit.
            </p>
          </div>

          {/* TODO: Calculator component */}
          <div className="max-w-4xl mx-auto p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center text-[var(--color-text-muted)]">
            <p>Hypothekenrechner wird hier implementiert</p>
            <p className="text-sm mt-2">(Belehnung + Tragbarkeit mit Donut-Charts)</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
