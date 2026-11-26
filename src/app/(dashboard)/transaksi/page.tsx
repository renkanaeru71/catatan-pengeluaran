import type { Metadata } from "next";
import { getRecentTransactions } from "@/server/queries/transaction-queries";
import { getCategoryOptions } from "@/server/queries/category-queries";
import { TransactionList } from "@/components/shared/transaction-list";

export const metadata: Metadata = {
  title: "Transaksi — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
  const [transactions, categories] = await Promise.all([
    getRecentTransactions(100),
    getCategoryOptions(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-muted-foreground text-sm">
          Semua pengeluaran yang sudah kamu catat.
        </p>
      </div>

      <TransactionList
        transactions={transactions}
        categories={categories}
        showDate
        emptyMessage="Belum ada transaksi. Tekan tombol Tambah untuk mencatat pengeluaran pertama."
      />
    </div>
  );
}
