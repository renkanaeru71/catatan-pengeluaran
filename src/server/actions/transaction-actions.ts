"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/date";
import { transactionSchema, type TransactionInput } from "@/lib/validators";
import { requireSession } from "@/server/actions/auth-actions";
import type { ActionResult } from "@/server/actions/category-actions";

function revalidateAllRecaps() {
  revalidatePath("/", "layout");
}

export async function createTransaction(
  input: TransactionInput,
): Promise<ActionResult> {
  await requireSession();

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid.",
    };
  }

  const { amount, categoryId, date, note } = parsed.data;

  // Calendar date stored at UTC midnight.
  const dateUtc = parseDateKey(date);

  try {
    await prisma.transaction.create({
      data: {
        amount,
        categoryId,
        date: dateUtc,
        note: note ? note.trim() : null,
      },
    });
  } catch (error) {
    console.error("createTransaction failed", error);
    return {
      ok: false,
      error: "Gagal menyimpan transaksi. Periksa kembali kategori yang dipilih.",
    };
  }

  revalidateAllRecaps();
  return { ok: true };
}

export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<ActionResult> {
  await requireSession();

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid.",
    };
  }

  const { amount, categoryId, date, note } = parsed.data;
  const dateUtc = parseDateKey(date);

  try {
    await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        categoryId,
        date: dateUtc,
        note: note ? note.trim() : null,
      },
    });
  } catch (error) {
    console.error("updateTransaction failed", error);
    return {
      ok: false,
      error: "Gagal memperbarui transaksi. Transaksi mungkin sudah dihapus.",
    };
  }

  revalidateAllRecaps();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  await requireSession();

  try {
    await prisma.transaction.delete({ where: { id } });
  } catch (error) {
    console.error("deleteTransaction failed", error);
    return {
      ok: false,
      error: "Gagal menghapus transaksi. Transaksi mungkin sudah tidak ada.",
    };
  }

  revalidateAllRecaps();
  return { ok: true };
}
