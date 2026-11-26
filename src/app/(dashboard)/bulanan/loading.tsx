import {
  PageHeaderSkeleton,
  PeriodNavSkeleton,
  StatCardsSkeleton,
  ChartCardSkeleton,
} from "@/components/shared/skeletons";

export default function BulananLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat rekap bulanan…</span>
      <PageHeaderSkeleton />
      <PeriodNavSkeleton />
      <StatCardsSkeleton count={2} />
      <ChartCardSkeleton height="h-56" />
      <div className="grid gap-3 sm:grid-cols-2">
        <ChartCardSkeleton height="h-48" />
        <ChartCardSkeleton height="h-48" />
      </div>
    </div>
  );
}
