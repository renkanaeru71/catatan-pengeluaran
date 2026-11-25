"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorPicker, PRESET_COLORS } from "@/components/shared/color-picker";
import {
  createCategory,
  updateCategory,
  type ActionResult,
} from "@/server/actions/category-actions";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: { id: string; name: string; color: string } | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  // The dialog stays mounted across opens, so reset the fields whenever it is
  // opened or retargeted at another category. Without this, a form left dirty
  // from a previous edit leaks its values into the next create.
  const categoryId = category?.id ?? null;
  const categoryName = category?.name;
  const categoryColor = category?.color;
  useEffect(() => {
    if (!open) return;
    setName(categoryName ?? "");
    setColor(categoryColor ?? PRESET_COLORS[0]);
    setError(null);
  }, [open, categoryId, categoryName, categoryColor]);

  const isEditing = Boolean(category);

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let result: ActionResult;
      if (category) {
        result = await updateCategory(category.id, { name, color });
      } else {
        result = await createCategory({ name, color });
      }

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing ? "Kategori diperbarui." : "Kategori berhasil ditambahkan.",
      );
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Ubah Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              Tiap kategori punya nama dan warna untuk grafik pengeluaran.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Nama Kategori</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kopi, Langganan"
              maxLength={40}
              autoFocus
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Warna</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
