"use client";

import { useState } from "react";

interface CalculatorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  hintLabel?: string;
  hintValue?: string;
}

export default function CalculatorInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hintLabel,
  hintValue,
}: CalculatorInputProps) {
  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState("");

  const formatDisplay = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  const handleFocus = () => {
    setEditing(true);
    setInputText(value.toString());
  };

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseInt(inputText.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputText(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange(val);
  };

  const sliderPercent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="mb-8">
      <label className="block text-sm font-semibold mb-3" style={{ color: "#1a1a1a" }}>
        {label}
      </label>
      <div
        className="flex items-center px-4 py-3"
        style={{ border: "1px solid #e5e5e5", transition: "border-color 0.2s" }}
      >
        <span className="text-sm font-medium mr-3 flex-shrink-0" style={{ color: "#999" }}>
          CHF
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={editing ? inputText : formatDisplay(value)}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-sm outline-none bg-transparent"
          style={{ color: "#1a1a1a" }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="calculator-slider w-full mt-3"
        style={{
          background: `linear-gradient(to right, #1a1a1a ${sliderPercent}%, #e5e5e5 ${sliderPercent}%)`,
        }}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      {hintLabel && hintValue && (
        <p className="mt-2 text-[13px]" style={{ color: "#6b6b6b" }}>
          {hintLabel}: <span className="font-semibold" style={{ color: "#1a1a1a" }}>{hintValue}</span>
        </p>
      )}
    </div>
  );
}
