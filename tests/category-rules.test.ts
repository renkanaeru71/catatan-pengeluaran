import { describe, it, expect } from "vitest";
import { canDeleteCategory, categoryErrorMessage } from "@/lib/category-rules";

describe("canDeleteCategory", () => {
  it("allows deleting a category with no transactions", () => {
    expect(canDeleteCategory(0)).toBe(true);
  });

  it("blocks deleting a category that is still used", () => {
    expect(canDeleteCategory(1)).toBe(false);
    expect(canDeleteCategory(37)).toBe(false);
  });
});

describe("categoryErrorMessage", () => {
  it("names the transaction count when the category is in use", () => {
    expect(categoryErrorMessage(3)).toBe(
      "Kategori ini masih dipakai oleh 3 transaksi. Hapus atau pindahkan transaksinya dulu.",
    );
  });

  it("uses the singular form for one transaction", () => {
    expect(categoryErrorMessage(1)).toBe(
      "Kategori ini masih dipakai oleh 1 transaksi. Hapus atau pindahkan transaksinya dulu.",
    );
  });
});
