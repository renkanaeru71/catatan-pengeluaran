# Design Doc – Website Catatan Pengeluaran (Harian, Mingguan, Bulanan)

**Tanggal:** 26 Nov 2026  
**Status:** Draf untuk Review  
**Dasar:** PRD Versi 1.1 (`/Users/kikuy/Downloads/PRD – Website Catatan Pengeluaran (Harian, Mingguan, Bulanan).md`)  
**Lokasi Proyek:** `/Users/kikuy/Documents/catatan-pengeluaran`

---

## 1. Intent & The Why

Aplikasi web pribadi untuk mencatat pengeluaran uang secara super cepat (<10 detik per transaksi) dan melihat rekap harian, mingguan, serta bulanan secara ringkas dan akurat dalam Rupiah. Target utama adalah penggunaan di smartphone (nyaman dipakai satu tangan) dan laptop, dengan data tersinkron antar-perangkat dan hosting gratis di Netlify.

### Pengguna
Satu orang pemilik (pribadi/mahasiswa), mencatat pengeluaran uang jajan dan biaya harian.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- Input transaksi < 10 detik via FAB (Floating Action Button) / drawer / dialog responsif.
- Rekap total & rincian per kategori untuk:
  - Harian (`/harian`): Total hari itu + daftar transaksi hari itu urut terbaru (sesuai PRD F4, tanpa chart kategori).
  - Mingguan (`/mingguan`, Senin–Minggu, 7-bar chart + total + rata-rata harian + rincian per kategori).
  - Bulanan (`/bulanan`, donut chart + total + rata-rata harian + perbandingan bulan lalu + top 5 transaksi).
- Dashboard (`/`) dengan ringkasan cepat dan 5 transaksi terakhir.
- Daftar semua transaksi (`/transaksi`) dengan filter tanggal & kategori, pencarian `note`, dan pagination/infinite scroll.
- Kelola kategori (`/kategori`): tambah, ubah nama, hapus (dicegah jika masih terpakai).
- Single-owner authentication tanpa registrasi: login via password tunggal (bcrypt hash di environment variable `APP_PASSWORD_HASH`).
- Zona waktu ketat `Asia/Jakarta` (WIB) untuk semua batasan hari, minggu, dan bulan.
- Unit test Vitest untuk kalkulasi rentang tanggal dan agregasi (termasuk batas tengah malam 23:59 vs 00:01 WIB).
- Deploy mulus ke Netlify dengan PostgreSQL di Neon.

### Non-Goals (MVP)
- Multi-user / sistem registrasi publik.
- Pencatatan pemasukan / dompet / multi-rekening / transfer.
- Budgeting / target pengeluaran.
- Export PDF/CSV, upload struk/gambar.
- Notifikasi push / email.
- Mobile native app / PWA offline full.

### Anti-Goals
- Tidak ada data float untuk uang (selalu integer Rupiah).
- Tidak memuat seluruh transaksi ke memori untuk agregasi (selalu agregasi di DB via Prisma `groupBy` atau query agregat).
- Tidak ada session state kompleks atau tabel user kosong: tidak memakai database session table jika satu token cookie bertanda tangan sudah cukup.

---

## 3. Constraints & Tech Stack

- **Framework:** Next.js 15 (App Router, React 19) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components (Radix primitives)
- **Charts:** Recharts
- **Database:** PostgreSQL di Neon (serverless pooled connection untuk runtime, direct URL untuk migration)
- **ORM:** Prisma Client
- **Form & Validation:** React Hook Form + Zod
- **Date Handling:** `date-fns` + `date-fns-tz` dengan zona waktu `Asia/Jakarta`
- **Hosting / Deploy:** Netlify (`@netlify/plugin-nextjs` otomatis atau Next.js OpenNext adapter di Netlify)
- **Node runtime target:** Node 20 LTS (ditetapkan via `netlify.toml` dan `.nvmrc`)

