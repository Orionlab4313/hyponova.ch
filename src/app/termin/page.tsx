import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
  title: "Termin buchen – HYPONOVA",
  description: "Buchen Sie Ihr kostenloses Onlinegespräch direkt auf der Plattform.",
};

export default function TerminPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Termin buchen</h1>
            <p className="text-lg text-[var(--color-text-muted)]">
              Buchen Sie Ihr kostenloses Onlinegespräch direkt auf der Plattform.
            </p>
          </div>

          {/* TODO: Cal.com embed */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center text-[var(--color-text-muted)]">
            <p>Cal.com Terminbuchung wird hier eingebettet</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
