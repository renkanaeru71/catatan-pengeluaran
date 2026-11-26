"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDateLabel } from "@/lib/format";
import { toDateKey } from "@/lib/date";
import { TransactionRow } from "@/components/shared/transaction-row";
import { TransactionFormDialog } from "@/components/forms/transaction-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteTransaction } from "@/server/actions/transaction-actions";
import type { TransactionWithCategory } from "@/server/queries/transaction-queries";
import type { CategoryOption } from "@/server/queries/category-queries";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  categories: CategoryOption[];
  showDate?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TransactionList({
  transactions,
  categories,
  showDate = false,
  emptyMessage = "Belum ada transaksi pada periode ini.",
  className,
}: TransactionListProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null);
  const [deleting, setDeleting] = useState<TransactionWithCategory | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleConfirmDelete() {
    if (!deleting) return;
    const tx = deleting;
    startDelete(async () => {
      const res = await deleteTransaction(tx.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Transaksi dihapus.");
      setDeleting(null);
      router.refresh();
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="divide-y divide-border/60">
        {transactions.map((tx) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            onEdit={setEditing}
            onDelete={setDeleting}
            showDate={showDate}
            dateLabel={formatDateLabel(tx.date)}
          />
        ))}
      </div>

      <TransactionFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        categories={categories}
        transaction={
          editing
            ? {
                id: editing.id,
                amount: editing.amount,
                date: toDateKey(editing.date),
                note: editing.note,
                categoryId: editing.category.id,
              }
            : null
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus transaksi?"
        description="Transaksi yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?"
        confirmLabel={isDeleting ? "Menghapus..." : "Hapus"}
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
