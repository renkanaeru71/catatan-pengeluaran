import type { Metadata } from "next";
import { parseDateKey, todayJakarta, addDays, toDateKey, isSameDay } from "@/lib/date";
import { formatDateLabel } from "@/lib/format";
import { getDailySummary } from "@/server/queries/stats-queries";
import { getCategoryOptions } from "@/server/queries/category-queries";
import { PeriodNav } from "@/components/layout/period-nav";
import { TransactionList } from "@/components/shared/transaction-list";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { QuickAddInlineButton } from "@/components/layout/quick-add";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarX } from "lucide-react";

export const metadata: Metadata = {
  title: "Rekap Harian — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

interface DailyPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DailyPage({ searchParams }: DailyPageProps) {
  const params = await searchParams;
  const today = todayJakarta();

  let selectedDate = today;
  if (params.date) {
    try {
      selectedDate = parseDateKey(params.date);
    } catch {
      selectedDate = today;
    }
  }

  const prevDate = addDays(selectedDate, -1);
  const nextDate = addDays(selectedDate, 1);
  const isFutureOrToday =
    isSameDay(selectedDate, today) || selectedDate.getTime() > today.getTime();

  const [summary, categories] = await Promise.all([
    getDailySummary(selectedDate),
    getCategoryOptions(),
  ]);

  const dateLabel = formatDateLabel(selectedDate);
  const currentDateKey = toDateKey(selectedDate);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rekap Harian</h1>
        <p className="text-muted-foreground text-sm">
          Semua pengeluaran yang tercatat pada hari ini.
        </p>
      </div>

      <PeriodNav
        label={dateLabel}
        prevHref={`/harian?date=${toDateKey(prevDate)}`}
        nextHref={`/harian?date=${toDateKey(nextDate)}`}
        nextDisabled={isFutureOrToday}
        pickerBasePath="/harian"
        selectedDate={selectedDate}
      />

      <Card>
        <CardContent className="flex flex-col gap-1 p-6">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Total Pengeluaran
          </span>
          <Money
            amount={summary.total}
            className="text-3xl font-bold tracking-tight"
          />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Daftar Transaksi</h2>
          {summary.transactions.length > 0 && (
            <QuickAddInlineButton
              dateKey={currentDateKey}
              label="Tambah"
              variant="outline"
            />
          )}
        </div>

        {summary.transactions.length === 0 ? (
          <EmptyState
            icon={<CalendarX className="size-8" aria-hidden="true" />}
            title="Tidak ada transaksi"
            description={`Belum ada pengeluaran yang dicatat pada ${dateLabel}.`}
            action={
              <QuickAddInlineButton
                dateKey={currentDateKey}
                label="Tambah transaksi sekarang"
              />
            }
          />
        ) : (
          <TransactionList
            transactions={summary.transactions}
            categories={categories}
            showDate={false}
          />
        )}
      </section>
    </div>
  );
}
