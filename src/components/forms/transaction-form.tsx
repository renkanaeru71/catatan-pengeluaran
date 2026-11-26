"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/forms/amount-input";
import { z } from "zod";
import { transactionSchema, type TransactionInput } from "@/lib/validators";
import { todayJakarta, toDateKey } from "@/lib/date";
import {
  createTransaction,
  updateTransaction,
} from "@/server/actions/transaction-actions";
import type { ActionResult } from "@/server/actions/category-actions";
import type { CategoryOption } from "@/server/queries/category-queries";

/**
 * Form-level schema: identical rules to the server's `transactionSchema`, but
 * `note` is always a string (never undefined) so the controlled textarea and
 * the character counter never deal with `undefined`.
 */
const transactionFormSchema = transactionSchema.extend({
  note: z.string().max(140, "Catatan maksimal 140 karakter."),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  /** When set, the dialog edits this transaction instead of creating one. */
  transaction?: {
    id: string;
    amount: number;
    date: string;
    note: string | null;
    categoryId: string;
  } | null;
  /** Pre-fill the date field (used by "add for this day" entry points). */
  defaultDateKey?: string;
}

function emptyValues(dateKey?: string): TransactionFormValues {
  return {
    amount: 0,
    categoryId: "",
    date: dateKey ?? toDateKey(todayJakarta()),
    note: "",
  };
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  categories,
  transaction,
  defaultDateKey,
}: TransactionFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(transaction);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: emptyValues(defaultDateKey),
    mode: "onSubmit",
  });

  // Reset to a clean form each time the dialog opens, or when it is retargeted
  // at a different transaction. The dialog stays mounted between opens.
  const transactionId = transaction?.id ?? null;
  useEffect(() => {
    if (!open) return;
    setServerError(null);
    form.reset(
      transaction
        ? {
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            date: transaction.date,
            note: transaction.note ?? "",
          }
        : emptyValues(defaultDateKey),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transactionId, defaultDateKey]);

  const noteValue = form.watch("note") ?? "";
  const noteLength = noteValue.length;

  function onSubmit(values: TransactionFormValues) {
    setServerError(null);
    const payload: TransactionInput = {
      amount: values.amount,
      categoryId: values.categoryId,
      date: values.date,
      note: values.note,
    };

    startTransition(async () => {
      const result: ActionResult = transaction
        ? await updateTransaction(transaction.id, payload)
        : await createTransaction(payload);

      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Transaksi diperbarui." : "Transaksi tersimpan.");
      onOpenChange(false);
      router.refresh();
    });
  }

  const categoryMap = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    for (const cat of categories) {
      map[cat.id] = (
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          {cat.name}
        </span>
      );
    }
    return map;
  }, [categories]);

  const amountError = form.formState.errors.amount?.message;
  const categoryError = form.formState.errors.categoryId?.message;
  const dateError = form.formState.errors.date?.message;
  const noteError = form.formState.errors.note?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Ubah Transaksi" : "Tambah Pengeluaran"}
            </DialogTitle>
            <DialogDescription>
              Catat pengeluaran kamu. Semua nominal dalam Rupiah.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="transaction-amount">Nominal</Label>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <AmountInput
                  id="transaction-amount"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  autoFocus
                />
              )}
            />
            {amountError && (
              <p role="alert" className="text-destructive text-sm">
                {amountError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="transaction-category">Kategori</Label>
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={(next) => field.onChange(next ?? "")}
                  items={categoryMap}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="transaction-category"
                    className="h-9 w-full"
                    aria-invalid={Boolean(categoryError)}
                  >
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {categoryError && (
              <p role="alert" className="text-destructive text-sm">
                {categoryError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="transaction-date">Tanggal</Label>
            <div className="relative">
              <CalendarDays
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                id="transaction-date"
                type="date"
                className="pl-9"
                disabled={isPending}
                aria-invalid={Boolean(dateError)}
                {...form.register("date")}
              />
            </div>
            {dateError && (
              <p role="alert" className="text-destructive text-sm">
                {dateError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="transaction-note">Catatan (opsional)</Label>
              <span
                className={
                  noteLength > 140
                    ? "text-destructive text-xs tabular-nums"
                    : "text-muted-foreground text-xs tabular-nums"
                }
              >
                {noteLength}/140
              </span>
            </div>
            <Textarea
              id="transaction-note"
              rows={2}
              placeholder="Contoh: Makan siang di warteg"
              disabled={isPending}
              maxLength={140}
              aria-invalid={Boolean(noteError)}
              {...form.register("note")}
            />
            {noteError && (
              <p role="alert" className="text-destructive text-sm">
                {noteError}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
