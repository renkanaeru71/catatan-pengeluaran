# Panduan Deploy: Neon + Netlify

Urutan ini ditulis untuk deploy pertama kali. Ikuti dari atas ke bawah.

Ringkasan alur:

```
GitHub repo  →  Neon (database)  →  migrate + seed dari lokal
             →  Netlify (hosting)  →  set env vars  →  deploy  →  verifikasi
```

---

## 1. Siapkan repositori GitHub

```bash
cd catatan-pengeluaran
git status                 # pastikan bersih
git remote add origin git@github.com:<username>/catatan-pengeluaran.git
git push -u origin main
```

Pastikan `.env` **tidak** ikut ter-commit. Cek dengan `git ls-files | grep env` —
hanya `.env.example` yang boleh muncul.

---

## 2. Buat database Neon

1. Daftar di <https://neon.tech> → **New Project**.
2. Pilih region terdekat (mis. **Singapore / ap-southeast-1**) supaya latensi ke
   Indonesia rendah.
3. Buka **Connection Details** dan salin **dua** connection string:

| Jenis | Host | Dipakai untuk | Env var |
| ----- | ---- | ------------- | ------- |
| **Pooled** | `ep-xxx-pooler.<region>.aws.neon.tech` | runtime serverless Netlify | `DATABASE_URL` |
| **Direct** | `ep-xxx.<region>.aws.neon.tech` | `prisma migrate` & seed | `DIRECT_URL` |

Keduanya butuh `?sslmode=require`. Connection string Neon sudah menyertakannya —
jangan dihapus.

> **Kenapa dua URL?** Netlify Functions berjalan sebagai banyak instance
> serverless. Koneksi pooled (PgBouncer) mencegah kehabisan slot koneksi
> Postgres. Tapi PgBouncer tidak mendukung prepared statement yang dipakai
> Prisma Migrate, jadi migrasi harus lewat koneksi direct.

---

## 3. Terapkan skema dari lokal

Jalankan dari mesin lokal, **bukan** dari Netlify. Ini memastikan database siap
sebelum deploy pertama.

```bash
# .env lokal sementara diarahkan ke Neon (boleh pakai project Neon yang sama
# dengan production, atau project terpisah untuk staging)
export DATABASE_URL="postgresql://...-pooler...neondb?sslmode=require"
export DIRECT_URL="postgresql://...neondb?sslmode=require"

npx prisma migrate deploy     # menerapkan semua migration yang ada
npm run db:seed               # isi 8 kategori awal (idempotent, aman diulang)
```

Verifikasi:

```bash
npx prisma studio             # buka UI, pastikan tabel Category berisi 8 baris
```

> `prisma migrate deploy` hanya menjalankan migration yang sudah ada; ia tidak
> membuat migration baru. Kalau kamu mengubah `schema.prisma`, buat migration
> dengan `npx prisma migrate dev` di lokal dulu, commit folder
> `prisma/migrations/`, baru deploy.

---

## 4. Hubungkan Netlify

1. Buka <https://app.netlify.com> → **Add new site** → **Import an existing project**.
2. Pilih **GitHub** → pilih repo `catatan-pengeluaran`.
3. Netlify membaca `netlify.toml`, jadi biarkan isian build apa adanya:
   - **Build command:** `prisma generate && next build`
   - **Publish directory:** _(kosongkan — plugin Next.js yang mengurus)_
   - **Node version:** `20` (dari `[build.environment]`)
4. Jangan klik deploy dulu. Set environment variables lebih dulu (langkah 5).

---

## 5. Set environment variables di Netlify

**Site configuration → Environment variables → Add a variable** (atau
**Import from a .env file** untuk mengunggah sekaligus).

| Key | Value |
| --- | ----- |
| `DATABASE_URL` | connection string **pooled** dari langkah 2 |
| `DIRECT_URL` | connection string **direct** dari langkah 2 |
| `AUTH_SECRET` | hasil `openssl rand -base64 32` |
| `APP_PASSWORD_HASH` | hasil `npm run hash-password` (password min. 12 karakter) |
| `AUTH_URL` | `https://<nama-site>.netlify.app` |

Catatan:

