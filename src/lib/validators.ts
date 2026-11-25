import { z } from "zod";

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const transactionSchema = z.object({
  amount: z
    .number()
    .int("Nominal harus bilangan bulat.")
    .positive("Nominal harus lebih dari 0."),
  categoryId: z.string().min(1, "Pilih kategori."),
  date: z.string().regex(DATE_KEY_REGEX, "Format tanggal tidak valid."),
  note: z
    .string()
    .max(140, "Catatan maksimal 140 karakter.")
    .optional()
    .or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(40, "Nama kategori maksimal 40 karakter."),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus berupa kode hex, contoh #64748b."),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const loginSchema = z.object({
  password: z.string().min(12, "Password minimal 12 karakter."),
});

export type LoginInput = z.infer<typeof loginSchema>;
