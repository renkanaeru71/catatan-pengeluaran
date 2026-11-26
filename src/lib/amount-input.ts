import { formatRupiahInput, parseRupiahInput } from "@/lib/format";

export type AmountInputResult = {
  /** What the input should display, e.g. "25.000". */
  display: string;
  /** The integer rupiah value, or 0 when the field is empty. */
  value: number;
};

/**
 * Normalize whatever the user typed into the amount field.
 *
 * Everything non-numeric is dropped first, so pasting "Rp 25.000", typing
 * letters, or backspacing across a thousand separator all collapse to the same
 * digit string. That digit string is the single source of truth: the display is
 * derived from it, never parsed back, so "25.00" (a backspace over "25.000")
 * correctly becomes "2.500" rather than an ambiguous decimal.
 */
export function applyAmountInput(raw: string): AmountInputResult {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { display: "", value: 0 };

  // Drop leading zeros so "025000" shows as "25.000" and "000" as "".
  const normalized = digits.replace(/^0+/, "");
  if (!normalized) return { display: "", value: 0 };

  return {
    display: formatRupiahInput(normalized),
    value: parseRupiahInput(normalized),
  };
}
