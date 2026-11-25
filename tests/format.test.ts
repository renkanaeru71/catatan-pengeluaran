import { describe, it, expect } from "vitest";
import {
  formatRupiah,
  parseRupiahInput,
  formatRupiahInput,
  formatDateLabel,
  formatRangeLabel,
} from "@/lib/format";

describe("formatRupiah", () => {
  it("formats standard amounts in IDR style", () => {
    expect(formatRupiah(25000)).toBe("Rp 25.000");
    expect(formatRupiah(1250000)).toBe("Rp 1.250.000");
  });

  it("formats zero", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});

describe("parseRupiahInput and formatRupiahInput", () => {
  it("parses formatted string to integer", () => {
    expect(parseRupiahInput("25.000")).toBe(25000);
    expect(parseRupiahInput("Rp 1.250.000")).toBe(1250000);
    expect(parseRupiahInput("")).toBe(0);
    expect(parseRupiahInput("abc")).toBe(0);
  });

  it("formats raw numeric input with thousands separators", () => {
    expect(formatRupiahInput("25000")).toBe("25.000");
    expect(formatRupiahInput("1250000")).toBe("1.250.000");
    expect(formatRupiahInput("0")).toBe("0");
    expect(formatRupiahInput("")).toBe("");
  });
});

describe("formatDateLabel and formatRangeLabel", () => {
  it("formats a single date in Indonesian format", () => {
    const d = new Date("2026-11-26T00:00:00Z");
    expect(formatDateLabel(d)).toBe("26 Nov 2026");
  });

  it("formats date range within same month", () => {
    const start = new Date("2026-11-24T00:00:00Z");
    const end = new Date("2026-11-30T00:00:00Z");
    expect(formatRangeLabel(start, end)).toBe("24–30 Nov 2026");
  });

  it("formats date range crossing two months in same year", () => {
    const start = new Date("2026-11-30T00:00:00Z");
    const end = new Date("2026-12-06T00:00:00Z");
    expect(formatRangeLabel(start, end)).toBe("30 Nov – 6 Des 2026");
  });
});