---

## 4. Approaches & Decision

### Alternatif yang Dipertimbangkan:

1. **Pendekatan A (Dipilih): Next.js App Router + Server Actions + Sesi Cookie Bertanda Tangan (`jose`)**
   - *Kenapa:* PRD hanya membutuhkan satu password statis dan tidak ada tabel `User`. Menggunakan Auth.js v5 Credentials provider menambah kompleksitas adapter, middleware edge routing, dan dependency berlebih. Sesi cookie HTTP-only bertanda tangan HMAC SHA-256 via `jose` + bcryptjs verifikasi password hanya butuh ~60 baris kode bersih, stabil di Netlify Serverless Functions, dan 100% memenuhi kriteria F1.
   - *Trade-off:* Jika nanti ingin multi-user atau OAuth (Google login), harus migrasi ke Auth.js/Lucia. Diterima karena PRD eksplisit menyatakan single-user.

2. **Pendekatan B: Auth.js v5 (NextAuth) dengan Credentials Provider**
   - *Kenapa ditolak:* Konfigurasi boilerplate besar untuk sekadar mencocokkan satu password terhadap env var. Potensi bug pada edge middleware di Netlify.

3. **Pendekatan C: Single-Page Application (Vite + React) + Supabase / Backend API Terpisah**
   - *Kenapa ditolak:* Membutuhkan 2 deployment terpisah atau setup Supabase RLS yang lebih rumit untuk single password. Next.js App Router menyatukan frontend dan backend server actions dalam 1 repo siap deploy di Netlify.

---

## 5. Arsitektur & Spesifikasi Detail

### 5.1 Struktur Database (Prisma)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Category {
  id           String        @id @default(cuid())
  name         String        @unique
  color        String        @default("#64748b")
  transactions Transaction[]
}

model Transaction {
  id         String   @id @default(cuid())
  categoryId String
  amount     Int      // integer rupiah > 0
  date       DateTime @db.Date // zona Asia/Jakarta
  note       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  category   Category @relation(fields: [categoryId], references: [id])

  @@index([date])
}
```

### 5.2 Autentikasi & Otorisasi
- Hash bcrypt disimpan di env `APP_PASSWORD_HASH`.
- Secret sesi di env `AUTH_SECRET` (32 bytes random string).
- Endpoint `/login` memvalidasi input password terhadap bcrypt hash.
- Jika valid, set cookie HTTP-only `session_token` dengan payload `{ auth: true, exp: 30 days }` bertanda tangan `jose` (JWT/JWE).
- `middleware.ts` memverifikasi token pada semua rute kecuali `/login`, `/_next`, `/favicon.ico`, dan aset statis. Jika tidak ada token valid, redirect ke `/login`.
- Server Actions mengecek sesi sebelum menjalankan mutasi.

### 5.3 Aturan Tanggal & Agregasi (Asia/Jakarta)
- **Tipe Tanggal:** Field `date` adalah kalender murni `@db.Date` (`YYYY-MM-DD`). DoD "transaksi 23:59 vs 00:01 WIB" diuji pada level helper parsing input waktu lokal ke kalender WIB (memastikan jam 23:59 WIB pada 16:59 UTC terhitung ke hari H dan 00:01 WIB ke hari H+1).
- Rentang hari, minggu (Senin 00:00 - Minggu 23:59 WIB), dan bulan dihitung menggunakan fungsi utilitas berbasis `date-fns` dan `date-fns-tz`.
- **Rata-rata Harian:**
  - Mingguan: total minggu dibagi 7 hari (atau jumlah hari berlalu jika minggu berjalan).
  - Bulanan: total bulan dibagi jumlah hari di bulan tersebut (atau jumlah hari berlalu jika bulan berjalan).
- **Perbandingan Bulan Lalu:**
  - Persentase dihitung: `((totalBulanIni - totalBulanLalu) / totalBulanLalu) * 100`.
  - Jika bulan lalu 0 pengeluaran: UI menampilkan status netral / strip (`-`) tanpa error divide-by-zero.
- **Unit Test Vitest:**
  - Dijalankan sebagai pure function unit tests untuk logika kalkulasi rentang tanggal WIB, konversi jam midnight, formula rata-rata, dan agregasi data array/matrix tanpa membutuhkan live database lokal/Docker.
- Agregasi harian/mingguan/bulanan dijalankan di DB via Prisma `groupBy` untuk efisiensi serverless.

### 5.4 Database Seeding
- `prisma/seed.ts` dibuat idempotent menggunakan `upsert` pada nama kategori bawaan (Makan, Transport, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya).
- Dijalankan sekali saat inisialisasi awal database Neon: `npx prisma db seed`. Tidak dijalankan di setiap build Netlify agar tidak mengembalikan kategori yang sengaja dihapus pengguna.

### 5.4 UI / UX & Desain
- Bottom Navigation Bar di mobile: `Beranda`, `Harian`, `Mingguan`, `Bulanan`, `Lainnya` (menu ke Transaksi & Kategori).
- Sidebar Navigation di desktop.
- Floating Action Button (FAB) "+" di mobile kanan bawah; tombol "+ Tambah" di header desktop. Keduanya memicu Sheet / Dialog form transaksi.
- Input nominal uang otomatis diformat ribuan saat mengetik (`Rp 25.000`), disimpan sebagai integer murni `25000`.
- Format Rupiah konsisten: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.
- Warna tema: Slate neutral dengan aksen Blue (`#2563eb`), dark mode otomatis sesuai preferensi sistem (`next-themes` / Tailwind `dark:` class).
- Empty states dan skeleton loaders untuk data transaksi dan grafik.

