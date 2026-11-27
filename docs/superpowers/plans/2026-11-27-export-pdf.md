# Export PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan tombol dan generator Export PDF untuk Rekap Bulanan dan Rekap Mingguan langsung di client/browser tanpa beban serverless.

**Architecture:** Gunakan library client-side standard `jspdf` dan `jspdf-autotable`. Buat modul helper generator PDF di `src/lib/pdf-export.ts` yang menerima data rekap (summary, breakdown kategori, dan daftar pengeluaran) lalu menghasilkan file PDF bersih dengan kop, ringkasan angka, tabel kategori, dan detail harian. Buat komponen client button `ExportPdfButton` yang disematkan di halaman `/mingguan` dan `/bulanan`.

**Tech Stack:** Next.js 15 App Router, TypeScript, `jspdf`, `jspdf-autotable`, Tailwind CSS, Lucide icons (`Download` / `FileDown`).

**Spec:** Dokumen ini mengimplementasikan permintaan user: export PDF rentang bulanan dan mingguan.

## Global Constraints
- Currency IDR format integer standard (contoh: `Rp 150.000`).
- Waktu Indonesia Barat / Asia Jakarta untuk nama hari dan format tanggal.
- Client-side generation (0ms overhead di Netlify Serverless Edge, tidak butuh Chromium server).
- Dukungan responsive di layar mobile dan desktop.

## Review Focus
1. Export saat data kosong (total Rp 0) tetap menghasilkan PDF rapi dengan status "Tidak ada transaksi".
2. Penamaan file PDF jelas dan teratur (`laporan-pengeluaran-mingguan-YYYY-MM-DD.pdf`, `laporan-pengeluaran-bulanan-YYYY-MM.pdf`).
3. Format angka mata uang Indonesia terbaca dengan benar tanpa simbol rusak.
4. AutoTable handling pada pagination jika daftar transaksi panjang.
5. Indikator loading saat proses generate PDF berjalan.

---

### Task 1: Install Dependencies & Helper Export PDF

**Files:**
- Modify: `package.json`
- Create: `src/lib/pdf-export.ts`
- Test: `tests/unit/pdf-export.test.ts`

- [ ] **Step 1: Install `jspdf` dan `jspdf-autotable`**
Run: `npm install jspdf jspdf-autotable`

- [ ] **Step 2: Buat unit helper generator PDF `src/lib/pdf-export.ts`**
Menyediakan dua fungsi:
`exportWeeklyPdf(data: WeeklyExportData): void`
`exportMonthlyPdf(data: MonthlyExportData): void`

- [ ] **Step 3: Buat test untuk memastikan data formatting helper berjalan**
Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add package.json package-lock.json src/lib/pdf-export.ts tests/
git commit -m "feat(export): add jspdf generator for weekly and monthly reports"
```

---

### Task 2: Buat Komponen Client UI `ExportPdfButton`

**Files:**
- Create: `src/components/shared/export-pdf-button.tsx`

- [ ] **Step 1: Implementasi tombol ekspor dengan ikon dan state loading**
Tombol dengan ikon `FileDown`, teks "Ekspor PDF", dan spinner saat proses download berlangsung.

- [ ] **Step 2: Commit**
```bash
git add src/components/shared/export-pdf-button.tsx
git commit -m "feat(ui): add ExportPdfButton component"
```

---

### Task 3: Integrasikan ke Halaman Rekap Mingguan (`/mingguan`) & Rekap Bulanan (`/bulanan`)

**Files:**
- Modify: `src/app/(dashboard)/mingguan/page.tsx`
- Modify: `src/app/(dashboard)/bulanan/page.tsx`

- [ ] **Step 1: Pasang `ExportPdfButton` di header halaman `/mingguan`**
Sematkan tombol di samping PeriodNav/Header mingguan.

- [ ] **Step 2: Pasang `ExportPdfButton` di header halaman `/bulanan`**
Sematkan tombol di samping PeriodNav/Header bulanan.

- [ ] **Step 3: Verifikasi build dan test lokal**
Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: 0 errors, all tests pass.

- [ ] **Step 4: Commit & Push ke GitHub untuk deploy ke Netlify**
```bash
git add src/app/\(dashboard\)/mingguan/page.tsx src/app/\(dashboard\)/bulanan/page.tsx
git commit -m "feat(export): integrate pdf export button into weekly and monthly pages"
git push origin main
```
