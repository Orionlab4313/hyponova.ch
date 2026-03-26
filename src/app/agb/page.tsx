import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "AGB – HYPONOVA" };

export default function AGBPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose">
          <h1>Allgemeine Geschäftsbedingungen</h1>
          {/* TODO: Add AGB from client */}
          <p>Die AGB werden hier ergänzt.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
