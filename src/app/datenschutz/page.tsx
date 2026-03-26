import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Datenschutz – HYPONOVA" };

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose">
          <h1>Datenschutzerklärung</h1>
          {/* TODO: Add DSG/DSGVO compliant privacy policy */}
          <p>Die Datenschutzerklärung wird hier ergänzt.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
