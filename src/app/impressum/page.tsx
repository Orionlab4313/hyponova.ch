import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Impressum – HYPONOVA" };

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose">
          <h1>Impressum</h1>
          <p><strong>HYPONOVA GmbH</strong></p>
          <p>Dahlienweg 22<br />4313 Möhlin<br />Schweiz</p>
          {/* TODO: Add full legal details from client */}
        </div>
      </main>
      <Footer />
    </>
  );
}
