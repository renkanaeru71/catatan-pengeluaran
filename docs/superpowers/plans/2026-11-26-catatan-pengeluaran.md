# Catatan Pengeluaran — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-owner Indonesian expense tracker (daily/weekly/monthly recaps) with Next.js 15 App Router, Prisma + Neon Postgres, deployed to Netlify.

**Architecture:** Next.js 15 App Router. Reads happen in Server Components via typed query functions in `src/server/queries`; writes happen through Server Actions in `src/server/actions` that re-validate Zod and check the session. Auth is a single bcrypt password compared against `APP_PASSWORD_HASH`, issuing a signed HTTP-only JWT cookie (`jose`) verified in `middleware.ts`. All money is integer rupiah; all day/week/month boundaries are computed in `Asia/Jakarta`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts, Prisma 6, PostgreSQL (Neon), Zod, React Hook Form, date-fns + date-fns-tz, jose, bcryptjs, next-themes, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-26-catatan-pengeluaran-design.md`

## Global Constraints

- Currency: IDR only, stored as integer rupiah (`amount Int`), never float. Display `Rp 25.000` via `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.
- Timezone: `Asia/Jakarta` for every day/week/month boundary. Week starts **Monday**. Never rely on server TZ.
- Transaction `date` is a pure calendar date (`@db.Date`).
- UI language: Indonesian. Dates display as `26 Nov 2026`.
- No secrets in repo. Env: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `APP_PASSWORD_HASH`, `AUTH_URL`.
- Every mutation = Server Action or Route Handler, with session check + Zod validation.
- `amount` input: integer > 0, formatted with thousands separators while typing. `note`: optional, max 140 chars.
- `npm run lint`, `npx tsc --noEmit`, `npm test` must pass.
- Node: `.nvmrc` = `20`; `netlify.toml` sets `NODE_VERSION = "20"`.
- No features outside PRD §5 (F1–F8). No income, no wallets, no budgets, no export.
- Default categories: Makan, Transport, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya.
- Files ≤ ~250 lines. One responsibility per file.

## Review Focus

1. **Midnight boundary** — a transaction entered at 23:59 WIB must land on that day, 00:01 WIB on the next; a naive `new Date().toISOString()` shifts it. Owned by Task 4.
2. **Week/month rollover consistency** — sum of 7 daily totals must equal the weekly total; sum of all days must equal the monthly total. Owned by Tasks 8 and 11.
3. **Period averages** — average/day must use elapsed days for the current week/month and full days for past periods, and never divide by zero. Owned by Tasks 4 and 8.
4. **Zero-baseline comparison** — month-over-month % when last month total is 0 must render `-`, not `Infinity`/`NaN`. Owned by Tasks 8 and 12.
5. **Empty database / no data** — a fresh install with zero transactions must show friendly empty states on all five data pages and never crash a chart. Owned by Tasks 9–13.

---

### Task 1: Project scaffold, tooling, and repo

**Files:**
- Create: `/Users/kikuy/Projects/catatan-pengeluaran/` (new git repo; **not** inside `~/Documents`, which is already a git repo)
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.nvmrc`, `.gitignore`, `.env.example`, `netlify.toml`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `docs/superpowers/specs/2026-11-26-catatan-pengeluaran-design.md` (copy of the approved spec), `DECISIONS.md`

**Interfaces:**
- Produces: a working `npm run dev`, `npm run lint`, `npx tsc --noEmit`, `npm test`, plus `@/` path alias → `src/`.

- [ ] **Step 1: Create project**

```bash
mkdir -p /Users/kikuy/Projects/catatan-pengeluaran && cd /Users/kikuy/Projects/catatan-pengeluaran
npx create-next-app@15 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm --yes
git init -b main
```

- [ ] **Step 2: Install dependencies**

```bash
npm i prisma @prisma/client zod react-hook-form @hookform/resolvers date-fns date-fns-tz jose bcryptjs recharts next-themes lucide-react sonner clsx tailwind-merge class-variance-authority
npm i -D vitest @vitejs/plugin-react tsx @types/bcryptjs prettier prettier-plugin-tailwindcss dotenv-cli
npx shadcn@latest init -d
npx shadcn@latest add button input label card dialog sheet select textarea badge separator skeleton alert alert-dialog dropdown-menu sonner calendar popover tabs
```

- [ ] **Step 3: Add scripts and config**

`package.json` scripts: `dev`, `build` = `prisma generate && next build`, `start`, `lint` = `next lint`, `typecheck` = `tsc --noEmit`, `test` = `vitest run`, `test:watch` = `vitest`, `db:push` = `prisma db push`, `db:seed` = `prisma db seed`, `hash-password` = `tsx scripts/hash-password.ts`, `postinstall` = `prisma generate`.

`.nvmrc` → `20`. `netlify.toml`:

```toml
[build]
  command = "prisma generate && next build"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

