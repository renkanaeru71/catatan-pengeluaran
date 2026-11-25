import { prisma } from "@/lib/db";

export type CategoryWithCount = {
  id: string;
  name: string;
  color: string;
  transactionCount: number;
};

export type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

/** All categories with how many transactions reference each one. */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const rows = await prisma.category.findMany({
    include: { _count: { select: { transactions: true } } },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    transactionCount: row._count.transactions,
  }));
}

/** Lightweight list for pickers (no counts). */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  return prisma.category.findMany({
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryCount(categoryId: string): Promise<number> {
  return prisma.transaction.count({ where: { categoryId } });
}
