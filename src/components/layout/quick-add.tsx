"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "@/components/forms/transaction-form";
import type { CategoryOption } from "@/server/queries/category-queries";

type QuickAddContextValue = {
  open: (dateKey?: string) => void;
};

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function useQuickAdd(): QuickAddContextValue {
  const ctx = useContext(QuickAddContext);
  if (!ctx) {
    throw new Error("Quick add controls must be rendered inside <QuickAddProvider>.");
  }
  return ctx;
}

/**
 * Holds the single transaction form instance shared by the desktop header
 * button and the mobile FAB, so both open the same dialog instead of each
 * mounting its own copy.
 */
export function QuickAddProvider({
  categories,
  children,
}: {
  categories: CategoryOption[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [defaultDateKey, setDefaultDateKey] = useState<string | undefined>();

  const openForm = useCallback((dateKey?: string) => {
    setDefaultDateKey(dateKey);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ open: openForm }), [openForm]);

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <TransactionFormDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        defaultDateKey={defaultDateKey}
      />
    </QuickAddContext.Provider>
  );
}

/** "+ Tambah" button for the desktop header. */
export function QuickAddHeaderButton() {
  const { open } = useQuickAdd();
  return (
    <Button
      onClick={() => open()}
      size="sm"
      className="items-center gap-1.5"
    >
      <Plus className="size-4" aria-hidden="true" />
      <span>Tambah</span>
    </Button>
  );
}

/** Floating action button for mobile, sitting above the bottom tab bar. */
export function QuickAddFab() {
  const { open } = useQuickAdd();
  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label="Tambah pengeluaran baru"
      className="bg-primary text-primary-foreground fixed right-4 bottom-20 z-40 flex size-14 items-center justify-center rounded-full shadow-lg shadow-black/20 transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none md:hidden"
    >
      <Plus className="size-6" aria-hidden="true" />
    </button>
  );
}

/**
 * Inline "Tambah transaksi" trigger for empty states and recap pages, so the
 * new entry lands on the day the user is looking at.
 */
export function QuickAddInlineButton({
  dateKey,
  label = "Tambah transaksi",
  variant = "default",
}: {
  dateKey?: string;
  label?: string;
  variant?: "default" | "outline";
}) {
  const { open } = useQuickAdd();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      onClick={() => open(dateKey)}
      className="items-center gap-1.5"
    >
      <Plus className="size-4" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
