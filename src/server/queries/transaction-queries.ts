import { prisma } from "@/lib/db";

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
