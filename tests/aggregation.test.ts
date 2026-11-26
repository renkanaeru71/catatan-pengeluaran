import { describe, it, expect } from "vitest";
import {
  computePercentChange,
  computeAverage,
  zeroFillDays,
  comparisonDirection,
} from "@/lib/stats";
import { addDays, monthRange, parseDateKey, weekRange } from "@/lib/date";

describe("computePercentChange", () => {
  it("maps percent change to arrow direction", () => {
    expect(comparisonDirection(10)).toBe("up");
    expect(comparisonDirection(-5)).toBe("down");
    expect(comparisonDirection(0)).toBe("same");
    expect(comparisonDirection(null)).toBe("none");
  });

  it("returns a positive percentage when spending grew", () => {
    expect(computePercentChange(150_000, 100_000)).toBe(50);
  });

  it("returns a negative percentage when spending shrank", () => {
    expect(computePercentChange(50_000, 100_000)).toBe(-50);
  });

  it("returns null when both periods are zero, instead of NaN", () => {
    expect(computePercentChange(0, 0)).toBeNull();
  });

  it("returns null when only the baseline is zero, instead of Infinity", () => {
    expect(computePercentChange(1_000, 0)).toBeNull();
  });

  it("returns 0 when spending is unchanged", () => {
    expect(computePercentChange(100_000, 100_000)).toBe(0);
  });

  it("rounds to one decimal place", () => {
    expect(computePercentChange(100_001, 100_000)).toBe(0);
    expect(computePercentChange(133_333, 100_000)).toBe(33.3);
  });
});

describe("computeAverage", () => {
  it("divides the total by the number of days", () => {
    expect(computeAverage(700_000, 7)).toBe(100_000);
  });

  it("returns 0 for an empty period", () => {
    expect(computeAverage(0, 7)).toBe(0);
  });

  it("never divides by zero", () => {
    expect(computeAverage(100, 0)).toBe(0);
    expect(computeAverage(100, -1)).toBe(0);
  });

  it("rounds to whole rupiah", () => {
    expect(computeAverage(1_000, 3)).toBe(333);
  });
});

describe("zeroFillDays", () => {
  const week = weekRange(parseDateKey("2026-11-26"));

  it("always returns one entry per day in the range", () => {
    const filled = zeroFillDays(week.start, week.end, []);
    expect(filled).toHaveLength(7);
    expect(filled.map((d) => d.total)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("places an existing total on its own day and zeroes the rest", () => {
    const target = addDays(week.start, 1);
    const filled = zeroFillDays(week.start, week.end, [
      { date: target, total: 5_000 },
    ]);

    expect(filled).toHaveLength(7);
    expect(filled[1]).toEqual({ date: target, total: 5_000 });
    expect(filled[0].total).toBe(0);
    expect(filled[2].total).toBe(0);
  });

  it("keeps the range ascending from start to end", () => {
    const filled = zeroFillDays(week.start, week.end, []);
    expect(filled[0].date).toEqual(week.start);
    expect(filled[6].date).toEqual(week.end);
  });

  it("covers a full month when given a month range", () => {
    const month = monthRange(parseDateKey("2026-02-10"));
    expect(zeroFillDays(month.start, month.end, [])).toHaveLength(28);
  });
});

describe("period total consistency", () => {
  // The invariant the recap pages depend on: the sum of the zero-filled daily
  // buckets must equal the period total, or a chart and its header disagree.
  it("sums the zero-filled week back to the weekly total", () => {
    const week = weekRange(parseDateKey("2026-11-26"));
    const rows = [
      { date: week.start, total: 25_000 },
      { date: addDays(week.start, 3), total: 40_000 },
      { date: week.end, total: 15_000 },
    ];
    const periodTotal = rows.reduce((sum, row) => sum + row.total, 0);
    const filled = zeroFillDays(week.start, week.end, rows);

    expect(filled.reduce((sum, day) => sum + day.total, 0)).toBe(periodTotal);
  });

  it("sums the zero-filled month back to the monthly total", () => {
    const month = monthRange(parseDateKey("2026-11-26"));
    const rows = [
      { date: month.start, total: 10_000 },
      { date: parseDateKey("2026-11-15"), total: 90_000 },
      { date: month.end, total: 5_000 },
    ];
    const periodTotal = rows.reduce((sum, row) => sum + row.total, 0);
    const filled = zeroFillDays(month.start, month.end, rows);

    expect(filled.reduce((sum, day) => sum + day.total, 0)).toBe(periodTotal);
  });
});
