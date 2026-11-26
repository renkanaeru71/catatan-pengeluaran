import type { Prisma } from "@prisma/client";
import { parseDateKey } from "@/lib/date";

/** Rows per page on /transaksi. */
export const PAGE_SIZE = 20;

export type TransactionFilterParams = {
  from?: string;
  to?: string;
  categoryId?: string;
  q?: string;
};

/**
 * Trim blank values and drop unparseable dates, so the query builder and the
 * filter bar agree on what counts as "set". Invalid dates are ignored rather
 * than thrown: a hand-edited URL should render an unfiltered list, not a 500.
 */
export function normalizeFilterParams(
  params: TransactionFilterParams,
): TransactionFilterParams {
  const normalized: TransactionFilterParams = {};

  if (params.from) {
    try {
      parseDateKey(params.from);
      normalized.from = params.from;
    } catch {
      /* ignore invalid date */
    }
  }

  if (params.to) {
    try {
      parseDateKey(params.to);
      normalized.to = params.to;
    } catch {
      /* ignore invalid date */
    }
  }

  const categoryId = params.categoryId?.trim();
  if (categoryId) normalized.categoryId = categoryId;

  const q = params.q?.trim();
  if (q) normalized.q = q;

  return normalized;
}

/** True when at least one filter narrows the result set. */
export function hasActiveFilters(params: TransactionFilterParams): boolean {
  return Boolean(params.from || params.to || params.categoryId || params.q);
}

/**
 * Translate the filter params into a Prisma `where`. Pure and exported so the
 * filter semantics can be unit-tested without touching the database.
 */
export function buildTransactionWhere(
  params: TransactionFilterParams,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {};
  const normalized = normalizeFilterParams(params);

  if (normalized.from || normalized.to) {
    const date: Prisma.DateTimeFilter = {};
    if (normalized.from) date.gte = parseDateKey(normalized.from);
    if (normalized.to) date.lte = parseDateKey(normalized.to);
    where.date = date;
  }

  if (normalized.categoryId) {
    where.categoryId = normalized.categoryId;
  }

  if (normalized.q) {
    where.note = { contains: normalized.q, mode: "insensitive" };
  }

  return where;
}

/** Page numbers are 1-based; anything unparseable or below 1 becomes page 1. */
export function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}