`.env.example` lists the five env vars with placeholder values and a comment on where to get each.

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

- [ ] **Step 4: Copy spec and write DECISIONS.md**

Copy the approved spec into `docs/superpowers/specs/`. `DECISIONS.md` records: Auth.js replaced by signed JWT cookie (single password, no user table); averages use elapsed days for current periods; month-over-month shows `-` when baseline is 0; seeding is a one-off manual step, not part of build.

- [ ] **Step 5: Verify**

Run: `npm run lint && npx tsc --noEmit && npm test -- --passWithNoTests`
Expected: all exit 0. `npm run dev` serves the default page on :3000.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js 15 app with tooling and Netlify config"
```

---

### Task 2: Prisma schema, client singleton, and seed

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/db.ts`

**Interfaces:**
- Produces: `prisma` (default export of `src/lib/db.ts`) — a `PrismaClient` singleton. Models `Category { id, name, color }` and `Transaction { id, categoryId, amount, date, note, createdAt, updatedAt }`.

- [ ] **Step 1: Write schema** exactly as the spec §5.1 (`binaryTargets = ["native", "rhel-openssl-3.0.x"]`, `directUrl = env("DIRECT_URL")`, `@@index([date])`).

- [ ] **Step 2: Write `src/lib/db.ts` singleton**

Export `const prisma`; reuse `globalThis.prisma` when `process.env.NODE_ENV !== "production"` so dev hot-reload does not exhaust connections.

- [ ] **Step 3: Write idempotent seed** in `prisma/seed.ts`

`upsert` each of the 8 default categories by `name` with a fixed color: Makan `#f59e0b`, Transport `#3b82f6`, Belanja `#8b5cf6`, Tagihan `#ef4444`, Hiburan `#ec4899`, Kesehatan `#10b981`, Pendidikan `#06b6d4`, Lainnya `#64748b`. Register `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json`.

- [ ] **Step 4: Verify against a real database**

With `DATABASE_URL`/`DIRECT_URL` in `.env`: `npx prisma migrate dev --name init` then `npm run db:seed`, then re-run `npm run db:seed`.
Expected: second run succeeds and `npx prisma studio` shows exactly 8 categories (idempotency proven).

- [ ] **Step 5: Commit**

```bash
git add prisma src/lib/db.ts package.json && git commit -m "feat: add prisma schema, client singleton, and idempotent category seed"
```

---

### Task 3: Formatting and validation primitives

**Files:**
- Create: `src/lib/format.ts`, `src/lib/validators.ts`
- Test: `tests/format.test.ts`, `tests/validators.test.ts`

**Interfaces:**
- Produces:
  - `formatRupiah(amount: number): string` → `"Rp 25.000"`
  - `parseRupiahInput(raw: string): number` → `25000` for `"25.000"`; `0` for non-digits
  - `formatRupiahInput(raw: string): string` → `"25.000"` for `"25000"`
  - `formatDateLabel(date: Date): string` → `"26 Nov 2026"`
  - `formatRangeLabel(start: Date, end: Date): string` → `"24–30 Nov 2026"` (same month) / `"30 Nov – 6 Des 2026"` (cross-month)
  - `transactionSchema` (Zod): `{ amount: number int positive, categoryId: string min 1, date: string YYYY-MM-DD, note?: string max 140 }`
  - `categorySchema` (Zod): `{ name: string min 1 max 40, color: string regex /^#[0-9a-fA-F]{6}$/ }`
  - `loginSchema` (Zod): `{ password: string min 12 }`

