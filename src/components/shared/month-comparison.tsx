import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { MonthComparison } from "@/lib/stats";
import { cn } from "@/lib/utils";

interface MonthComparisonBadgeProps {
  comparison: MonthComparison;
  className?: string;
}

/**
 * Month-over-month indicator badge.
 * Renders:
 * - "↑ 12% dari bulan lalu" (destructive/red because spending grew)
 * - "↓ 8% dari bulan lalu" (emerald/green because spending shrank)
 * - "Sama dengan bulan lalu" (0% change)
 * - "-" when there was no spending in the previous month (no division by zero)
 */
export function MonthComparisonBadge({
  comparison,
  className,
}: MonthComparisonBadgeProps) {
  const { percentChange, direction } = comparison;

  if (direction === "none" || percentChange === null) {
    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex items-center gap-1 text-xs",
          className,
        )}
      >
        <span>-</span>
        <span>belum ada data bulan lalu</span>
      </span>
    );
  }

  if (direction === "same") {
    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex items-center gap-1 text-xs",
          className,
        )}
      >
        <Minus className="size-3.5" aria-hidden="true" />
        <span>Sama dengan bulan lalu</span>
      </span>
    );
  }

  const isUp = direction === "up";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        // Spending up = bad (red); spending down = good (emerald).
        isUp ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
        className,
      )}
    >
      {isUp ? (
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      ) : (
        <ArrowDownRight className="size-3.5" aria-hidden="true" />
      )}
      <span>
        {Math.abs(percentChange).toFixed(1)}% {isUp ? "lebih boros" : "lebih hemat"} dari bulan lalu
      </span>
    </span>
  );
}
