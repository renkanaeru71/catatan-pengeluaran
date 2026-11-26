import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX, Wallet } from "lucide-react";
import { searchTransactions } from "@/server/queries/transaction-queries";
import { getCategoryOptions } from "@/server/queries/category-queries";
import {
  hasActiveFilters,
  normalizeFilterParams,
  PAGE_SIZE,
  parsePage,
} from "@/lib/transaction-filters";
import { TransactionFilters } from "@/components/forms/transaction-filters";
import { TransactionList } from "@/components/shared/transaction-list";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Transaksi — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

interface TransaksiPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    categoryId?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function TransaksiPage({
  searchParams,
}: TransaksiPageProps) {
  const params = await searchParams;
  const filters = normalizeFilterParams({
    from: params.from,
    to: params.to,
    categoryId: params.categoryId,
    q: params.q,
  });
  const page = parsePage(params.page);

  const [result, categories] = await Promise.all([
    searchTransactions({ ...filters, page, pageSize: PAGE_SIZE }),
    getCategoryOptions(),
  ]);

  const filtersActive = hasActiveFilters(filters);

  function pageHref(targetPage: number): string {
    const search = new URLSearchParams();
    if (filters.from) search.set("from", filters.from);
    if (filters.to) search.set("to", filters.to);
    if (filters.categoryId) search.set("categoryId", filters.categoryId);
    if (filters.q) search.set("q", filters.q);
    if (targetPage > 1) search.set("page", String(targetPage));
    const qs = search.toString();
    return qs ? `/transaksi?${qs}` : "/transaksi";
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-muted-foreground text-sm">
          Semua pengeluaran yang sudah kamu catat.
        </p>
      </div>

      <TransactionFilters
        categories={categories}
        initialFrom={filters.from}
        initialTo={filters.to}
        initialCategoryId={filters.categoryId}
        initialQuery={filters.q}
      />

      {result.items.length === 0 ? (
        filtersActive ? (
          <EmptyState
            icon={<SearchX className="size-8" aria-hidden="true" />}
            title="Tidak ada hasil untuk filter ini"
            description="Coba ubah kata kunci, rentang tanggal, atau kategori."
          />
        ) : (
          <EmptyState
            icon={<Wallet className="size-8" aria-hidden="true" />}
            title="Belum ada transaksi"
            description="Tekan tombol Tambah untuk mencatat pengeluaran pertama."
          />
        )
      ) : (
        <>
          <TransactionList
            transactions={result.items}
            categories={categories}
            showDate
            emptyMessage="Tidak ada transaksi pada periode ini."
          />

          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-muted-foreground text-xs">
              Halaman {result.page} dari {result.pageCount} · {result.total}{" "}
              transaksi
            </span>

            <div className="flex items-center gap-2">
              {result.page > 1 ? (
                <Link
                  href={pageHref(result.page - 1)}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Sebelumnya
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-40",
                  )}
                  aria-hidden="true"
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </span>
              )}

              {result.page < result.pageCount ? (
                <Link
                  href={pageHref(result.page + 1)}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  aria-label="Halaman berikutnya"
                >
                  Berikutnya
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-40",
                  )}
                  aria-hidden="true"
                >
                  Berikutnya
                  <ChevronRight className="size-4" />
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
