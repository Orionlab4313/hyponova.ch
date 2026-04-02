"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Accordion from "@/components/ui/Accordion";
import CalculatorInput from "./CalculatorInput";
import DonutChart from "./DonutChart";
import CostBreakdown from "./CostBreakdown";
import {
  calculateMortgage,
  calculateLTV,
  calculateSecondMortgage,
  calculateAffordability,
  calculateIndicativeInterest,
  calculateAmortization,
  calculateMaintenance,
  calculateMinEquity,
  calculateMinIncome,
  formatCHF,
} from "./mortgage-utils";

const infoItems = [
  {
    question: "Was ist die Tragbarkeit?",
    answer: "Die Tragbarkeit zeigt, ob Sie sich die Immobilie langfristig leisten können. Sie wird berechnet, indem die jährlichen Wohnkosten (kalkulatorische Zinsen mit 5%, Amortisation und Unterhalt) ins Verhältnis zu Ihrem Bruttoeinkommen gesetzt werden. Die Faustregel: Die Wohnkosten sollten nicht mehr als 33% des Bruttoeinkommens ausmachen.",
  },
  {
    question: "Was ist die Belehnung?",
    answer: "Die Belehnung (Loan-to-Value) beschreibt das Verhältnis zwischen der Hypothek und dem Kaufpreis der Liegenschaft. In der Schweiz beträgt die maximale Belehnung 80%. Das bedeutet: Mindestens 20% des Kaufpreises müssen Sie als Eigenmittel einbringen — davon mindestens 10% aus harten Eigenmitteln (nicht aus der Pensionskasse).",
  },
  {
    question: "Wie wird die Amortisation berechnet?",
    answer: "Die 2. Hypothek (alles über 65% Belehnung) muss innert 15 Jahren amortisiert werden. Das bedeutet: Sie zahlen diesen Teil in gleichmässigen Raten zurück, bis die Belehnung auf 65% sinkt. Die 1. Hypothek (bis 65%) muss in der Regel nicht amortisiert werden.",
  },
  {
    question: "Warum wird mit 5% kalkulatorischem Zins gerechnet?",
    answer: "Banken in der Schweiz rechnen für die Tragbarkeit nicht mit dem aktuellen Zinssatz, sondern mit einem kalkulatorischen Zins von 5%. Damit wird sichergestellt, dass Sie sich die Hypothek auch bei steigenden Zinsen leisten können. Die effektiven monatlichen Kosten sind in der Regel deutlich tiefer.",
  },
];

export default function MortgageCalculator() {
  const [kaufpreis, setKaufpreis] = useState(1_000_000);
  const [eigenmittel, setEigenmittel] = useState(200_000);
  const [einkommen, setEinkommen] = useState(180_000);

  // Derived values
  const mortgage = calculateMortgage(kaufpreis, eigenmittel);
  const ltv = calculateLTV(kaufpreis, eigenmittel);
  const secondMortgage = calculateSecondMortgage(kaufpreis, mortgage);
  const affordability = calculateAffordability(kaufpreis, mortgage, einkommen);

  // Monthly costs (indicative rate)
  const monthlyInterest = calculateIndicativeInterest(mortgage);
  const monthlyAmortization = calculateAmortization(secondMortgage);
  const monthlyMaintenance = calculateMaintenance(kaufpreis);
  const totalMonthly = monthlyInterest + monthlyAmortization + monthlyMaintenance;

  // Dynamic hints
  const minEquity = calculateMinEquity(kaufpreis);
  const minIncome = calculateMinIncome(kaufpreis, mortgage);

  // Status colors
  const ltvColor = ltv <= 80 ? "#4ade80" : "#ef4444";
  const ltvStatus = ltv <= 80 ? "Belehnung OK" : "Belehnung zu hoch";

  const affordColor = affordability <= 33 ? "#4ade80" : affordability <= 38 ? "#f59e0b" : "#ef4444";
  const affordStatus = affordability <= 33 ? "Tragbar" : affordability <= 38 ? "Prüfbar" : "Nicht tragbar";

  // Handlers with clamping
  const handleKaufpreisChange = (val: number) => {
    setKaufpreis(val);
    if (eigenmittel > val) setEigenmittel(val);
  };

  const handleEigenmittelChange = (val: number) => {
    setEigenmittel(Math.min(val, kaufpreis));
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-12 lg:pb-16">
          <ScrollReveal>
            <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
              Hypothekenrechner
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
              Berechnen Sie Ihre <span style={{ fontWeight: 600 }}>Tragbarkeit.</span>
            </h1>
            <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
              Prüfen Sie in Echtzeit, ob Ihre Wunschimmobilie finanzierbar ist.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left: Inputs */}
              <div>
                <CalculatorInput
                  label="Kaufpreis"
                  value={kaufpreis}
                  onChange={handleKaufpreisChange}
                  min={100_000}
                  max={5_000_000}
                  step={10_000}
                />
                <CalculatorInput
                  label="Eigenmittel"
                  value={eigenmittel}
                  onChange={handleEigenmittelChange}
                  min={0}
                  max={kaufpreis}
                  step={10_000}
                  hintLabel="Min. Eigenmittel"
                  hintValue={formatCHF(Math.round(minEquity))}
                />
                <CalculatorInput
                  label="Jährliches Einkommen"
                  value={einkommen}
                  onChange={setEinkommen}
                  min={0}
                  max={1_000_000}
                  step={5_000}
                  hintLabel="Min. Einkommen"
                  hintValue={formatCHF(Math.round(minIncome))}
                />
              </div>

              {/* Right: Results */}
              <div>
                {/* Donut Charts */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <DonutChart
                    percentage={Math.round(ltv * 10) / 10}
                    color={ltvColor}
                    label="Belehnung"
                    statusText={ltvStatus}
                  />
                  <DonutChart
                    percentage={Math.round(affordability * 10) / 10}
                    color={affordColor}
                    label="Tragbarkeit"
                    statusText={affordStatus}
                  />
                </div>

                {/* Cost Breakdown */}
                <CostBreakdown
                  interestCost={monthlyInterest}
                  amortization={monthlyAmortization}
                  maintenance={monthlyMaintenance}
                  total={totalMonthly}
                  hypothek={mortgage}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Info Section */}
      <section className="pb-24 lg:pb-32" style={{ backgroundColor: "#f5f5f3" }}>
        <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl mb-10" style={{ fontWeight: 300, color: "#1a1a1a" }}>
              Gut zu <span style={{ fontWeight: 600 }}>wissen.</span>
            </h2>
            <div style={{ borderTop: "1px solid #ddd" }}>
              <Accordion items={infoItems} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 text-white" style={{ backgroundColor: "#000" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl leading-[1.15] mb-6" style={{ fontWeight: 300 }}>
              Passt die <span style={{ fontWeight: 600 }}>Finanzierung?</span>
            </h2>
            <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
              Lassen Sie sich kostenlos und unverbindlich beraten. Wir holen die besten Angebote für Sie ein.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/termin"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                style={{ backgroundColor: "#fff", color: "#000" }}
              >
                Beratung buchen
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors hover:bg-white/10"
                style={{ border: "1px solid #fff", color: "#fff" }}
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
