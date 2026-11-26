import { prisma } from "@/lib/db";
import {
  buildTransactionWhere,
  PAGE_SIZE,
  type TransactionFilterParams,
} from "@/lib/transaction-filters";

export {
  buildTransactionWhere,
  PAGE_SIZE,
  type TransactionFilterParams,
};

export type TransactionWithCategory = {
  id: string;
  amount: number;
  date: Date;
  note: string | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    color: string;
  };
};

const transactionSelect = {
  id: true,
  amount: true,
  date: true,
  note: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
} as const;

/** All transactions between start and end (inclusive), sorted date desc, createdAt desc. */
export async function getTransactionsByRange(
  start: Date,
  end: Date,
): Promise<TransactionWithCategory[]> {
  return prisma.transaction.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    select: transactionSelect,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

/** Most recent transactions across all time. */
export async function getRecentTransactions(
  limit: number = 5,
): Promise<TransactionWithCategory[]> {
  return prisma.transaction.findMany({
    take: limit,
    select: transactionSelect,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getTransactionById(
  id: string,
): Promise<TransactionWithCategory | null> {
  return prisma.transaction.findUnique({
    where: { id },
    select: transactionSelect,
  });
}

export type SearchTransactionsParams = TransactionFilterParams & {
  page?: number;
  pageSize?: number;
};

/**
 * Filtered, paginated transaction search.
 * Returns items, total matching rows, and the computed page count.
 */
export async function searchTransactions(params: SearchTransactionsParams): Promise<{
  items: TransactionWithCategory[];
  total: number;
  pageCount: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? PAGE_SIZE, 1);
  const where = buildTransactionWhere(params);

  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      select: transactionSelect,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const pageCount = Math.max(Math.ceil(total / pageSize), 1);

  return {
    items,
    total,
    pageCount,
    page,
    pageSize,
  };
}
