import {
  PageHeaderSkeleton,
  PeriodNavSkeleton,
  StatCardsSkeleton,
  ChartCardSkeleton,
  TransactionListSkeleton,
} from "@/components/shared/skeletons";

export default function MingguanLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat rekap mingguan…</span>
      <PageHeaderSkeleton />
      <PeriodNavSkeleton />
      <StatCardsSkeleton count={2} />
      <ChartCardSkeleton height="h-56" />
      <TransactionListSkeleton rows={4} title={false} />
    </div>
  );
}
