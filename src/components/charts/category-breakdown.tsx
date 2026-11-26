import { Money } from "@/components/shared/money";
import type { CategoryTotal } from "@/lib/stats";

interface CategoryBreakdownProps {
  items: CategoryTotal[];
  /** Shown when the period has no spending yet. */
  emptyMessage?: string;
}

/**
 * Horizontal per-category bars with colour dots, amounts and share of total.
 * Pure server-rendered markup: no chart library needed for a simple bar list,
 * and it stays readable on narrow screens.
 */
export function CategoryBreakdown({
  items,
  emptyMessage = "Belum ada pengeluaran pada periode ini.",
}: CategoryBreakdownProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const percent = total > 0 ? (item.total / total) * 100 : 0;
        return (
          <li key={item.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium">{item.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {percent.toFixed(1)}%
                </span>
              </span>
              <Money amount={item.total} className="shrink-0 font-medium" />
            </div>
            <div
              className="bg-muted h-2 w-full overflow-hidden rounded-full"
              role="presentation"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(percent, 1)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
