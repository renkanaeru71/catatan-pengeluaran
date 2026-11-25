const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format integer rupiah as "Rp 25.000". */
export function formatRupiah(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  // id-ID produces a non-breaking space (U+00A0) after "Rp".
  return rupiahFormatter.format(safe).replace(/\u00a0/g, " ");
}

/** Extract the integer value from a formatted amount string. Non-digits are ignored. */
export function parseRupiahInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

/** Format digits typed by the user as thousands-separated text ("25000" -> "25.000"). */
export function formatRupiahInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number.parseInt(digits, 10));
}

/** Format a calendar date as "26 Nov 2026" using Indonesian month abbreviations. */
export function formatDateLabel(date: Date): string {
  const day = date.getUTCDate();
  const month = MONTHS_ID[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/** Format a date range as "24–30 Nov 2026" or "30 Nov – 6 Des 2026". */
export function formatRangeLabel(start: Date, end: Date): string {
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCFullYear() === end.getUTCFullYear();

  if (sameMonth) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${MONTHS_ID[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
  }

  const startLabel = `${start.getUTCDate()} ${MONTHS_ID[start.getUTCMonth()]}`;
  const endLabel = `${end.getUTCDate()} ${MONTHS_ID[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}