- [ ] **Step 1: Write failing tests** covering: `formatRupiah(25000) === "Rp 25.000"`, `formatRupiah(0) === "Rp 0"`, `parseRupiahInput("Rp 1.250.000") === 1250000`, `formatDateLabel(new Date("2026-11-26T00:00:00Z")) === "26 Nov 2026"`, same-month range `"24–30 Nov 2026"`, cross-month range `"30 Nov – 6 Des 2026"`, `transactionSchema` rejects `amount: 0`, `amount: 2.5`, `note` of 141 chars, and a non-`YYYY-MM-DD` date.

- [ ] **Step 2: Run to confirm failure** — `npm test` → FAIL (module not found).

- [ ] **Step 3: Implement** both modules. `formatRupiah` uses `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })` then normalizes the non-breaking space to a plain space. Month names come from a hardcoded `["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]` array (Indonesian, not `id-ID` month names, which produce "Nov." with a period).

- [ ] **Step 4: Run tests** — `npm test` → PASS.

- [ ] **Step 5: Commit** — `git commit -m "feat: add rupiah/date formatting and zod schemas"`

---

### Task 4: Asia/Jakarta date utilities

**Files:**
- Create: `src/lib/date.ts`
- Test: `tests/date.test.ts`

**Interfaces:**
- Produces:
  - `TZ = "Asia/Jakarta"`
  - `toJakartaDateKey(input: Date | string): string` → `"YYYY-MM-DD"` in WIB
  - `todayJakarta(): Date` → today's WIB calendar date at UTC midnight
  - `parseDateKey(key: string): Date` → `Date` at UTC midnight for that calendar date
  - `weekRange(anchor: Date): { start: Date; end: Date }` — Monday..Sunday, both UTC midnight, `end` = Sunday
  - `monthRange(anchor: Date): { start: Date; end: Date }` — first..last day of month
  - `addDays(d: Date, n: number): Date`, `addWeeks`, `addMonths`
  - `elapsedDaysInWeek(anchor: Date, today: Date): number` (1–7), `elapsedDaysInMonth(anchor: Date, today: Date): number`
  - `daysInWeek(anchor: Date): number` (always 7), `daysInMonth(anchor: Date): number` (28–31)
  - `eachDayOfRange(start: Date, end: Date): Date[]`
  - `isSameMonth(a: Date, b: Date): boolean`

- [ ] **Step 1: Write failing tests**, including the Review Focus cases:
  - `toJakartaDateKey(new Date("2026-11-26T16:59:00Z")) === "2026-11-26"` (23:59 WIB)
  - `toJakartaDateKey(new Date("2026-11-26T17:01:00Z")) === "2026-11-27"` (00:01 WIB)
  - `weekRange(new Date("2026-11-26T00:00:00Z"))` → start `2026-11-23`, end `2026-11-29` (Thu → Mon..Sun)
  - `weekRange` on a Sunday returns that same day as `end`, and on a Monday returns itself as `start`
  - `weekRange(new Date("2026-01-01T00:00:00Z"))` → start `2025-12-29`, end `2026-01-04` (year rollover)
  - `monthRange(new Date("2026-02-15T00:00:00Z"))` → `2026-02-01`..`2026-02-28`; leap year `2028-02` → `2028-02-29`
  - `elapsedDaysInWeek(weekOf("2026-11-23"), parseDateKey("2026-11-26")) === 4`
  - `elapsedDaysInMonth(parseDateKey("2026-11-01"), parseDateKey("2026-11-26")) === 26`
  - `eachDayOfRange` on a week returns exactly 7 dates in ascending order
  - `addMonths(parseDateKey("2026-01-31"), 1)` → `2026-02-28` (clamping, no overflow to March)

- [ ] **Step 2: Run to confirm failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement** using `date-fns` (`startOfWeek` with `{ weekStartsOn: 1 }`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `differenceInCalendarDays`) on UTC-midnight `Date` objects, plus `date-fns-tz`'s `toZonedTime`/`formatInTimeZone` only inside `toJakartaDateKey` and `todayJakarta`. All range functions must be pure and TZ-independent so they pass on any machine.

- [ ] **Step 4: Run tests** — `npm test` → PASS. Also run `TZ=America/New_York npm test` → still PASS (proves no server-TZ dependence).

- [ ] **Step 5: Commit** — `git commit -m "feat: add Asia/Jakarta date range utilities with boundary tests"`

---

### Task 5: Authentication (login, session cookie, middleware)

