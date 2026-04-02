"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
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

export default function MortgageCalculator() {
  const { t } = useI18n();
  const c = t.calculator;

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
  const ltvStatus = ltv <= 80 ? c.ltvOk : c.ltvHigh;

  const affordColor = affordability <= 33 ? "#4ade80" : affordability <= 38 ? "#f59e0b" : "#ef4444";
  const affordStatus = affordability <= 33 ? c.statusGood : affordability <= 38 ? c.statusWarning : c.statusBad;

  // Info items
  const infoItems = [
    { question: c.infoAffordabilityQ, answer: c.infoAffordabilityA },
    { question: c.infoLtvQ, answer: c.infoLtvA },
    { question: c.infoAmortizationQ, answer: c.infoAmortizationA },
    { question: c.infoImputedRateQ, answer: c.infoImputedRateA },
  ];

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
              {c.heroLabel}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
              {c.heroTitle} <span style={{ fontWeight: 600 }}>{c.heroTitleBold}</span>
            </h1>
            <p className="text-lg mt-4 max-w-2xl" style={{ color: "#6b6b6b" }}>
              {c.heroDesc}
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
                  label={c.propertyValue}
                  value={kaufpreis}
                  onChange={handleKaufpreisChange}
                  min={100_000}
                  max={5_000_000}
                  step={10_000}
                />
                <CalculatorInput
                  label={c.equity}
                  value={eigenmittel}
                  onChange={handleEigenmittelChange}
                  min={0}
                  max={kaufpreis}
                  step={10_000}
                  hintLabel={c.minEquity}
                  hintValue={formatCHF(Math.round(minEquity))}
                />
                <CalculatorInput
                  label={c.annualIncome}
                  value={einkommen}
                  onChange={setEinkommen}
                  min={0}
                  max={1_000_000}
                  step={5_000}
                  hintLabel={c.minIncome}
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
                    label={c.loanToValue}
                    statusText={ltvStatus}
                  />
                  <DonutChart
                    percentage={Math.round(affordability * 10) / 10}
                    color={affordColor}
                    label={c.affordability}
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
                  labels={{
                    monthlyCosts: c.monthlyCosts,
                    interest: c.interestLabel,
                    amortization: c.amortization,
                    maintenance: c.maintenanceLabel,
                    total: c.totalLabel,
                    hypothek: c.hypothekLabel,
                    requestOffer: c.requestOffer,
                  }}
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
              {c.infoTitle} <span style={{ fontWeight: 600 }}>{c.infoTitleBold}</span>
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
              {c.ctaTitle} <span style={{ fontWeight: 600 }}>{c.ctaTitleBold}</span>
            </h2>
            <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: "#888" }}>
              {c.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/termin"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors"
                style={{ backgroundColor: "#fff", color: "#000" }}
              >
                {c.ctaBooking}
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors hover:bg-white/10"
                style={{ border: "1px solid #fff", color: "#fff" }}
              >
                {c.ctaContact}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
