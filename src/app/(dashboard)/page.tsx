import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { getDashboardSummary } from "@/server/queries/stats-queries";
import { formatDateLabel } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionRow } from "@/components/shared/transaction-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Beranda — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Beranda</h1>
        <p className="text-muted-foreground text-sm">
          Ringkasan pengeluaran kamu hari ini, minggu ini, dan bulan ini.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Hari ini"
          amount={summary.today}
          href="/harian"
          hint="Lihat rekap harian"
        />
        <StatCard
          label="Minggu ini"
          amount={summary.week}
          href="/mingguan"
          hint="Senin sampai Minggu"
        />
        <StatCard
          label="Bulan ini"
          amount={summary.month}
          href="/bulanan"
          hint="Lihat rekap bulanan"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">5 Transaksi Terakhir</CardTitle>
          <Link
            href="/transaksi"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Lihat semua
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent>
          {summary.recent.length === 0 ? (
            <EmptyState
              icon={<Wallet className="size-8" aria-hidden="true" />}
              title="Belum ada transaksi"
              description="Tekan tombol Tambah untuk mulai mencatat pengeluaran pertamamu."
            />
          ) : (
            <div className="divide-border/60 divide-y">
              {summary.recent.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  showDate
                  dateLabel={formatDateLabel(tx.date)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
