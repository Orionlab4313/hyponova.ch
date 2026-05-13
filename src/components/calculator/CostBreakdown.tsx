import { formatCHF, IMPUTED_RATE } from "./mortgage-utils";
import Link from "next/link";

interface CostBreakdownLabels {
  monthlyCosts: string;
  interest: string;
  amortization: string;
  maintenance: string;
  total: string;
  hypothek: string;
  requestOffer: string;
}

interface CostBreakdownProps {
  interestCost: number;
  amortization: number;
  maintenance: number;
  total: number;
  hypothek: number;
  labels: CostBreakdownLabels;
}

export default function CostBreakdown({
  interestCost,
  amortization,
  maintenance,
  total,
  hypothek,
  labels,
}: CostBreakdownProps) {
  const rateDisplay = (IMPUTED_RATE * 100).toFixed(2);

  return (
    <div>
      <h3 className="text-base font-semibold mb-6" style={{ color: "#1a1a1a" }}>
        {labels.monthlyCosts}
      </h3>

      <div className="space-y-0">
        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span className="text-sm" style={{ color: "#6b6b6b" }}>
            {labels.interest} ({rateDisplay}%)
          </span>
          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(interestCost))}
          </span>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span className="text-sm" style={{ color: "#6b6b6b" }}>
            {labels.amortization}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(amortization))}
          </span>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span className="text-sm" style={{ color: "#6b6b6b" }}>
            {labels.maintenance}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(maintenance))}
          </span>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderTop: "2px solid #1a1a1a" }}>
          <span className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
            {labels.total}
          </span>
          <span className="text-base font-bold" style={{ color: "#1a1a1a" }}>
            {formatCHF(Math.round(total))}
          </span>
        </div>
      </div>

      <p className="text-[13px] mt-4 mb-6" style={{ color: "#6b6b6b" }}>
        {labels.hypothek}: {formatCHF(Math.round(hypothek))}
      </p>

      <Link
        href="/kontakt"
        className="inline-flex items-center px-7 py-3.5 text-sm font-medium transition-colors"
        style={{ backgroundColor: "#c8553d", color: "#fff" }}
      >
        {labels.requestOffer}
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
