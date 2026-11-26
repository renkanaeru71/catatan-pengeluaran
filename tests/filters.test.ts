import { describe, it, expect } from "vitest";
import {
  buildTransactionWhere,
  normalizeFilterParams,
  hasActiveFilters,
  PAGE_SIZE,
  parsePage,
} from "@/lib/transaction-filters";

describe("buildTransactionWhere", () => {
  it("returns an empty filter when nothing is provided", () => {
    const where = buildTransactionWhere({});
    expect(where).toEqual({});
    expect(where).not.toHaveProperty("date");
    expect(where).not.toHaveProperty("categoryId");
    expect(where).not.toHaveProperty("note");
  });

  it("ignores blank strings instead of filtering on them", () => {
    const where = buildTransactionWhere({
      from: "",
      to: "",
      categoryId: "",
      q: "   ",
    });
    expect(where).toEqual({});
  });

  it("builds an inclusive date range from from/to", () => {
    const where = buildTransactionWhere({
      from: "2026-11-01",
      to: "2026-11-30",
    });
    expect(where.date).toEqual({
      gte: new Date(Date.UTC(2026, 10, 1)),
      lte: new Date(Date.UTC(2026, 10, 30)),
    });
  });

  it("supports an open-ended range", () => {
    const fromOnly = buildTransactionWhere({ from: "2026-11-01" });
    expect(fromOnly.date).toEqual({ gte: new Date(Date.UTC(2026, 10, 1)) });

    const toOnly = buildTransactionWhere({ to: "2026-11-30" });
    expect(toOnly.date).toEqual({ lte: new Date(Date.UTC(2026, 10, 30)) });
  });

  it("filters by category", () => {
    const where = buildTransactionWhere({ categoryId: "cat_123" });
    expect(where.categoryId).toBe("cat_123");
  });

  it("searches notes case-insensitively and trims the term", () => {
    const where = buildTransactionWhere({ q: "  kopi  " });
    expect(where.note).toEqual({ contains: "kopi", mode: "insensitive" });
  });

  it("combines every filter at once", () => {
    const where = buildTransactionWhere({
      from: "2026-11-01",
      to: "2026-11-30",
      categoryId: "cat_123",
      q: "kopi",
    });
    expect(where).toEqual({
      date: {
        gte: new Date(Date.UTC(2026, 10, 1)),
        lte: new Date(Date.UTC(2026, 10, 30)),
      },
      categoryId: "cat_123",
      note: { contains: "kopi", mode: "insensitive" },
    });
  });

  it("ignores an unparseable date instead of throwing", () => {
    const where = buildTransactionWhere({ from: "bukan-tanggal" });
    expect(where).toEqual({});
  });
});

describe("normalizeFilterParams", () => {
  it("drops empty and invalid values", () => {
    expect(
      normalizeFilterParams({
        from: "",
        to: "bukan-tanggal",
        categoryId: "  ",
        q: "  kopi ",
      }),
    ).toEqual({ q: "kopi" });
  });

  it("keeps valid values", () => {
    expect(
      normalizeFilterParams({
        from: "2026-11-01",
        to: "2026-11-30",
        categoryId: "cat_1",
        q: "kopi",
      }),
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-30",
      categoryId: "cat_1",
      q: "kopi",
    });
  });

  it("reports whether any filter is active", () => {
    expect(hasActiveFilters(normalizeFilterParams({}))).toBe(false);
    expect(hasActiveFilters(normalizeFilterParams({ q: "kopi" }))).toBe(true);
    expect(
      hasActiveFilters(normalizeFilterParams({ from: "2026-11-01" })),
    ).toBe(true);
  });
});

describe("parsePage", () => {
  it("defaults to page 1", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("")).toBe(1);
  });

  it("parses a positive page number", () => {
    expect(parsePage("3")).toBe(3);
  });

  it("clamps invalid, zero, and negative values to 1", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-4")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });

  it("exposes a page size of 20", () => {
    expect(PAGE_SIZE).toBe(20);
  });
});
