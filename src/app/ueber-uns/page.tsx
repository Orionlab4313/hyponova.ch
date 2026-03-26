import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
  title: "Über uns – HYPONOVA",
  description: "Lernen Sie HYPONOVA kennen – Ihr unabhängiger Hypothekenpartner in der Schweiz.",
};

export default function UeberUnsPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Über uns</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
              Ihr unabhängiger Hypothekenpartner in der Schweiz.
            </p>
          </div>

          {/* TODO: Team section, USPs, company story */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center text-[var(--color-text-muted)]">
            <p>Team-Vorstellung und Firmengeschichte wird hier implementiert</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
