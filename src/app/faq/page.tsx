import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
  title: "FAQ – HYPONOVA",
  description: "Häufig gestellte Fragen zu Hypotheken, Tragbarkeit und unserer Beratung.",
};

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Häufig gestellte Fragen</h1>
            <p className="text-lg text-[var(--color-text-muted)]">
              Antworten auf die wichtigsten Fragen rund um Hypotheken.
            </p>
          </div>

          {/* TODO: Accordion FAQ component */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center text-[var(--color-text-muted)]">
            <p>FAQ-Akkordeon wird hier implementiert</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
