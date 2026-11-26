import { describe, it, expect } from "vitest";
import { applyAmountInput } from "@/lib/amount-input";

describe("applyAmountInput", () => {
  it("formats digits as thousands-separated display text", () => {
    expect(applyAmountInput("25000")).toEqual({ display: "25.000", value: 25000 });
  });

  it("treats an already-formatted string the same as raw digits", () => {
    expect(applyAmountInput("25.000")).toEqual({ display: "25.000", value: 25000 });
  });

  it("drops one digit when the user backspaces a formatted value", () => {
    // "25.000" minus its last character is "25.00", which re-formats to "2.500".
    expect(applyAmountInput("25.00")).toEqual({ display: "2.500", value: 2500 });
  });

  it("returns an empty display and zero value for empty input", () => {
    expect(applyAmountInput("")).toEqual({ display: "", value: 0 });
  });

  it("strips letters and symbols", () => {
    expect(applyAmountInput("Rp 25abc000")).toEqual({
      display: "25.000",
      value: 25000,
    });
  });

  it("strips a leading zero so the field never shows 025.000", () => {
    expect(applyAmountInput("025000")).toEqual({ display: "25.000", value: 25000 });
  });

  it("ignores input that contains no digits at all", () => {
    expect(applyAmountInput("abc")).toEqual({ display: "", value: 0 });
  });

  it("keeps very large amounts exact", () => {
    expect(applyAmountInput("999999999")).toEqual({
      display: "999.999.999",
      value: 999999999,
    });
  });
});
