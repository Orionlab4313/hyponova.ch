"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  separator?: string;
  decimalSeparator?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CountUp({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000,
  separator = "'",
  decimalSeparator = ".",
  className = "",
  style,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [whole, decimal] = fixed.split(".");
    // Add thousand separator
    const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimal ? `${formatted}${decimalSeparator}${decimal}` : formatted;
  };

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{formatNumber(value)}{suffix}
    </span>
  );
}