**Files:**
- Create: `src/lib/auth.ts`, `src/server/actions/auth-actions.ts`, `src/app/(auth)/login/page.tsx`, `src/components/forms/login-form.tsx`, `src/middleware.ts`, `scripts/hash-password.ts`
- Modify: `src/app/layout.tsx` (add `Toaster`)

**Interfaces:**
- Produces:
  - `SESSION_COOKIE = "session"`, `createSessionToken(): Promise<string>`, `verifySessionToken(token: string): Promise<boolean>`, `getSession(): Promise<boolean>` (reads `cookies()`), `requireSession(): Promise<void>` (throws/redirects if absent)
  - `loginAction(formData: FormData): Promise<{ error?: string }>` — sets the cookie on success
  - `logoutAction(): Promise<void>` — clears cookie, redirects to `/login`
  - `npm run hash-password` prompts for a password and prints the bcrypt hash

- [ ] **Step 1: Implement `src/lib/auth.ts`**

`jose` `SignJWT` with `HS256`, payload `{ sub: "owner" }`, `exp` 30 days, secret `process.env.AUTH_SECRET`. Cookie flags: `httpOnly`, `sameSite: "lax"`, `secure` in production, `path: "/"`, `maxAge` 30 days.

- [ ] **Step 2: Implement `loginAction`**

Validate with `loginSchema`; `bcrypt.compare(password, process.env.APP_PASSWORD_HASH!)`; on mismatch return `{ error: "Password salah." }` (no timing-leaking detail); on success set cookie and `redirect("/")`. Wrap in `try/catch` so `redirect()`'s throw is re-thrown, not swallowed.

- [ ] **Step 3: Implement `src/middleware.ts`**

`matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"]`. In the middleware, redirect to `/login` when `verifySessionToken` fails. Note in a comment: middleware runs on the Edge runtime, so `auth.ts` must not import Prisma or bcryptjs — keep bcrypt usage inside the Server Action only.

- [ ] **Step 4: Build the login page and form**

Centered card, app name, single password input with `type="password"`, `autoFocus`, `minLength={12}`, submit button with `useTransition` pending state, Indonesian error text via `sonner`. On success the action redirects.

- [ ] **Step 5: Verify manually**

`npm run dev`; open `/`, `/harian`, `/transaksi` in a private window → all redirect to `/login`. Log in with the password whose hash is in `.env` → lands on `/`. Reload `/login` while logged in → redirects to `/`. `curl -I http://localhost:3000/harian` → 307 to `/login`.

- [ ] **Step 6: Commit** — `git commit -m "feat: add single-password auth with signed session cookie and route middleware"`

---

### Task 6: Category management (F3)

**Files:**
- Create: `src/server/queries/category-queries.ts`, `src/server/actions/category-actions.ts`, `src/app/(dashboard)/kategori/page.tsx`, `src/components/forms/category-form.tsx`, `src/components/shared/confirm-dialog.tsx`, `src/components/shared/color-picker.tsx`
- Test: `tests/category-rules.test.ts`

**Interfaces:**
- Consumes: `prisma`, `categorySchema`, `requireSession`
- Produces:
  - `getCategories(): Promise<CategoryWithCount[]>` where `CategoryWithCount = { id, name, color, transactionCount: number }`
  - `createCategory(input): Promise<ActionResult>`, `updateCategory(id, input)`, `deleteCategory(id)`; `ActionResult = { ok: true } | { ok: false; error: string }`
  - `canDeleteCategory(transactionCount: number): boolean` (pure, testable)

- [ ] **Step 1: Write failing test** — `canDeleteCategory(0) === true`, `canDeleteCategory(3) === false`.

- [ ] **Step 2: Run to confirm failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement queries and actions**

`getCategories` uses `prisma.category.findMany({ include: { _count: { select: { transactions: true } } }, orderBy: { name: "asc" } })`. `deleteCategory` first counts transactions; if > 0 return `{ ok: false, error: "Kategori ini masih dipakai oleh N transaksi. Hapus atau pindahkan transaksinya dulu." }`. Duplicate name → catch Prisma `P2002` → `{ ok: false, error: "Nama kategori sudah ada." }`. Every action calls `requireSession()` and re-parses with `categorySchema`, then `revalidatePath` on `/kategori` and `/`.

