import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyProps {
  amount: number;
  className?: string;
  /** Render a neutral "-" instead of "Rp 0" (used for missing comparisons). */
  emptyAsDash?: boolean;
}

/**
 * Renders an integer rupiah amount. Isolated in one component so every figure
 * in the app is formatted identically and stays tabular in tables/charts.
 */
export function Money({ amount, className, emptyAsDash = false }: MoneyProps) {
  if (emptyAsDash && amount === 0) {
    return <span className={cn("text-muted-foreground", className)}>-</span>;
  }

  return (
    <span className={cn("tabular-nums", className)}>{formatRupiah(amount)}</span>
  );
}
