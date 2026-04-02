import { formatCHF, INDICATIVE_RATE } from "./mortgage-utils";
import Link from "next/link";

interface CostBreakdownProps {
  interestCost: number;
  amortization: number;
  maintenance: number;
  total: number;
  hypothek: number;
}

export default function CostBreakdown({
  interestCost,
  amortization,
  maintenance,
  total,
  hypothek,
}: CostBreakdownProps) {
  const rateDisplay = (INDICATIVE_RATE * 100).toFixed(2);

  return (
    <div>
      <h3 className="text-base font-semibold mb-6" style={{ color: "#1a1a1a" }}>
        Gesamtkosten pro Monat
      </h3>

      <div className="space-y-0">
        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span className="text-sm" style={{ color: "#6b6b6b" }}>
            Zinskosten ({rateDisplay}%)
          </span>
          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(interestCost))}
          </span>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span className="text-sm" style={{ color: "#6b6b6b" }}>
            Amortisation
          </span>
          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(amortization))}
          </span>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span className="text-sm" style={{ color: "#6b6b6b" }}>
            Unterhaltskosten
          </span>
          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(maintenance))}
          </span>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderTop: "2px solid #1a1a1a" }}>
          <span className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
            Total
          </span>
          <span className="text-base font-bold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(total))}
          </span>
        </div>
      </div>

      <p className="text-[13px] mt-4 mb-6" style={{ color: "#6b6b6b" }}>
        Hypothek: {formatCHF(Math.round(hypothek))}
      </p>

      <Link
        href="/kontakt"
        className="inline-flex items-center px-7 py-3.5 text-sm font-medium transition-colors"
        style={{ backgroundColor: "#c8553d", color: "#fff" }}
      >
        Offerte anfragen
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