- `AUTH_SECRET` dan `APP_PASSWORD_HASH` **jangan** dibuat ulang tiap deploy —
  kalau berubah, semua sesi lama langsung tidak valid dan kamu harus login ulang.
- `AUTH_URL` harus **tanpa** trailing slash.
- Tandai variabel sebagai *secret* bila Netlify menawarkan opsi itu.
- Kalau nanti memakai domain kustom, perbarui `AUTH_URL` lalu **redeploy**.

---

## 6. Deploy

Klik **Deploy site**. Build pertama biasanya 2–4 menit (Prisma generate +
`next build`).

Kalau build gagal, cek **Deploys → [deploy] → Deploy log**. Penyebab paling umum:

| Gejala di log | Penyebab | Perbaikan |
| ------------- | -------- | --------- |
| `Environment variable not found: DATABASE_URL` | env var belum diset | ulangi langkah 5, lalu **Clear cache and deploy site** |
| `P1001: Can't reach database server` | salah host / IP allowlist | pastikan pakai host `-pooler` untuk `DATABASE_URL` |
| `Prisma Client could not locate the Query Engine` | `prisma generate` tidak jalan | pastikan build command memuat `prisma generate` (sudah ada di `netlify.toml`) |
| Halaman 500 setelah deploy sukses | tabel belum ada | jalankan langkah 3 terhadap database production |

---

## 7. Verifikasi pasca-deploy

Kerjakan berurutan di URL production:

1. **Redirect login** — buka `/` di jendela privat. Harus diarahkan ke `/login`.
2. **Login** — masukkan password. Salah password → pesan error, bukan 500.
   Password benar → masuk ke Beranda.
3. **Tambah transaksi** — tekan **Tambah**, isi nominal (mis. `25000`), pilih
   kategori, simpan. Toast sukses muncul dan transaksi tampil di Beranda.
4. **Rekap harian** — buka `/harian`. Total harus sama dengan nominal yang baru
   dicatat.
5. **Rekap mingguan** — buka `/mingguan`. Grafik batang harus memuat hari ini
   dengan tinggi sebanding; klik batang → pindah ke `/harian?date=<hari itu>`.
6. **Rekap bulanan** — buka `/bulanan`. Donut + total harus konsisten, dan
   "5 Transaksi Terbesar" terurut menurun.
7. **Filter transaksi** — buka `/transaksi`, coba pencarian catatan dan filter
   kategori; URL ikut berubah dan hasil menyempit.
8. **Uji batas tengah malam WIB** — catat transaksi bertanggal kemarin dan hari
   ini lewat pemilih tanggal, lalu pastikan masing-masing masuk ke rekap harian
   yang benar (bukan bergeser satu hari).
9. **Mode gelap** — klik ikon tema di kanan atas; seluruh halaman berubah tanpa
   kilatan putih saat reload.
10. **Mobile** — buka di ponsel (atau DevTools 375 px): bottom tab bar tidak
    menutupi konten, FAB bisa dijangkau ibu jari, tidak ada scroll horizontal.

Kalau semua lolos, catat URL production di `README.md`:

```markdown
**Live URL:** https://<nama-site>.netlify.app
```

lalu commit dan push.

---

## 8. Deploy berikutnya

Setiap `git push` ke `main` memicu deploy otomatis. Yang perlu diingat:

- **Perubahan skema** → buat migration di lokal (`npx prisma migrate dev`), commit
  folder `prisma/migrations/`, lalu jalankan `npx prisma migrate deploy` ke
  database production **sebelum** atau **sesaat setelah** push. Netlify tidak
  menjalankan migrasi otomatis.
- **Jangan** menambahkan `prisma migrate deploy` ke build command Netlify:
  banyak instance build bisa berjalan paralel dan saling mengunci saat migrasi.
- **Jangan** menambahkan `db:seed` ke build command: seed akan mengembalikan
  kategori yang sengaja kamu hapus.

## 9. Rollback

- **Kode:** Netlify → **Deploys** → pilih deploy terakhir yang sehat → **Publish deploy**.
- **Database:** Neon menyimpan riwayat. Buka **Branches** → buat branch dari
  titik waktu sebelum perubahan bermasalah, lalu arahkan `DATABASE_URL` ke
  branch tersebut.
