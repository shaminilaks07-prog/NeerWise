import type { ISODate } from '../types/water';

const MS_PER_DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toUTC(s: ISODate): number {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUTC(ms: number): ISODate {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(s: ISODate, n: number): ISODate {
  return fromUTC(toUTC(s) + n * MS_PER_DAY);
}

/** Whole days from a to b (b - a). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(b) - toUTC(a)) / MS_PER_DAY);
}

/** Monday of the week containing s. */
export function weekStart(s: ISODate): ISODate {
  const dow = new Date(toUTC(s)).getUTCDay(); // 0 = Sunday
  return addDays(s, -((dow + 6) % 7));
}

export function todayLocal(now: Date = new Date()): ISODate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function weekdayShort(s: ISODate): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(toUTC(s));
}

export function formatDay(s: ISODate): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(toUTC(s));
}

export function formatShort(s: ISODate): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(toUTC(s));
}

export function hourLabel(h: number): string {
  return `${pad(h)}:00`;
}
