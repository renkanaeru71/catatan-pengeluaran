# Catatan Pengeluaran

Aplikasi pencatatan pengeluaran pribadi berbahasa Indonesia. Satu pemilik, satu
password, tanpa registrasi. Setiap transaksi otomatis terhitung ke rekap harian,
mingguan, dan bulanan dengan batas hari mengikuti zona waktu **Asia/Jakarta**
(minggu dimulai hari Senin).

## Fitur

| Kode | Fitur | Rute |
| ---- | ----- | ---- |
| F1 | Login dengan satu password (cookie sesi bertanda tangan) | `/login` |
| F2 | Tambah, ubah, hapus transaksi lewat dialog cepat + FAB | semua halaman |
| F3 | Kelola kategori (nama, warna) | `/kategori` |
| F4 | Rekap harian | `/harian` |
| F5 | Rekap mingguan (Senin–Minggu) + grafik batang 7 hari | `/mingguan` |
| F6 | Rekap bulanan + donut kategori, 5 transaksi terbesar, perbandingan bulan lalu | `/bulanan` |
| F7 | Beranda: ringkasan hari/minggu/bulan + 5 transaksi terakhir | `/` |
| F8 | Daftar semua transaksi dengan filter tanggal, kategori, pencarian catatan, dan paginasi | `/transaksi` |

Tampilan responsif (sidebar di desktop, bottom tab bar di ponsel), mendukung
mode gelap/terang yang mengikuti tema sistem, dan punya skeleton loading di
setiap rute data.

> **Screenshot:** tambahkan tangkapan layar ke `docs/screenshots/` lalu rujuk di
> sini (`![Beranda](docs/screenshots/beranda.png)`).

## Prasyarat

- **Node.js 20** (lihat `.nvmrc`) dan npm
- Database **PostgreSQL** — panduan ini memakai [Neon](https://neon.tech) (free tier cukup)

## Setup Lokal

```bash
# 1. Dependensi
npm install

# 2. Salin contoh environment
cp .env.example .env
```

Isi `.env`:

```bash
# 3. Database Neon — ambil dari dashboard Neon (Connection string)
#    DATABASE_URL memakai host *-pooler (PgBouncer), DIRECT_URL tanpa pooler.
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 4. Secret sesi (32 byte acak)
openssl rand -base64 32   # tempel hasilnya ke AUTH_SECRET

# 5. Hash password login
npm run hash-password      # masukkan password min. 12 karakter, tempel hasilnya ke APP_PASSWORD_HASH

# 6. URL publik
AUTH_URL="http://localhost:3000"
```

```bash
# 7. Terapkan skema database + isi kategori awal
npx prisma migrate dev
npm run db:seed

# 8. Jalankan
npm run dev
```

Buka <http://localhost:3000> — kamu akan diarahkan ke `/login`. Masuk dengan
password yang kamu hash pada langkah 5.

### Variabel Environment

| Variabel | Wajib | Keterangan |
| -------- | ----- | ---------- |
| `DATABASE_URL` | ya | Koneksi **pooled** untuk runtime serverless |
| `DIRECT_URL` | ya | Koneksi **direct**, dipakai `prisma migrate` dan seed |
| `AUTH_SECRET` | ya | Kunci HS256 untuk menandatangani cookie sesi |
| `APP_PASSWORD_HASH` | ya | Hash bcrypt dari password login (`npm run hash-password`) |
| `AUTH_URL` | ya | URL publik aplikasi (`http://localhost:3000` saat dev) |

## Perintah

```bash
npm run dev          # server pengembangan
npm run build        # prisma generate + next build
npm start            # jalankan hasil build
npm test             # unit test (Vitest)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:push      # dorong skema tanpa migration (prototyping)
npm run db:seed      # isi kategori awal (idempotent)
npm run hash-password # buat APP_PASSWORD_HASH
```

Gerbang mutu sebelum deploy — ketiganya harus lulus:

```bash
npm run lint && npx tsc --noEmit && npm test
```

## Struktur Proyek

```
src/
  app/
    (auth)/login/          halaman login
    (dashboard)/           beranda, harian, mingguan, bulanan, transaksi, kategori
                           + loading.tsx (skeleton) per rute
  components/
    charts/                grafik Recharts (batang harian, donut kategori)
    forms/                 form transaksi, kategori, login, filter
    layout/                app shell, navigasi, period nav, quick-add
    shared/                money, transaction row/list, empty state, skeleton
    ui/                    komponen shadcn/ui (varian @base-ui)
  lib/                     util murni: date (Asia/Jakarta), format, stats,
                           validators, transaction-filters, auth
  server/
    actions/               server actions (auth, transaksi, kategori)
    queries/               query Prisma (stats, transaksi, kategori)
prisma/                    schema + migration + seed
tests/                     unit test Vitest untuk util murni
docs/DEPLOY.md             panduan deploy ke Netlify + Neon
DECISIONS.md               catatan keputusan teknis
```

**Pemisahan penting:** logika yang bisa diuji (`src/lib/*`) tidak mengimpor
Prisma, sehingga unit test berjalan tanpa database. Query database hanya ada di
`src/server/queries/*` dan `src/server/actions/*`.

## Teknologi

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (@base-ui) ·
Recharts · Prisma · PostgreSQL (Neon) · Zod · react-hook-form · jose + bcryptjs ·
Vitest

## Deploy

Panduan lengkap langkah demi langkah ada di **[docs/DEPLOY.md](docs/DEPLOY.md)**
(Neon + Netlify). Ringkasnya: buat database Neon, jalankan
`npx prisma migrate deploy` dari lokal, seed sekali, lalu impor repo di Netlify
dan set lima variabel environment di atas.

**Live URL:** _belum di-deploy — isi setelah deploy pertama._

## Lisensi

Proyek pribadi, tidak dipublikasikan untuk dipakai ulang.
