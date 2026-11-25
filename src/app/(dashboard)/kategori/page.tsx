import type { Metadata } from "next";
import { getCategories } from "@/server/queries/category-queries";
import { CategoryManager } from "@/components/forms/category-manager";

export const metadata: Metadata = {
  title: "Kategori — Catatan Pengeluaran",
};

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const categories = await getCategories();

  return <CategoryManager initialCategories={categories} />;
}
