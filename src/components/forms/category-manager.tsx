"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryFormDialog } from "@/components/forms/category-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  deleteCategory,
  type ActionResult,
} from "@/server/actions/category-actions";
import type { CategoryWithCount } from "@/server/queries/category-queries";

interface CategoryManagerProps {
  initialCategories: CategoryWithCount[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(
    null,
  );
  const [isDeleting, startDelete] = useTransition();

  function handleOpenCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function handleOpenEdit(cat: CategoryWithCount) {
    setEditingCategory(cat);
    setFormOpen(true);
  }

  function handleConfirmDelete() {
    if (!deletingCategory) return;
    const cat = deletingCategory;
    startDelete(async () => {
      const result: ActionResult = await deleteCategory(cat.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Kategori "${cat.name}" berhasil dihapus.`);
      setDeletingCategory(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground text-sm">
            Kelola kategori untuk mengelompokkan pengeluaran kamu.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5">
          <Plus className="size-4" />
          <span>Tambah</span>
        </Button>
      </div>

      {initialCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Belum ada kategori. Tekan tombol Tambah untuk membuat yang pertama.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {initialCategories.map((cat) => (
            <Card key={cat.id} className="transition-colors hover:bg-muted/40">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{cat.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {cat.transactionCount === 0
                        ? "Belum ada transaksi"
                        : `${cat.transactionCount} transaksi`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Ubah kategori ${cat.name}`}
                    onClick={() => handleOpenEdit(cat)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus kategori ${cat.name}`}
                    onClick={() => setDeletingCategory(cat)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
      />

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title={`Hapus kategori "${deletingCategory?.name}"?`}
        description={
          deletingCategory && deletingCategory.transactionCount > 0
            ? `Kategori ini masih dipakai oleh ${deletingCategory.transactionCount} transaksi. Hapus atau pindahkan transaksinya dulu sebelum menghapus kategori.`
            : "Kategori yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?"
        }
        confirmLabel={isDeleting ? "Menghapus..." : "Hapus"}
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
