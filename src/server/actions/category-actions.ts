"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validators";
import { canDeleteCategory, categoryErrorMessage } from "@/lib/category-rules";
import { requireSession } from "@/server/actions/auth-actions";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateCategoryPages() {
  revalidatePath("/kategori");
  revalidatePath("/transaksi");
  revalidatePath("/", "layout");
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export async function createCategory(input: {
  name: string;
  color: string;
}): Promise<ActionResult> {
  await requireSession();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "Nama kategori sudah ada." };
    }
    throw error;
  }

  revalidateCategoryPages();
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: { name: string; color: string },
): Promise<ActionResult> {
  await requireSession();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "Nama kategori sudah ada." };
    }
    throw error;
  }

  revalidateCategoryPages();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireSession();

  const transactionCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (!canDeleteCategory(transactionCount)) {
    return { ok: false, error: categoryErrorMessage(transactionCount) };
  }

  await prisma.category.delete({ where: { id } });

  revalidateCategoryPages();
  return { ok: true };
}