- [ ] **Step 4: Build the page** — list of categories with a color swatch, transaction count, edit and delete buttons; delete opens `ConfirmDialog`; "Tambah Kategori" opens a dialog with name + color picker (8 preset swatches). Empty state when no categories.

- [ ] **Step 5: Verify manually** — add "Kopi", rename to "Ngopi", try deleting a category with transactions (blocked with the message), delete "Ngopi" (succeeds).

- [ ] **Step 6: Commit** — `git commit -m "feat: add category CRUD with in-use delete guard"`

---

### Task 7: Transaction CRUD (F2)

**Files:**
- Create: `src/server/queries/transaction-queries.ts`, `src/server/actions/transaction-actions.ts`, `src/components/forms/transaction-form.tsx`, `src/components/forms/amount-input.tsx`, `src/components/shared/transaction-list.tsx`, `src/components/shared/transaction-row.tsx`, `src/components/layout/add-transaction-button.tsx`, `src/components/layout/app-shell.tsx`
- Test: `tests/amount-input.test.ts`

**Interfaces:**
- Consumes: `prisma`, `transactionSchema`, `formatRupiah`, `parseRupiahInput`, `formatRupiahInput`, `getCategories`, `requireSession`
- Produces:
  - `createTransaction(input): Promise<ActionResult>`, `updateTransaction(id, input)`, `deleteTransaction(id)`
  - `getTransactionsByRange(start: Date, end: Date): Promise<TransactionWithCategory[]>` where `TransactionWithCategory = { id, amount, date: Date, note: string | null, category: { id, name, color } }`, ordered `date desc, createdAt desc`
  - `getRecentTransactions(limit: number)`
  - `addTransactionHref(dateKey?: string): string`

- [ ] **Step 1: Write failing test** for the amount input reducer: typing `"25000"` yields display `"25.000"` and value `25000`; typing `"25.000"` then backspace yields `"2.500"` → 2500; empty input → value `0`; letters are stripped.

- [ ] **Step 2: Run to confirm failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement actions**

All three call `requireSession()` + `transactionSchema.parse`, convert `date` with `parseDateKey`, `revalidatePath("/", "layout")` (so every recap page refreshes), and map Prisma errors to Indonesian messages.

- [ ] **Step 4: Implement `TransactionForm`**

React Hook Form + Zod resolver. Fields: amount (custom `AmountInput` with `inputMode="numeric"`), category (Select with color dots), date (`<input type="date">` defaulting to `todayJakarta()`), note (Textarea with a live `140` counter). Submits via `startTransition`, closes the sheet on success, shows a `sonner` toast "Transaksi tersimpan". On mobile the container is a bottom `Sheet`; on desktop a `Dialog`.

- [ ] **Step 5: Implement `AppShell` + FAB**

`AppShell` renders the sidebar on `md:` and the bottom tab bar below `md` (Beranda, Harian, Mingguan, Bulanan, Lainnya), plus a FAB `+` fixed bottom-right on mobile and a "+ Tambah" button in the header on desktop. Both open the transaction form. Active route highlighted via `usePathname`.

- [ ] **Step 6: Verify manually** — add `25.000` Makan today with a note; it appears immediately in the list without a full reload; edit the amount; delete it with confirmation.

- [ ] **Step 7: Commit** — `git commit -m "feat: add transaction CRUD with amount input and app shell navigation"`

---

### Task 8: Aggregation queries

**Files:**
- Create: `src/server/queries/stats-queries.ts`
- Test: `tests/aggregation.test.ts`

**Interfaces:**
- Consumes: `prisma`, `weekRange`, `monthRange`, `eachDayOfRange`, `elapsedDaysInWeek`, `elapsedDaysInMonth`, `daysInMonth`, `toJakartaDateKey`
- Produces:
  - `getDailySummary(date: Date): Promise<{ total: number; transactions: TransactionWithCategory[] }>`
  - `getWeeklySummary(anchor: Date): Promise<{ total: number; averagePerDay: number; days: { date: Date; total: number }[]; byCategory: CategoryTotal[] }>` — `days` always length 7, zero-filled
  - `getMonthlySummary(anchor: Date): Promise<{ total: number; averagePerDay: number; days: { date: Date; total: number }[]; byCategory: CategoryTotal[]; topTransactions: TransactionWithCategory[]; comparison: MonthComparison }>`
  - `getDashboardSummary(): Promise<{ today: number; week: number; month: number; recent: TransactionWithCategory[] }>`
  - `CategoryTotal = { categoryId: string; name: string; color: string; total: number }`
  - `MonthComparison = { previousTotal: number; percentChange: number | null; direction: "up" | "down" | "same" | "none" }`
  - `computePercentChange(current: number, previous: number): number | null` (pure, exported for tests)
  - `computeAverage(total: number, divisor: number): number` (pure, exported for tests)
  - `zeroFillDays(start: Date, end: Date, rows: { date: Date; total: number }[]): { date: Date; total: number }[]` (pure, exported for tests)

