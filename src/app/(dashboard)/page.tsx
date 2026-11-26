import { getRecentTransactions } from "@/server/queries/transaction-queries";
import { getCategoryOptions } from "@/server/queries/category-queries";
import { TransactionList } from "@/components/shared/transaction-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [transactions, categories] = await Promise.all([
    getRecentTransactions(5),
    getCategoryOptions(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Beranda</h1>
        <p className="text-muted-foreground text-sm">
          Transaksi terakhir kamu.
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
