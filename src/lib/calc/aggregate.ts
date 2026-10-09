import type { DailyRecord, ISODate } from '../../types/water';
import { addDays, isValidISODate, weekStart } from '../dates';

export function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n - 1). Needs at least two values. */
export function stdDev(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs) as number;
  const variance = xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Map of date -> litres. Drops records with invalid dates or non-finite / negative litres. */
export function dailyMap(daily: DailyRecord[]): Map<ISODate, number> {
  const map = new Map<ISODate, number>();
  for (const r of daily) {
    if (!isValidISODate(r.date)) continue;
    if (!Number.isFinite(r.litres) || r.litres < 0) continue;
    map.set(r.date, r.litres);
  }
  return map;
}

/** Sum litres for dates in [start, end] inclusive and count days that have data. */
export function sumRange(map: Map<ISODate, number>, start: ISODate, end: ISODate) {
  let total = 0;
  let days = 0;
  for (let d = start, guard = 0; d <= end && guard < 400; d = addDays(d, 1), guard++) {
    const v = map.get(d);
    if (v !== undefined) {
      total += v;
      days += 1;
    }
  }
  return { total, days };
}

/** Values for the `n` calendar days before `endExclusive` that have data (oldest first). */
export function windowValues(map: Map<ISODate, number>, endExclusive: ISODate, n: number): number[] {
  const out: number[] = [];
  for (let i = n; i >= 1; i--) {
    const v = map.get(addDays(endExclusive, -i));
    if (v !== undefined) out.push(v);
  }
  return out;
}

export interface WeekTotal {
  weekStart: ISODate;
  weekEnd: ISODate;
  total: number;
  daysLogged: number;
}

/** Totals for the last `weeks` Monday-Sunday weeks, oldest first. The last entry is the current week. */
export function weeklyTotals(daily: DailyRecord[], today: ISODate, weeks = 4): WeekTotal[] {
  const map = dailyMap(daily);
  const current = weekStart(today);
  const out: WeekTotal[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = addDays(current, -7 * i);
    const we = addDays(ws, 6);
    const { total, days } = sumRange(map, ws, we);
    out.push({ weekStart: ws, weekEnd: we, total, daysLogged: days });
  }
  return out;
}