- [ ] **Step 1: Write failing tests** for the three pure helpers:
  - `computePercentChange(150000, 100000) === 50`, `computePercentChange(50000, 100000) === -50`, `computePercentChange(0, 0) === null`, `computePercentChange(1000, 0) === null`
  - `computeAverage(700000, 7) === 100000`, `computeAverage(0, 7) === 0`, `computeAverage(100, 0) === 0`
  - `zeroFillDays(week start, week end, [{date: start+1day, total: 5000}])` → length 7, index 1 total 5000, all others 0
  - Consistency invariant as a test on fixtures: sum of `zeroFillDays(...).map(d => d.total)` equals the period total.

- [ ] **Step 2: Run to confirm failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement**

Totals via `prisma.transaction.aggregate({ _sum: { amount: true }, where: { date: { gte: start, lte: end } } })`. Per-day via `prisma.transaction.groupBy({ by: ["date"], _sum: { amount: true }, where })` then `zeroFillDays`. Per-category via `groupBy({ by: ["categoryId"] })` joined with `getCategories()` for name/color. Weekly `averagePerDay` divisor: `isCurrentWeek ? elapsedDaysInWeek(...) : 7`. Monthly divisor: `isCurrentMonth ? elapsedDaysInMonth(...) : daysInMonth(...)`. `comparison` uses `previousTotal` from the previous month's range and `computePercentChange`; `direction` = `"none"` when `percentChange === null`, `"same"` when `0`.

- [ ] **Step 4: Run tests** — `npm test` → PASS.

- [ ] **Step 5: Commit** — `git commit -m "feat: add daily/weekly/monthly aggregation queries"`

---

### Task 9: Dashboard (F7)

**Files:**
- Create: `src/app/(dashboard)/page.tsx`, `src/components/shared/stat-card.tsx`, `src/components/shared/empty-state.tsx`, `src/components/shared/money.tsx`, `src/components/shared/transaction-row.tsx` (if not created in Task 7)

**Interfaces:**
- Consumes: `getDashboardSummary`, `formatRupiah`, `formatDateLabel`, `Money`, `EmptyState`

- [ ] **Step 1: Build the page** — three `StatCard`s (Hari ini / Minggu ini / Bulan ini) linking to `/harian`, `/mingguan`, `/bulanan`, then "5 Transaksi Terakhir" using `TransactionRow`. Wrapped in `<Suspense>` with a skeleton fallback. `export const dynamic = "force-dynamic"`.

- [ ] **Step 2: Verify empty state** — with zero transactions, cards show `Rp 0` and the list shows "Belum ada transaksi. Tekan tombol + untuk mulai mencatat." No crash.

- [ ] **Step 3: Verify against real data** — amounts on the dashboard match the recap pages.

- [ ] **Step 4: Commit** — `git commit -m "feat: add dashboard with period summaries and recent transactions"`

---

### Task 10: Daily view (F4)

**Files:**
- Create: `src/app/(dashboard)/harian/page.tsx`, `src/components/layout/period-nav.tsx`

**Interfaces:**
- Consumes: `getDailySummary`, `formatDateLabel`, `addDays`, `parseDateKey`, `todayJakarta`
- Produces: `PeriodNav` with props `{ prevHref, nextHref, label, nextDisabled?: boolean }` — reusable by Tasks 11 and 12.

- [ ] **Step 1: Build the page** — reads `searchParams.date` (fallback `todayJakarta()`); header shows the formatted date with prev/next arrows and a date picker popover; a big total card; the transaction list for that day with edit/delete. `next` disabled when the selected date is today.