### 5.5 Struktur Folder Proyek
```
catatan-pengeluaran/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Dashboard (F7)
│   │   │   ├── harian/page.tsx     # F4
│   │   │   ├── mingguan/page.tsx   # F5
│   │   │   ├── bulanan/page.tsx    # F6
│   │   │   ├── transaksi/page.tsx  # F8
│   │   │   └── kategori/page.tsx   # F3
│   │   ├── api/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                     # shadcn primitives
│   │   ├── forms/                  # TransactionForm, CategoryForm
│   │   ├── charts/                 # DailyBarChart, MonthlyTrendChart, CategoryPieChart
│   │   ├── layout/                 # BottomNav, DesktopSidebar, Header
│   │   └── shared/                 # MoneyText, EmptyState, ConfirmDialog
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # Jose JWT & cookie handlers
│   │   ├── date.ts                 # Asia/Jakarta date-fns helpers
│   │   ├── format.ts               # Rupiah & date formatters
│   │   └── validators.ts           # Zod schemas
│   ├── server/
│   │   ├── actions/                # transactionActions, categoryActions, authActions
│   │   └── queries/                # statsQueries, transactionQueries
│   └── middleware.ts
├── tests/
│   ├── date.test.ts
│   └── aggregation.test.ts
├── .env.example
├── netlify.toml
├── package.json
└── README.md
```

### 5.6 Konfigurasi Netlify
- `netlify.toml`:
  ```toml
  [build]
    command = "prisma generate && next build"

  [build.environment]
    NODE_VERSION = "20"
  ```
- Deploy via Git push ke GitHub repository, lalu link ke Netlify.
- Migrasi database dijalankan dari lokal: `npx prisma migrate deploy`.

---

## 6. What's Left to the Builder

- Pemilihan palet warna kategori bawaan (misal: Makan = Amber, Transport = Blue, Belanja = Violet, dll.).
- Implementasi komponen visual Recharts yang responsif (Tooltip, Legend, ResponsiveContainer).
- Pembuatan skrip pembantu `npm run hash-password` untuk memudahkan pengguna menghasilkan bcrypt hash saat setup env.
