"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { applyAmountInput } from "@/lib/amount-input";
import { formatRupiahInput } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function AmountInput({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder = "0",
  autoFocus,
}: AmountInputProps) {
  const [display, setDisplay] = useState<string>(() =>
    value > 0 ? formatRupiahInput(String(value)) : "",
  );

  // Sync external changes (e.g. form reset or editing a different transaction)
  useEffect(() => {
    setDisplay(value > 0 ? formatRupiahInput(String(value)) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const result = applyAmountInput(raw);
    setDisplay(result.display);
    onChange(result.value);
  }

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold select-none"
      >
        Rp
      </span>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn("pl-10 text-lg font-semibold tracking-tight", className)}
        aria-label="Nominal transaksi dalam Rupiah"
      />
    </div>
  );
}