- [ ] **Step 2: Verify** — navigate across a month boundary; a transaction at 23:59 WIB appears under the correct day; empty day shows a friendly empty state with an "Tambah transaksi" CTA.

- [ ] **Step 3: Commit** — `git commit -m "feat: add daily recap page"`

---

### Task 11: Weekly view (F5)

**Files:**
- Create: `src/app/(dashboard)/mingguan/page.tsx`, `src/components/charts/daily-bar-chart.tsx`, `src/components/charts/category-breakdown.tsx`

**Interfaces:**
- Consumes: `getWeeklySummary`, `weekRange`, `formatRangeLabel`, `PeriodNav`
- Produces: `DailyBarChart` props `{ data: { label: string; total: number; dateKey: string }[] }` — clicking a bar routes to `/harian?date=<dateKey>`; `CategoryBreakdown` props `{ items: CategoryTotal[] }` — horizontal bars with color dots and percentages.

- [ ] **Step 1: Build the page** — week nav with label `24–30 Nov 2026`, total card, average/day card (labelled "Rata-rata/hari"), 7-bar Recharts chart in `ResponsiveContainer`, category breakdown. `export const dynamic = "force-dynamic"`.

- [ ] **Step 2: Verify the invariant** — for a fully populated week, the seven bar values sum to the displayed weekly total (compare manually against `/harian` for each day).

- [ ] **Step 3: Verify interaction** — clicking the Thursday bar opens `/harian?date=<that Thursday>`.

- [ ] **Step 4: Commit** — `git commit -m "feat: add weekly recap with daily bar chart and category breakdown"`

---

### Task 12: Monthly view (F6)

**Files:**
- Create: `src/app/(dashboard)/bulanan/page.tsx`, `src/components/charts/monthly-daily-chart.tsx`, `src/components/charts/category-donut.tsx`, `src/components/shared/month-comparison.tsx`

**Interfaces:**
- Consumes: `getMonthlySummary`, `monthRange`, `formatRupiah`, `PeriodNav`, `CategoryBreakdown`
- Produces: `CategoryDonut` props `{ items: CategoryTotal[] }`; `MonthComparison` props `{ comparison: MonthComparison }`.

- [ ] **Step 1: Build the page** — month nav labelled `November 2026`; total, average/day, donut, per-day line/bar chart, "5 Transaksi Terbesar" list, and `MonthComparison` rendering `↑ 12% dari bulan lalu` / `↓ 8%` / `Sama dengan bulan lalu` / `-` (no baseline).

- [ ] **Step 2: Verify zero-baseline** — pick a month whose predecessor has no transactions; the comparison renders `-` and no `NaN`/`Infinity` appears anywhere.

- [ ] **Step 3: Verify** — the donut's segment values sum to the monthly total; the top-5 list is sorted descending.

- [ ] **Step 4: Commit** — `git commit -m "feat: add monthly recap with donut chart, top transactions, and comparison"`

---

### Task 13: Transaction list with filters (F8)

**Files:**
- Create: `src/app/(dashboard)/transaksi/page.tsx`, `src/server/queries/transaction-queries.ts` (extend), `src/components/forms/transaction-filters.tsx`
- Test: `tests/filters.test.ts`

**Interfaces:**
- Produces:
  - `searchTransactions(params: { from?: string; to?: string; categoryId?: string; q?: string; page: number; pageSize: number }): Promise<{ items: TransactionWithCategory[]; total: number; pageCount: number }>`
  - `buildTransactionWhere(params): Prisma.TransactionWhereInput` (pure, exported for tests)
  - `PAGE_SIZE = 20`

- [ ] **Step 1: Write failing test** — `buildTransactionWhere({})` has no `date`/`categoryId`/`note` keys; with `from`/`to` it produces `date: { gte, lte }`; with `q: "kopi"` it produces `note: { contains: "kopi", mode: "insensitive" }`.

- [ ] **Step 2: Run to confirm failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement query + actions**

`findMany` with `skip`/`take`, `include: { category: true }`, `orderBy: [{ date: "desc" }, { createdAt: "desc" }]`, plus `count` for `pageCount`.

- [ ] **Step 4: Build the page** — filter bar (date range, category select, search input debounced 300 ms, "Reset"), paginated list with prev/next and "Halaman X dari Y", URL-driven state via `searchParams`. Empty state distinguishes "belum ada transaksi" from "tidak ada hasil untuk filter ini".

