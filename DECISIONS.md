# Keputusan Teknis

Catatan keputusan yang diambil saat implementasi, terutama di tempat PRD/desain
memberi ruang tafsir. Format: keputusan — alasan — konsekuensi bila keliru.

## 1. Auth.js diganti sesi cookie bertanda tangan

PRD menyebut "Auth.js (Credentials)", tetapi aplikasi hanya punya satu pemilik
dan tidak punya tabel user. Auth.js untuk kasus ini menambah dependency,
konfigurasi provider, dan risiko edge runtime di Netlify tanpa manfaat.

**Keputusan:** password tunggal dibandingkan dengan `APP_PASSWORD_HASH` (bcrypt),
lalu sesi disimpan di cookie HTTP-only bertanda tangan (`jose`, HS256, 30 hari).
`middleware.ts` memverifikasi token pada semua rute kecuali `/login`.

**Konsekuensi bila keliru:** kalau nanti butuh multi-user atau login Google,
perlu migrasi ke Auth.js/Lucia. Diterima karena PRD eksplisit single-user.

## 2. Rata-rata per hari memakai hari berjalan

Untuk minggu/bulan yang sedang berjalan, pembagi rata-rata adalah jumlah hari
yang sudah lewat (mis. tanggal 3 → dibagi 3), bukan 7/30. Untuk periode lampau,
pembagi adalah jumlah hari penuh periode tersebut.

**Alasan:** membagi dengan 30 pada tanggal 3 menghasilkan angka ~10× terlalu
kecil dan melanggar tujuan "angka yang jelas".

## 3. Perbandingan bulan lalu tanpa baseline menampilkan "-"

Bila total bulan sebelumnya 0, persentase tidak terdefinisi. UI menampilkan
`-` dengan label "belum ada data pembanding", bukan `Infinity`/`NaN`.

## 4. Seed kategori dijalankan sekali, bukan tiap build

`prisma/seed.ts` idempotent (`upsert` per nama) dan dijalankan manual sekali
saat menyiapkan database. Tidak dipanggil dari build Netlify, supaya kategori
yang sengaja dihapus pemilik tidak muncul kembali setiap deploy.

## 5. Tanggal transaksi adalah kalender murni

`Transaction.date` bertipe `@db.Date` (tanpa jam). Pengujian batas tengah malam
(23:59 vs 00:01 WIB) dilakukan pada fungsi konversi `toJakartaDateKey`, yang
memetakan waktu lokal WIB ke tanggal kalender yang benar.

## 6. Komponen shadcn/ui memakai @base-ui

Versi `shadcn` CLI terbaru memasang varian `base-nova` yang memakai
`@base-ui/react`, bukan Radix. Semua komponen UI mengikuti varian ini. Bila
sebuah komponen butuh API Radix, bungkus ulang di `src/components/ui/`.
