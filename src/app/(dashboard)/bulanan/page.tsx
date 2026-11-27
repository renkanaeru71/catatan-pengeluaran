import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";
import {
  addMonths,
  toDateKey,
  todayJakarta,
  parseDateKey,
  monthRange,
  isSameMonth,
} from "@/lib/date";
import { formatDateLabel, formatMonthLabel } from "@/lib/format";
import { getMonthlySummary } from "@/server/queries/stats-queries";
import { PeriodNav } from "@/components/layout/period-nav";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { MonthlyDailyChart } from "@/components/charts/monthly-daily-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { MonthComparisonBadge } from "@/components/shared/month-comparison";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Rekap Bulanan — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

interface MonthlyPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const params = await searchParams;
  const today = todayJakarta();

  let anchor = today;
  if (params.date) {
    try {
      anchor = parseDateKey(params.date);
    } catch {
      anchor = today;
    }
  }

  const { start } = monthRange(anchor);
  const prevAnchor = addMonths(anchor, -1);
  const nextAnchor = addMonths(anchor, 1);
  const nextDisabled = isSameMonth(anchor, today) || start.getTime() > today.getTime();

  const summary = await getMonthlySummary(anchor);

  const chartData = summary.days.map((day) => ({
    label: String(day.date.getUTCDate()),
    total: day.total,
    dateKey: toDateKey(day.date),
  }));

  const highlightDateKey = isSameMonth(anchor, today)
    ? toDateKey(today)
    : undefined;

  const monthLabel = formatMonthLabel(anchor);

  const pdfData = {
    periodLabel: monthLabel,
    total: summary.total,
    averagePerDay: summary.averagePerDay,
    days: summary.days.map((d) => ({
      dateLabel: formatDateLabel(d.date),
      total: d.total,
    })),
    categories: summary.byCategory.map((c) => ({
      name: c.name,
      total: c.total,
      percentage: summary.total > 0 ? Math.round((c.total / summary.total) * 100) : 0,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rekap Bulanan</h1>
          <p className="text-muted-foreground text-sm">
            Ringkasan pengeluaran per bulan beserta perbandingannya.
          </p>
        </div>
        <div>
          <ExportPdfButton
            type="monthly"
            data={pdfData}
            filename={`laporan-bulanan-${toDateKey(start).slice(0, 7)}`}
          />
        </div>
      </div>

      <PeriodNav
        label={monthLabel}
        prevHref={`/bulanan?date=${toDateKey(prevAnchor)}`}
        nextHref={`/bulanan?date=${toDateKey(nextAnchor)}`}
        nextDisabled={nextDisabled}
        pickerBasePath="/bulanan"
        selectedDate={anchor}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 p-6">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Total Bulan Ini
            </span>
            <Money
              amount={summary.total}
              className="text-3xl font-bold tracking-tight"
            />
            <MonthComparisonBadge comparison={summary.comparison} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 p-6">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Rata-rata/hari
            </span>
            <Money
              amount={summary.averagePerDay}
              className="text-3xl font-bold tracking-tight"
            />
            <span className="text-muted-foreground text-xs">
              Dihitung dari hari yang sudah berjalan
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengeluaran Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.total > 0 ? (
            <>
              <MonthlyDailyChart
                data={chartData}
                highlightDateKey={highlightDateKey}
              />
              <p className="text-muted-foreground mt-2 text-center text-xs">
                Ketuk batang untuk melihat rekap harinya.
              </p>
            </>
          ) : (
            <EmptyState
              icon={<CalendarRange className="size-8" aria-hidden="true" />}
              title="Belum ada pengeluaran"
              description={`Belum ada transaksi pada ${formatMonthLabel(anchor)}.`}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Porsi per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDonut items={summary.byCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">5 Transaksi Terbesar</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topTransactions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Belum ada transaksi pada bulan ini.
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {summary.topTransactions.map((tx) => (
                  <li key={tx.id} className="flex items-center gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground w-4 shrink-0 text-xs font-semibold tabular-nums"
                    >
                      {summary.topTransactions.indexOf(tx) + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: tx.category.color }}
                        />
                        <span className="truncate font-medium">
                          {tx.category.name}
                        </span>
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {tx.note || "Tanpa catatan"} · {formatDateLabel(tx.date)}
                      </span>
                    </span>
                    <Money amount={tx.amount} className="shrink-0 font-medium" />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
