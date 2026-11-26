import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TransactionListSkeleton,
} from "@/components/shared/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat ringkasan pengeluaran…</span>
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} />
      <TransactionListSkeleton rows={5} />
    </div>
  );
}
