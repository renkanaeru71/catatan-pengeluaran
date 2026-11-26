/** Pure statistics helpers, free of Prisma so they can be unit-tested in isolation. */

export type CategoryTotal = {
  categoryId: string;
  name: string;
  color: string;
  total: number;
};

export type MonthComparison = {
  previousTotal: number;
  /** null when there is no meaningful baseline (previous total is 0). */
  percentChange: number | null;
  direction: "up" | "down" | "same" | "none";
};

/**
 * Percentage change from `previous` to `current`, rounded to one decimal.
 * Returns null when the baseline is zero: any growth from nothing is infinite,
 * and the UI renders "-" rather than an unbounded number.
 */
export function computePercentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
}

/** Integer rupiah average, guarding against a zero or negative divisor. */
export function computeAverage(total: number, divisor: number): number {
  if (divisor <= 0) return 0;
  return Math.round(total / divisor);
}

/**
 * Expand sparse per-day totals into one entry per calendar day of the range,
 * ascending, with missing days as zero. Charts need the fixed length.
 */
export function zeroFillDays(
  start: Date,
  end: Date,
  rows: { date: Date; total: number }[],
): { date: Date; total: number }[] {
  const byKey = new Map<string, number>();
  for (const row of rows) {
    byKey.set(toUtcKey(row.date), row.total);
  }

  const days: { date: Date; total: number }[] = [];
  for (
    let cursor = start;
    cursor.getTime() <= end.getTime();
    cursor = new Date(cursor.getTime() + 86_400_000)
  ) {
    days.push({ date: cursor, total: byKey.get(toUtcKey(cursor)) ?? 0 });
  }
  return days;
}

/** YYYY-MM-DD in UTC, the representation used for calendar dates in this app. */
function toUtcKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Direction of a month-over-month move, for arrow/colour selection in the UI. */
export function comparisonDirection(
  percentChange: number | null,
): MonthComparison["direction"] {
  if (percentChange === null) return "none";
  if (percentChange > 0) return "up";
  if (percentChange < 0) return "down";
  return "same";
}
