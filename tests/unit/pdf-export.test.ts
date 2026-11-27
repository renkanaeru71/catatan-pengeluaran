import { describe, it, expect, vi } from "vitest";
import { generateWeeklyPdf, generateMonthlyPdf } from "@/lib/pdf-export";

vi.mock("jspdf", () => {
  return {
    default: class MockJsPDF {
      setFontSize = vi.fn();
      setFont = vi.fn();
      text = vi.fn();
      setTextColor = vi.fn();
      setDrawColor = vi.fn();
      setFillColor = vi.fn();
      roundedRect = vi.fn();
      save = vi.fn();
    },
  };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("PDF Export Generator", () => {
  it("creates a weekly PDF document without error", () => {
    const doc = generateWeeklyPdf({
      periodLabel: "24 Nov – 30 Nov 2026",
      total: 500000,
      days: [
        { dateLabel: "Senin, 24 Nov", total: 100000 },
        { dateLabel: "Selasa, 25 Nov", total: 400000 },
      ],
      categories: [
        { name: "Makanan", total: 300000, percentage: 60 },
        { name: "Transportasi", total: 200000, percentage: 40 },
      ],
    });

    expect(doc).toBeDefined();
    expect(doc.text).toHaveBeenCalled();
  });

  it("creates a monthly PDF document without error", () => {
    const doc = generateMonthlyPdf({
      periodLabel: "November 2026",
      total: 1500000,
      averagePerDay: 50000,
      days: [
        { dateLabel: "1 Nov 2026", total: 100000 },
        { dateLabel: "2 Nov 2026", total: 50000 },
      ],
      categories: [
        { name: "Makanan", total: 1000000, percentage: 67 },
      ],
    });

    expect(doc).toBeDefined();
    expect(doc.text).toHaveBeenCalled();
  });
});
