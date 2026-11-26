import { prisma } from "@/lib/db";
import {
  todayJakarta,
  weekRange,
  monthRange,
  elapsedDaysInWeek,
  elapsedDaysInMonth,
  daysInMonth,
  addMonths,
  isSameMonth,
} from "@/lib/date";
import {
  computeAverage,
  computePercentChange,
  comparisonDirection,
  zeroFillDays,
  type CategoryTotal,
  type MonthComparison,
} from "@/lib/stats";
import type { TransactionWithCategory } from "@/server/queries/transaction-queries";

export {
  computeAverage,
  computePercentChange,
  comparisonDirection,
  zeroFillDays,
  type CategoryTotal,
  type MonthComparison,
};

const transactionSelect = {
  id: true,
  amount: true,
  date: true,
  note: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
} as const;

/** Aggregate sum for an arbitrary date range (inclusive). */
async function sumRange(start: Date, end: Date): Promise<number> {
  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { date: { gte: start, lte: end } },
  });
  return result._sum.amount ?? 0;
}

/** Daily totals grouped by date within a range, not yet zero-filled. */
async function dailyTotalsByRange(
  start: Date,
  end: Date,
): Promise<{ date: Date; total: number }[]> {
  const rows = await prisma.transaction.groupBy({
    by: ["date"],
    _sum: { amount: true },
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => ({
    date: r.date,
    total: r._sum.amount ?? 0,
  }));
}

/** Per-category totals within a range, joined with category name and color. */
async function categoryTotalsByRange(
  start: Date,
  end: Date,
): Promise<CategoryTotal[]> {
  const [groups, categories] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      where: { date: { gte: start, lte: end } },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.category.findMany({ select: { id: true, name: true, color: true } }),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  return groups
    .map((g) => {
      const cat = catMap.get(g.categoryId);
      return {
        categoryId: g.categoryId,
        name: cat?.name ?? "Lainnya",
        color: cat?.color ?? "#64748b",
        total: g._sum.amount ?? 0,
      };
    })
    .filter((c) => c.total > 0);
}

/** F4: Daily recap. Total and all transactions for a single calendar day. */
export async function getDailySummary(date: Date): Promise<{
  total: number;
  transactions: TransactionWithCategory[];
}> {
  const [total, transactions] = await Promise.all([
    sumRange(date, date),
    prisma.transaction.findMany({
      where: { date },
      select: transactionSelect,
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  return { total, transactions };
}

/** F5: Weekly recap (Monday..Sunday containing anchor). */
export async function getWeeklySummary(anchor: Date): Promise<{
  start: Date;
  end: Date;
  total: number;
  averagePerDay: number;
  days: { date: Date; total: number }[];
  byCategory: CategoryTotal[];
}> {
  const { start, end } = weekRange(anchor);
  const today = todayJakarta();

  // If this week contains today, divisor is elapsed days; otherwise full 7.
  const isCurrentWeek =
    anchor.getTime() >= start.getTime() && anchor.getTime() <= end.getTime() &&
    today.getTime() >= start.getTime() && today.getTime() <= end.getTime();

  const divisor = isCurrentWeek ? elapsedDaysInWeek(start, today) : 7;

  const [total, rawDays, byCategory] = await Promise.all([
    sumRange(start, end),
    dailyTotalsByRange(start, end),
    categoryTotalsByRange(start, end),
  ]);

  return {
    start,
    end,
    total,
    averagePerDay: computeAverage(total, divisor),
    days: zeroFillDays(start, end, rawDays),
    byCategory,
  };
}

/** F6: Monthly recap with mom comparison, per-day chart, category breakdown, top 5. */
export async function getMonthlySummary(anchor: Date): Promise<{
  start: Date;
  end: Date;
  total: number;
  averagePerDay: number;
  days: { date: Date; total: number }[];
  byCategory: CategoryTotal[];
  topTransactions: TransactionWithCategory[];
  comparison: MonthComparison;
}> {
  const { start, end } = monthRange(anchor);
  const today = todayJakarta();

  const isCurrentMonth = isSameMonth(anchor, today);
  const divisor = isCurrentMonth
    ? elapsedDaysInMonth(start, today)
    : daysInMonth(anchor);

  const prevAnchor = addMonths(anchor, -1);
  const prevRange = monthRange(prevAnchor);

  const [total, rawDays, byCategory, topTransactions, previousTotal] =
    await Promise.all([
      sumRange(start, end),
      dailyTotalsByRange(start, end),
      categoryTotalsByRange(start, end),
      prisma.transaction.findMany({
        where: { date: { gte: start, lte: end } },
        select: transactionSelect,
        orderBy: [{ amount: "desc" }, { date: "desc" }],
        take: 5,
      }),
      sumRange(prevRange.start, prevRange.end),
    ]);

  const percentChange = computePercentChange(total, previousTotal);

  return {
    start,
    end,
    total,
    averagePerDay: computeAverage(total, divisor),
    days: zeroFillDays(start, end, rawDays),
    byCategory,
    topTransactions,
    comparison: {
      previousTotal,
      percentChange,
      direction: comparisonDirection(percentChange),
    },
  };
}

/** F7: Beranda summary cards (today, this week, this month) + recent items. */
export async function getDashboardSummary(): Promise<{
  today: number;
  week: number;
  month: number;
  recent: TransactionWithCategory[];
}> {
  const now = todayJakarta();
  const week = weekRange(now);
  const month = monthRange(now);

  const [todayTotal, weekTotal, monthTotal, recent] = await Promise.all([
    sumRange(now, now),
    sumRange(week.start, week.end),
    sumRange(month.start, month.end),
    prisma.transaction.findMany({
      select: transactionSelect,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  return {
    today: todayTotal,
    week: weekTotal,
    month: monthTotal,
    recent,
  };
}
