// Schweizer Hypothekenrechner — Berechnungslogik

// Konstanten
export const IMPUTED_RATE = 0.05;         // 5% kalkulatorischer Zins (Tragbarkeit)
export const INDICATIVE_RATE = 0.016;     // 1.60% indikativer Zins (Kostenanzeige)
export const MAINTENANCE_RATE = 0.01;     // 1% Unterhaltskosten
export const AMORTIZATION_YEARS = 15;     // 2. Hypothek innert 15 Jahren amortisieren
export const MAX_LTV = 0.80;             // 80% max. Belehnung
export const FIRST_MORTGAGE_LIMIT = 0.65; // 65% 1. Hypothek
export const SECOND_MORTGAGE_LIMIT = 0.15;// 15% 2. Hypothek
export const AFFORDABILITY_LIMIT = 0.33;  // 33% Tragbarkeitsgrenze

// Hypothek
export function calculateMortgage(kaufpreis: number, eigenmittel: number): number {
  return Math.max(0, kaufpreis - eigenmittel);
}

// Belehnung (LTV) in %
export function calculateLTV(kaufpreis: number, eigenmittel: number): number {
  if (kaufpreis <= 0) return 0;
  return (calculateMortgage(kaufpreis, eigenmittel) / kaufpreis) * 100;
}

// 1. Hypothek
export function calculateFirstMortgage(kaufpreis: number, mortgage: number): number {
  return Math.min(kaufpreis * FIRST_MORTGAGE_LIMIT, mortgage);
}

// 2. Hypothek
export function calculateSecondMortgage(kaufpreis: number, mortgage: number): number {
  const first = calculateFirstMortgage(kaufpreis, mortgage);
  return Math.max(0, mortgage - first);
}

// Kalkulatorische Zinsen (5%) — monatlich
export function calculateImputedInterest(mortgage: number): number {
  return (IMPUTED_RATE * mortgage) / 12;
}

// Indikative Zinsen (1.60%) — monatlich
export function calculateIndicativeInterest(mortgage: number): number {
  return (INDICATIVE_RATE * mortgage) / 12;
}

// Unterhaltskosten — monatlich
export function calculateMaintenance(kaufpreis: number): number {
  return (MAINTENANCE_RATE * kaufpreis) / 12;
}

// Amortisation 2. Hypothek — monatlich
export function calculateAmortization(secondMortgage: number): number {
  if (secondMortgage <= 0) return 0;
  return secondMortgage / AMORTIZATION_YEARS / 12;
}

// Tragbarkeit in % (mit kalkulatorischem 5% Zins)
export function calculateAffordability(kaufpreis: number, mortgage: number, income: number): number {
  if (income <= 0) return 999;
  const secondMortgage = calculateSecondMortgage(kaufpreis, mortgage);
  const yearlyImputedInterest = IMPUTED_RATE * mortgage;
  const yearlyMaintenance = MAINTENANCE_RATE * kaufpreis;
  const yearlyAmortization = secondMortgage > 0 ? secondMortgage / AMORTIZATION_YEARS : 0;
  const totalYearly = yearlyImputedInterest + yearlyMaintenance + yearlyAmortization;
  return (totalYearly / income) * 100;
}

// Dynamische Hints
export function calculateMinEquity(kaufpreis: number): number {
  return kaufpreis * (1 - MAX_LTV);
}

export function calculateMinIncome(kaufpreis: number, mortgage: number): number {
  const secondMortgage = calculateSecondMortgage(kaufpreis, mortgage);
  const yearlyImputedInterest = IMPUTED_RATE * mortgage;
  const yearlyMaintenance = MAINTENANCE_RATE * kaufpreis;
  const yearlyAmortization = secondMortgage > 0 ? secondMortgage / AMORTIZATION_YEARS : 0;
  const totalYearly = yearlyImputedInterest + yearlyMaintenance + yearlyAmortization;
  return totalYearly / AFFORDABILITY_LIMIT;
}

export function calculateMaxKaufpreis(eigenmittel: number): number {
  return eigenmittel / (1 - MAX_LTV);
}

// Formatierung
export function formatCHF(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `CHF ${formatted}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
