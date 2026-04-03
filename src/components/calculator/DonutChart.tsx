"use client";

interface DonutChartProps {
  percentage: number;
  color: string;
  label: string;
  statusText: string;
  size?: number;
}

export default function DonutChart({
  percentage,
  color,
  label,
  statusText,
  size = 180,
}: DonutChartProps) {
  const radius = 70;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(percentage, 100);
  const offset = circumference * (1 - clampedPercent / 100);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs uppercase tracking-widest font-medium mb-4" style={{ color: "#6b6b6b" }}>
        {label}
      </p>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        {/* Foreground arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.6s ease-out, stroke 0.3s ease" }}
        />
        {/* Percentage text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="28"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          style={{ transition: "fill 0.3s ease" }}
        >
          {percentage > 999 ? ">999%" : `${percentage.toFixed(1)}%`}
        </text>
        {/* Status label */}
        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="12"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
          style={{ transition: "fill 0.3s ease" }}
        >
          {statusText}
        </text>
      </svg>
    </div>
  );
}
