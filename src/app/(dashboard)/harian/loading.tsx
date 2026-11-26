import {
  PageHeaderSkeleton,
  PeriodNavSkeleton,
  StatCardsSkeleton,
  TransactionListSkeleton,
} from "@/components/shared/skeletons";

export default function HarianLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat rekap harian…</span>
      <PageHeaderSkeleton />
      <PeriodNavSkeleton />
      <StatCardsSkeleton count={1} />
      <TransactionListSkeleton rows={5} />
    </div>
  );
}
