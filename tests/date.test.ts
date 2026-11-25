import { describe, it, expect } from "vitest";
import {
  toJakartaDateKey,
  parseDateKey,
  weekRange,
  monthRange,
  addDays,
  addMonths,
  elapsedDaysInWeek,
  elapsedDaysInMonth,
  daysInMonth,
  daysInWeek,
  eachDayOfRange,
} from "@/lib/date";

const d = (key: string) => parseDateKey(key);

describe("toJakartaDateKey", () => {
  it("maps 23:59 WIB to the same calendar day", () => {
    // 16:59 UTC == 23:59 WIB on 26 Nov 2026
    expect(toJakartaDateKey(new Date("2026-11-26T16:59:00Z"))).toBe("2026-11-26");
  });

  it("maps 00:01 WIB to the next calendar day", () => {
    // 17:01 UTC == 00:01 WIB on 27 Nov 2026
    expect(toJakartaDateKey(new Date("2026-11-26T17:01:00Z"))).toBe("2026-11-27");
  });

  it("maps 00:00 WIB exactly to the new day", () => {
    expect(toJakartaDateKey(new Date("2026-11-26T17:00:00Z"))).toBe("2026-11-27");
  });

  it("maps 23:59 WIB on New Year's Eve to 31 Dec, not 1 Jan", () => {
    expect(toJakartaDateKey(new Date("2026-12-31T16:59:00Z"))).toBe("2026-12-31");
  });
});

describe("weekRange", () => {
  it("returns Monday..Sunday for a Thursday", () => {
    const { start, end } = weekRange(d("2026-11-26"));
    expect(toJakartaDateKey(start)).toBe("2026-11-23");
    expect(toJakartaDateKey(end)).toBe("2026-11-29");
  });

  it("returns the same day as start for a Monday", () => {
    const { start } = weekRange(d("2026-11-23"));
    expect(toJakartaDateKey(start)).toBe("2026-11-23");
  });

  it("returns the same day as end for a Sunday", () => {
    const { end } = weekRange(d("2026-11-29"));
    expect(toJakartaDateKey(end)).toBe("2026-11-29");
  });

  it("crosses the year boundary correctly", () => {
    const { start, end } = weekRange(d("2026-01-01"));
    expect(toJakartaDateKey(start)).toBe("2025-12-29");
    expect(toJakartaDateKey(end)).toBe("2026-01-04");
  });
});

describe("monthRange", () => {
  it("returns the full month", () => {
    const { start, end } = monthRange(d("2026-11-15"));
    expect(toJakartaDateKey(start)).toBe("2026-11-01");
    expect(toJakartaDateKey(end)).toBe("2026-11-30");
  });

  it("handles February in a non-leap year", () => {
    const { end } = monthRange(d("2026-02-10"));
    expect(toJakartaDateKey(end)).toBe("2026-02-28");
  });

  it("handles February in a leap year", () => {
    const { end } = monthRange(d("2028-02-10"));
    expect(toJakartaDateKey(end)).toBe("2028-02-29");
  });
});

describe("addDays / addMonths", () => {
  it("adds days across a month boundary", () => {
    expect(toJakartaDateKey(addDays(d("2026-11-30"), 1))).toBe("2026-12-01");
  });

  it("clamps month addition instead of overflowing", () => {
    expect(toJakartaDateKey(addMonths(d("2026-01-31"), 1))).toBe("2026-02-28");
  });

  it("subtracts a month across the year boundary", () => {
    expect(toJakartaDateKey(addMonths(d("2026-01-15"), -1))).toBe("2025-12-15");
  });
});

describe("elapsed days", () => {
  it("counts elapsed days in a week", () => {
    const { start } = weekRange(d("2026-11-26"));
    expect(elapsedDaysInWeek(start, d("2026-11-26"))).toBe(4);
  });

  it("counts elapsed days in a month", () => {
    const { start } = monthRange(d("2026-11-26"));
    expect(elapsedDaysInMonth(start, d("2026-11-26"))).toBe(26);
  });

  it("never returns less than 1", () => {
    expect(elapsedDaysInWeek(d("2026-11-23"), d("2026-11-01"))).toBe(1);
    expect(elapsedDaysInMonth(d("2026-11-01"), d("2026-10-01"))).toBe(1);
  });
});

describe("daysInWeek / daysInMonth", () => {
  it("always reports 7 days in a week", () => {
    expect(daysInWeek()).toBe(7);
  });

  it("reports the correct number of days per month", () => {
    expect(daysInMonth(d("2026-11-01"))).toBe(30);
    expect(daysInMonth(d("2026-02-01"))).toBe(28);
    expect(daysInMonth(d("2028-02-01"))).toBe(29);
  });
});

describe("eachDayOfRange", () => {
  it("returns exactly 7 ascending dates for a week", () => {
    const { start, end } = weekRange(d("2026-11-26"));
    const days = eachDayOfRange(start, end);
    expect(days).toHaveLength(7);
    expect(toJakartaDateKey(days[0])).toBe("2026-11-23");
    expect(toJakartaDateKey(days[6])).toBe("2026-11-29");
  });

  it("returns 30 days for November", () => {
    const { start, end } = monthRange(d("2026-11-01"));
    expect(eachDayOfRange(start, end)).toHaveLength(30);
  });
});
