import React, { useRef, useState, useEffect } from "react";

interface PinInputProps {
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export default function PinInput({ length = 6, onChange, onComplete, disabled = false }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newValues = [...values];
    newValues[index] = value.slice(-1); // Take only the last character
    setValues(newValues);
    
    const pin = newValues.join("");
    onChange(pin);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (pin.length === length && onComplete) {
      onComplete(pin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).split("");
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newValues = [...values];
      pastedData.forEach((char, index) => {
        if (index < length) newValues[index] = char;
      });
      setValues(newValues);
      onChange(newValues.join(""));
      if (newValues.length === length && onComplete) {
        onComplete(newValues.join(""));
      }
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white text-gray-800"
        />
      ))}
    </div>
  );
}