- [ ] **Step 5: Verify** — search `kopi` finds only matching notes; combined date+category filter narrows correctly; page 2 shows different rows.

- [ ] **Step 6: Commit** — `git commit -m "feat: add transaction list with filters, search, and pagination"`

---

### Task 14: Polish — dark mode, loading states, a11y, mobile pass

**Files:**
- Create: `src/app/(dashboard)/loading.tsx`, `src/app/(dashboard)/harian/loading.tsx`, `src/app/(dashboard)/mingguan/loading.tsx`, `src/app/(dashboard)/bulanan/loading.tsx`, `src/app/(dashboard)/transaksi/loading.tsx`, `src/components/ui/theme-provider.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, all pages as needed

**Interfaces:**
- Consumes: `next-themes`

- [ ] **Step 1: Dark mode** — `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`; verify no flash on load.

- [ ] **Step 2: Skeletons** — one `loading.tsx` per data route using the shadcn `Skeleton`, shaped like the real content.

- [ ] **Step 3: Accessibility pass** — every input has a `<label>`; focus rings visible in both themes; icon-only buttons get `aria-label`; the FAB has `aria-label="Tambah transaksi"`; dialogs trap focus (Radix default) and close on Esc.

- [ ] **Step 4: Mobile pass** — test at 375 px: bottom nav does not overlap content (add `pb-20` to the shell), FAB does not cover the last row, sheet is usable one-handed, no horizontal scroll on any page.

- [ ] **Step 5: Verify** — `npm run lint && npx tsc --noEmit && npm test` all pass; toggling the OS theme switches the app; Lighthouse mobile performance on `/` reports LCP < 2 s.

- [ ] **Step 6: Commit** — `git commit -m "feat: add dark mode, loading skeletons, and accessibility polish"`

---

### Task 15: README, DECISIONS, and Netlify deployment

**Files:**
- Create: `README.md`, `docs/DEPLOY.md`
- Modify: `DECISIONS.md`, `netlify.toml`

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Write `README.md`** — what the app is, screenshots placeholder, prerequisites (Node 20, npm), local setup (`cp .env.example .env`, fill values, `npm i`, `npx prisma migrate dev`, `npm run db:seed`, `npm run dev`), how to generate `APP_PASSWORD_HASH` and `AUTH_SECRET`, test/lint commands, project structure, link to `docs/DEPLOY.md`.

- [ ] **Step 2: Write `docs/DEPLOY.md`** — the exact Netlify sequence: create GitHub repo → push → Neon project (pooled + direct URLs) → `npx prisma migrate deploy` from local against the Neon direct URL → `npm run db:seed` once → Netlify "Import from Git" → set the five env vars → deploy → post-deploy verification checklist (login, add transaction, check three recap pages, check midnight-boundary case).

- [ ] **Step 3: Run the full gate** — `npm run lint && npx tsc --noEmit && npm test` → all pass. `npm run build` locally against the Neon database → succeeds.

- [ ] **Step 4: Commit and push**

```bash
git add -A && git commit -m "docs: add README and Netlify deployment guide"
git remote add origin <github-url> && git push -u origin main
```

- [ ] **Step 5: Deploy and verify live** — follow `docs/DEPLOY.md` end to end; confirm the live URL opens `/login`, login works, and the three recap pages show correct totals. Record the live URL in `README.md`.

---

## Self-Review Notes

- **Spec coverage:** F1 → Task 5; F2 → Task 7; F3 → Task 6; F4 → Task 10; F5 → Task 11; F6 → Task 12; F7 → Task 9; F8 → Task 13; §6 model → Task 2; §8 UI/UX → Tasks 1, 7, 14; §9 non-functional → Tasks 4, 8, 14, 15; §10 deploy → Tasks 1, 15; §11 folders → Tasks 1–8; §12 milestones → mapped 1:1.
- **Type consistency:** `TransactionWithCategory`, `CategoryTotal`, `MonthComparison`, `ActionResult` are defined once (Tasks 7, 8, 6) and consumed by name elsewhere. `PeriodNav` is defined in Task 10 and consumed by 11 and 12, so Task 10 must land first.
- **Ordering dependency:** Task 10 creates `PeriodNav`; if Task 11 is executed before Task 10, extract `PeriodNav` first.
