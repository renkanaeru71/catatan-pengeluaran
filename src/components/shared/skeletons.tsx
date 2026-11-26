import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Page heading placeholder: title line plus a short description line. */
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64 max-w-full" />
    </div>
  );
}

/** Grid of summary cards (Beranda uses three, recaps use two). */
export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className={
        count === 3
          ? "grid gap-3 sm:grid-cols-3"
          : "grid gap-3 sm:grid-cols-2"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-2 p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Card wrapping a list of transaction rows. */
export function TransactionListSkeleton({
  rows = 5,
  title = true,
}: {
  rows?: number;
  title?: boolean;
}) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-2.5 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Placeholder for a chart card (weekly bars, monthly bars, donut). */
export function ChartCardSkeleton({ height = "h-56" }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
      </CardContent>
    </Card>
  );
}

/** Placeholder for the period header (label + prev/next controls). */
export function PeriodNavSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-1">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  );
}
