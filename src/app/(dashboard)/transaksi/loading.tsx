import {
  PageHeaderSkeleton,
  TransactionListSkeleton,
} from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function TransaksiLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat daftar transaksi…</span>
      <PageHeaderSkeleton />

      {/* Filter box skeleton */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <Skeleton className="h-9 w-full rounded-md" />
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>

      <TransactionListSkeleton rows={8} title={false} />
    </div>
  );
}
