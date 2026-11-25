import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Makan", color: "#f59e0b" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Belanja", color: "#8b5cf6" },
  { name: "Tagihan", color: "#ef4444" },
  { name: "Hiburan", color: "#ec4899" },
  { name: "Kesehatan", color: "#10b981" },
  { name: "Pendidikan", color: "#06b6d4" },
  { name: "Lainnya", color: "#64748b" },
];

async function main() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Seed selesai: ${DEFAULT_CATEGORIES.length} kategori bawaan tersedia.`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
