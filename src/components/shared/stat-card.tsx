import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/shared/money";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  amount: number;
  href: string;
  hint?: string;
  className?: string;
}

/** A period total on the dashboard, clickable through to that period's recap. */
export function StatCard({ label, amount, href, hint, className }: StatCardProps) {
  return (
    <Card className={cn("group relative transition-colors hover:bg-muted/40", className)}>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="text-muted-foreground/60 group-hover:text-foreground size-4 transition-colors"
          />
        </div>

        <Money amount={amount} className="text-xl font-bold tracking-tight" />

        {hint && <span className="text-muted-foreground text-xs">{hint}</span>}

        {/* Stretched link: the whole card is the click target. */}
        <Link href={href} className="absolute inset-0 rounded-xl">
          <span className="sr-only">{`Lihat rekap ${label}`}</span>
        </Link>
      </CardContent>
    </Card>
  );
}
