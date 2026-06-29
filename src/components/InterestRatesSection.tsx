"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/context";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface InterestRates {
  saron_marge: number | null;
  fixed_5y: number | null;
  fixed_7y: number | null;
  fixed_10y: number | null;
  updated_at: string | null;
}

const COPY = {
  de: {
    label: "Konditionen",
    heading: { before: "Unsere ", bold: "tagesaktuellen Zinssätze." },
    items: {
      saron: "SARON Marge",
      f5: "5 Jahre Festhypothek",
      f7: "7 Jahre Festhypothek",
      f10: "10 Jahre Festhypothek",
    },
    fromLabel: "ab",
    disclaimer: "Es handelt sich bei den angezeigten Zinsen um Richtzinsen der Kapitalgeber. Je nach Hypothekarhöhe, Belehnungshöhe, Tragbarkeit oder Region können Zu-/Abschläge angewendet werden.",
    standLabel: "Stand",
  },
  en: {
    label: "Rates",
    heading: { before: "Our ", bold: "current interest rates." },
    items: {
      saron: "SARON margin",
      f5: "5-year fixed-rate mortgage",
      f7: "7-year fixed-rate mortgage",
      f10: "10-year fixed-rate mortgage",
    },
    fromLabel: "from",
    disclaimer: "The rates shown are reference rates from the lenders. Depending on the mortgage amount, loan-to-value, affordability or region, premiums or discounts may apply.",
    standLabel: "As of",
  },
} as const;

function formatRate(n: number | null): string {
  if (n === null || n === undefined) return "";
  return n.toFixed(2).replace(".", ",");
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function InterestRatesSection() {
  const { lang } = useI18n();
  const [data, setData] = useState<InterestRates | null | undefined>(undefined);
  const t = COPY[lang];

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/interest-rates")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (data === undefined) return null;
  if (!data) return null;
  const items = [
    { key: "saron", label: t.items.saron, value: data.saron_marge },
    { key: "f5", label: t.items.f5, value: data.fixed_5y },
    { key: "f7", label: t.items.f7, value: data.fixed_7y },
    { key: "f10", label: t.items.f10, value: data.fixed_10y },
  ].filter((i) => i.value !== null && i.value !== undefined);
  if (items.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: "#f7f5f2" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <ScrollReveal>
          <p className="text-sm uppercase tracking-[0.15em] font-medium mb-4" style={{ color: "#6b6b6b" }}>
            {t.label}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.15] mb-12 max-w-3xl" style={{ fontWeight: 300, color: "#1a1a1a" }}>
            {t.heading.before}<span style={{ fontWeight: 600 }}>{t.heading.bold}</span>
          </h2>
        </ScrollReveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
          className={`grid gap-6 ${items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
        >
          {items.map((item) => (
            <motion.div
              key={item.key}
              variants={{
                hidden: { opacity: 0, scaleY: 0.4 },
                visible: {
                  opacity: 1,
                  scaleY: 1,
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              style={{ transformOrigin: "center", transformPerspective: 800 }}
            >
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } }}
                className="relative bg-white p-6 lg:p-8 flex flex-col items-start cursor-default group h-full"
                style={{ border: "1px solid #e5e5e5", transition: "box-shadow 0.3s ease, border-color 0.3s ease" }}
              >
                {/* Akzent-Strich oben in Brand-Orange (animiert per CSS beim Hover) */}
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-[3px] bg-[#c8553d] transition-all duration-500 ease-out"
                  style={{ width: "0%" }}
                />
                <style jsx>{`
                  div.group:hover > span:first-child {
                    width: 100%;
                  }
                  div.group {
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
                  }
                  div.group:hover {
                    box-shadow: 0 12px 32px rgba(200, 85, 61, 0.12);
                    border-color: rgba(200, 85, 61, 0.35) !important;
                  }
                `}</style>

                <p className="text-sm font-semibold mb-6" style={{ color: "#6b6b6b" }}>{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm" style={{ color: "#6b6b6b" }}>{t.fromLabel}</span>
                  <span
                    className="text-4xl lg:text-5xl"
                    style={{ fontWeight: 600, color: "#c8553d", lineHeight: 1 }}
                  >
                    {formatRate(item.value)}
                  </span>
                  <span className="text-2xl lg:text-3xl" style={{ fontWeight: 500, color: "#c8553d" }}>%</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <ScrollReveal delay={0.2}>
          <p className="text-xs leading-relaxed mt-10 max-w-3xl" style={{ color: "#6b6b6b" }}>
            {t.disclaimer}
            {data.updated_at && (
              <>
                {" "}<span style={{ fontWeight: 600, color: "#444" }}>{t.standLabel}: {formatDate(data.updated_at)}</span>.
              </>
            )}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
