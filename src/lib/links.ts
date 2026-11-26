/**
 * Pure URL builders. Kept out of the query modules so client components can
 * import them without pulling Prisma into the browser bundle.
 */

/** Deep link that opens the "add transaction" form, optionally pre-dated. */
export function addTransactionHref(dateKey?: string): string {
  if (!dateKey) return "/transaksi?tambah=1";
  return `/transaksi?tambah=${encodeURIComponent(dateKey)}`;
}
