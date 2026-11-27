# Mobile Sidebar Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti bottom navigation bar mobile menjadi slide-over side drawer (hamburger menu di header) agar tidak tertutup badge/watermark Netlify di layar HP, dan sesuaikan posisi tombol FAB tambah transaksi.

**Architecture:** 
1. Buat komponen `MobileDrawerNav` di `src/components/layout/nav.tsx` yang menggunakan overlay sheet/drawer dari sisi kiri layar dengan trigger tombol hamburger (`Menu`) di mobile header.
2. Hapus `BottomNav` dari mobile layout di `src/components/layout/app-shell.tsx`.
3. Pindahkan tombol trigger drawer ke header mobile (sebelah kiri logo/title atau di samping tema toggle).
4. Update `QuickAddFab` agar tidak menggantung di `bottom-20` (karena bottom bar sudah dihapus), melainkan di `bottom-6 right-6`.
5. Sesuaikan padding bawah konten utama (`pb-8` alih-alih `pb-28`).

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS, Lucide icons (`Menu`, `X`, `Wallet`).

---

### Task 1: Buat Mobile Drawer & Update Navigasi

**Files:**
- Modify: `src/components/layout/nav.tsx`
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/components/layout/quick-add.tsx`

- [ ] **Step 1: Implementasi `MobileSidebarDrawer` di `src/components/layout/nav.tsx`**
Tambahkan state open/close slide-over sheet samping kiri dengan menu navigasi lengkap, tombol close, dan backdrop klik-luar.

- [ ] **Step 2: Update `AppShell` di `src/components/layout/app-shell.tsx`**
Ganti `BottomNav` dengan tombol trigger `MobileSidebarDrawer` di mobile header. Ubah padding `pb-28` menjadi `pb-8`.

- [ ] **Step 3: Update `QuickAddFab` di `src/components/layout/quick-add.tsx`**
Ubah posisi dari `bottom-20` menjadi `bottom-6 right-6`.

- [ ] **Step 4: Verifikasi build dan test lokal**
Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: PASS

- [ ] **Step 5: Commit & Push**
```bash
git add src/components/layout/
git commit -m "feat(layout): replace mobile bottom nav with slide-over side drawer"
git push origin main
```
