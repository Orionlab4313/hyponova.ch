"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MortgageCalculator from "@/components/calculator/MortgageCalculator";

export default function RechnerPage() {
  return (
    <>
      <Header />
      <main>
        <MortgageCalculator />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
