import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "@/lib/format";

export interface WeeklyPdfData {
  periodLabel: string;
  total: number;
  days: Array<{
    dateLabel: string;
    total: number;
  }>;
  categories: Array<{
    name: string;
    total: number;
    percentage: number;
  }>;
}

export interface MonthlyPdfData {
  periodLabel: string;
  total: number;
  averagePerDay: number;
  days: Array<{
    dateLabel: string;
    total: number;
  }>;
  categories: Array<{
    name: string;
    total: number;
    percentage: number;
  }>;
}

export function generateWeeklyPdf(data: WeeklyPdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Pengeluaran Mingguan", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Periode: ${data.periodLabel}`, 14, 28);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, 14, 34);

  // Summary box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 40, 182, 22, 2, 2, "FD");

  doc.setTextColor(70);
  doc.setFontSize(9);
  doc.text("TOTAL PENGELUARAN MINGGU INI", 20, 48);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(data.total), 20, 56);

  let currentY = 70;

  // Categories Table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Kategori", 14, currentY);

  const categoryRows = data.categories.length > 0
    ? data.categories.map((c) => [c.name, `${c.percentage}%`, formatRupiah(c.total)])
    : [["Belum ada transaksi", "-", "Rp 0"]];

  autoTable(doc, {
    startY: currentY + 4,
    head: [["Kategori", "Porsi", "Total"]],
    body: categoryRows,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Daily Table
  const finalCategoryY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? (currentY + 30);
  currentY = finalCategoryY + 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Harian", 14, currentY);

  const dayRows = data.days.map((d) => [d.dateLabel, formatRupiah(d.total)]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [["Hari & Tanggal", "Total Pengeluaran"]],
    body: dayRows,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  return doc;
}

export function generateMonthlyPdf(data: MonthlyPdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Pengeluaran Bulanan", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Periode: ${data.periodLabel}`, 14, 28);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, 14, 34);

  // Summary box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 40, 182, 24, 2, 2, "FD");

  doc.setTextColor(70);
  doc.setFontSize(9);
  doc.text("TOTAL BULAN INI", 20, 48);
  doc.text("RATA-RATA / HARI", 110, 48);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(data.total), 20, 57);
  doc.text(formatRupiah(data.averagePerDay), 110, 57);

  let currentY = 72;

  // Categories Table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Pengeluaran per Kategori", 14, currentY);

  const categoryRows = data.categories.length > 0
    ? data.categories.map((c) => [c.name, `${c.percentage}%`, formatRupiah(c.total)])
    : [["Belum ada transaksi", "-", "Rp 0"]];

  autoTable(doc, {
    startY: currentY + 4,
    head: [["Kategori", "Porsi", "Total"]],
    body: categoryRows,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Daily Table
  const finalCategoryY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? (currentY + 30);
  currentY = finalCategoryY + 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Harian (Tanggal 1 - Akhir)", 14, currentY);

  const dayRows = data.days.map((d) => [d.dateLabel, formatRupiah(d.total)]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [["Tanggal", "Total Pengeluaran"]],
    body: dayRows,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  return doc;
}
