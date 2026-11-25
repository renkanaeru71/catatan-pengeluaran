import { formatInTimeZone } from "date-fns-tz";

export const TZ = "Asia/Jakarta";

const DAY_MS = 86_400_000;
const DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * All calendar dates in this app are represented as `Date` objects pinned to
 * UTC midnight for the calendar day in question. That keeps range arithmetic
 * independent of the server's local timezone: every helper below uses the UTC
 * getters/setters only, so results are identical on any machine.
 */

/** Map an instant (or date-key) to its calendar day in Asia/Jakarta. */
export function toJakartaDateKey(input: Date | string): string {
  if (typeof input === "string") {
    const match = DATE_KEY_REGEX.exec(input);
    if (match) return input;
    return formatInTimeZone(new Date(input), TZ, "yyyy-MM-dd");
  }
  return formatInTimeZone(input, TZ, "yyyy-MM-dd");
}

/** Today's calendar date in Asia/Jakarta, as a UTC-midnight Date. */
export function todayJakarta(): Date {
  return parseDateKey(toJakartaDateKey(new Date()));
}

/** Parse "YYYY-MM-DD" into a UTC-midnight Date. */
export function parseDateKey(key: string): Date {
  const match = DATE_KEY_REGEX.exec(key);
  if (!match) throw new Error(`Tanggal tidak valid: ${key}`);
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

/** Serialize a UTC-midnight Date back to "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY_MS);
}

export function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7);
}

/** Add months, clamping the day so 31 Jan + 1 month lands on 28/29 Feb. */
export function addMonths(date: Date, amount: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const target = new Date(Date.UTC(year, month + amount, 1));
  const lastDay = daysInMonth(target);
  const day = Math.min(date.getUTCDate(), lastDay);
  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), day),
  );
}

/** Monday..Sunday week containing `anchor`. */
export function weekRange(anchor: Date): { start: Date; end: Date } {
  const dayOfWeek = anchor.getUTCDay(); // 0 = Sunday
  const offsetToMonday = (dayOfWeek + 6) % 7;
  const start = addDays(anchor, -offsetToMonday);
  return { start, end: addDays(start, 6) };
}

/** First..last day of the month containing `anchor`. */
export function monthRange(anchor: Date): { start: Date; end: Date } {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 0)),
  };
}

export function daysInWeek(): number {
  return 7;
}

export function daysInMonth(anchor: Date): number {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Days elapsed from the week's Monday up to `today`, clamped to 1..7. */
export function elapsedDaysInWeek(start: Date, today: Date): number {
  const diff = Math.floor((today.getTime() - start.getTime()) / DAY_MS) + 1;
  return Math.min(Math.max(diff, 1), 7);
}

/** Days elapsed from the month's first day up to `today`, clamped to 1..daysInMonth. */
export function elapsedDaysInMonth(start: Date, today: Date): number {
  const diff = Math.floor((today.getTime() - start.getTime()) / DAY_MS) + 1;
  return Math.min(Math.max(diff, 1), daysInMonth(start));
}

/** Every calendar day between start and end inclusive, ascending. */
export function eachDayOfRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}
