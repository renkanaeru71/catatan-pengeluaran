import { describe, it, expect } from "vitest";
import {
  transactionSchema,
  categorySchema,
  loginSchema,
} from "@/lib/validators";

describe("transactionSchema", () => {
  it("accepts valid transaction data", () => {
    const res = transactionSchema.safeParse({
      amount: 25000,
      categoryId: "cat_123",
      date: "2026-11-26",
      note: "Makan siang",
    });
    expect(res.success).toBe(true);
  });

  it("rejects amount <= 0 or float", () => {
    expect(
      transactionSchema.safeParse({
        amount: 0,
        categoryId: "cat_123",
        date: "2026-11-26",
      }).success,
    ).toBe(false);

    expect(
      transactionSchema.safeParse({
        amount: 2500.5,
        categoryId: "cat_123",
        date: "2026-11-26",
      }).success,
    ).toBe(false);
  });

  it("rejects note longer than 140 characters", () => {
    const res = transactionSchema.safeParse({
      amount: 10000,
      categoryId: "cat_123",
      date: "2026-11-26",
      note: "a".repeat(141),
    });
    expect(res.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const res = transactionSchema.safeParse({
      amount: 10000,
      categoryId: "cat_123",
      date: "26/11/2026",
    });
    expect(res.success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("accepts valid category name and hex color", () => {
    const res = categorySchema.safeParse({
      name: "Makan",
      color: "#f59e0b",
    });
    expect(res.success).toBe(true);
  });

  it("rejects invalid color format", () => {
    expect(
      categorySchema.safeParse({
        name: "Makan",
        color: "blue",
      }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects password shorter than 12 characters", () => {
    expect(loginSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(
      loginSchema.safeParse({ password: "password12345" }).success,
    ).toBe(true);
  });
});
