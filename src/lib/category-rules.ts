/** Pure rules for category management, kept out of the DB layer so they are testable. */

export function canDeleteCategory(transactionCount: number): boolean {
  return transactionCount === 0;
}

export function categoryErrorMessage(transactionCount: number): string {
  return `Kategori ini masih dipakai oleh ${transactionCount} transaksi. Hapus atau pindahkan transaksinya dulu.`;
}
