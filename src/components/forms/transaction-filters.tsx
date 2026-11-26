"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryOption } from "@/server/queries/category-queries";

interface TransactionFiltersProps {
  categories: CategoryOption[];
  initialFrom?: string;
  initialTo?: string;
  initialCategoryId?: string;
  initialQuery?: string;
}

export function TransactionFilters({
  categories,
  initialFrom = "",
  initialTo = "",
  initialCategoryId = "",
  initialQuery = "",
}: TransactionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [query, setQuery] = useState(initialQuery);

  // Sync state if URL changes externally (e.g. back button).
  useEffect(() => {
    setFrom(initialFrom);
    setTo(initialTo);
    setCategoryId(initialCategoryId);
    setQuery(initialQuery);
  }, [initialFrom, initialTo, initialCategoryId, initialQuery]);

  function applyFilters(next: {
    from?: string;
    to?: string;
    categoryId?: string;
    q?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset pagination on any filter change

    const nextFrom = next.from !== undefined ? next.from : from;
    const nextTo = next.to !== undefined ? next.to : to;
    const nextCat = next.categoryId !== undefined ? next.categoryId : categoryId;
    const nextQ = next.q !== undefined ? next.q : query;

    if (nextFrom) params.set("from", nextFrom);
    else params.delete("from");

    if (nextTo) params.set("to", nextTo);
    else params.delete("to");

    if (nextCat) params.set("categoryId", nextCat);
    else params.delete("categoryId");

    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  // Debounce search text input by 300 ms.
  useEffect(() => {
    if (query === initialQuery) return;
    const t = setTimeout(() => {
      applyFilters({ q: query });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasAnyFilter = Boolean(from || to || categoryId || query);

  function handleReset() {
    setFrom("");
    setTo("");
    setCategoryId("");
    setQuery("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const categoryItems: Record<string, React.ReactNode> = {
    all: "Semua Kategori",
  };
  for (const c of categories) {
    categoryItems[c.id] = (
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: c.color }}
        />
        {c.name}
      </span>
    );
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      {/* Search note bar */}
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan catatan (contoh: kopi, bensin)..."
          className="pr-9 pl-9"
          aria-label="Cari catatan"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              applyFilters({ q: "" });
            }}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            aria-label="Hapus kata kunci"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Date range + category select */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-from" className="text-muted-foreground text-xs">
            Dari tanggal
          </label>
          <Input
            id="filter-from"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              applyFilters({ from: e.target.value });
            }}
            className="h-9"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-to" className="text-muted-foreground text-xs">
            Sampai tanggal
          </label>
          <Input
            id="filter-to"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              applyFilters({ to: e.target.value });
            }}
            className="h-9"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-category"
            className="text-muted-foreground text-xs"
          >
            Kategori
          </label>
          <Select
            value={categoryId || "all"}
            onValueChange={(val) => {
              const nextVal = val === "all" || !val ? "" : val;
              setCategoryId(nextVal);
              applyFilters({ categoryId: nextVal });
            }}
            items={categoryItems}
          >
            <SelectTrigger id="filter-category" className="h-9 w-full">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasAnyFilter && (
        <div className="flex items-center justify-end pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>Reset Filter</span>
          </Button>
        </div>
      )}
    </div>
  );
}
