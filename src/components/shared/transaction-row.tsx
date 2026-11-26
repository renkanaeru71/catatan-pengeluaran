"use client";

import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionWithCategory } from "@/server/queries/transaction-queries";

interface TransactionRowProps {
  transaction: TransactionWithCategory;
  onEdit?: (transaction: TransactionWithCategory) => void;
  onDelete?: (transaction: TransactionWithCategory) => void;
  showDate?: boolean;
  dateLabel?: string;
  className?: string;
}

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  showDate = false,
  dateLabel,
  className,
}: TransactionRowProps) {
  const interactive = Boolean(onEdit || onDelete);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2.5",
        interactive && "hover:bg-muted/50 -mx-2 rounded-lg px-2 transition-colors",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: transaction.category.color }}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {transaction.category.name}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {transaction.note
            ? transaction.note
            : showDate
              ? dateLabel
              : "Tanpa catatan"}
        </p>
      </div>

      {showDate && transaction.note && (
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {dateLabel}
        </span>
      )}

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {formatRupiah(transaction.amount)}
      </span>

      {interactive && (
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="text-muted-foreground hover:text-foreground rounded-md p-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Ubah transaksi ${transaction.category.name} ${formatRupiah(transaction.amount)}`}
            >
              Ubah
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="text-muted-foreground hover:text-destructive rounded-md p-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Hapus transaksi ${transaction.category.name} ${formatRupiah(transaction.amount)}`}
            >
              Hapus
            </button>
          )}
        </div>
      )}
    </div>
  );
}
