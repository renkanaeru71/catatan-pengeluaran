import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";
import {
  addWeeks,
  toDateKey,
  todayJakarta,
  parseDateKey,
  weekRange,
} from "@/lib/date";
import { formatRangeLabel } from "@/lib/format";
import { getWeeklySummary } from "@/server/queries/stats-queries";
import { PeriodNav } from "@/components/layout/period-nav";
import { DailyBarChart } from "@/components/charts/daily-bar-chart";
import { CategoryBreakdown } from "@/components/charts/category-breakdown";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Rekap Mingguan — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

interface WeeklyPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function WeeklyPage({ searchParams }: WeeklyPageProps) {
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

  const { start, end } = weekRange(anchor);
  const prevAnchor = addWeeks(start, -1);
  const nextAnchor = addWeeks(start, 1);
  const isCurrentWeek =
    today.getTime() >= start.getTime() && today.getTime() <= end.getTime();
  const nextDisabled =
    isCurrentWeek || nextAnchor.getTime() > today.getTime();

  const summary = await getWeeklySummary(anchor);

  const chartData = summary.days.map((day, index) => ({
    label: DAY_LABELS[index] ?? "",
    total: day.total,
    dateKey: toDateKey(day.date),
  }));

  const todayKey = toDateKey(today);
  const highlightDateKey = isCurrentWeek ? todayKey : undefined;

  const hasSpending = summary.total > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rekap Mingguan</h1>
        <p className="text-muted-foreground text-sm">
          Pengeluaran per minggu, dihitung dari hari Senin sampai Minggu.
        </p>
      </div>

      <PeriodNav
        label={formatRangeLabel(start, end)}
        prevHref={`/mingguan?date=${toDateKey(prevAnchor)}`}
        nextHref={`/mingguan?date=${toDateKey(nextAnchor)}`}
        nextDisabled={nextDisabled}
        pickerBasePath="/mingguan"
        selectedDate={anchor}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 p-6">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Total Minggu Ini
            </span>
            <Money
              amount={summary.total}
              className="text-3xl font-bold tracking-tight"
            />
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
          {hasSpending ? (
            <>
              <DailyBarChart
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
              description="Minggu ini belum ada transaksi yang tercatat."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdown items={summary.byCategory} />
        </CardContent>
      </Card>
    </div>
  );
}
