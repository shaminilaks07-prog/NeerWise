import { SAMPLE_CONFIG } from '../config/defaults';
import { addDays } from '../lib/dates';
import type { DailyRecord, HourlyRecord, ISODate } from '../types/water';

/**
 * SAMPLE DATA - generated, not measured.
 *
 * Models a household of about four using roughly 500 L per day, with a morning and
 * evening peak, slightly higher weekend use, and small random variation.
 * The generator is seeded, so the same inputs always give the same output.
 *
 * Two events are injected on purpose so the Waste Detective has something to find:
 *   - 9 days before `today`: a high-use day (about 65% above normal).
 *   - 4 days before `today`: 20 L extra in each of hours 01:00-04:59 (continuous night-time use).
 *
 * `today` is generated only up to `nowHour` (exclusive), so it is a partial day.
 */

const HOUR_WEIGHTS = [
  0.002, 0.001, 0.001, 0.001, 0.003, 0.02, 0.11, 0.14, 0.09, 0.04, 0.03, 0.04,
  0.06, 0.04, 0.025, 0.025, 0.03, 0.05, 0.09, 0.09, 0.07, 0.05, 0.025, 0.01,
];
const WEIGHT_SUM = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);
const DAILY_TARGET = 500;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function dayOfWeek(date: ISODate): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function generateSample(
  today: ISODate,
  nowHour: number,
  days: number = SAMPLE_CONFIG.days,
  seed: number = SAMPLE_CONFIG.seed,
): { daily: DailyRecord[]; hourly: HourlyRecord[] } {
  const rand = mulberry32(seed);
  const daily: DailyRecord[] = [];
  const hourly: HourlyRecord[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = addDays(today, -offset);
    const dow = dayOfWeek(date);
    const dayFactor = (dow === 0 || dow === 6 ? 1.1 : 1) * (0.92 + rand() * 0.16);
    const spike = offset === 9 ? 1.65 : 1;
    const lastHour = offset === 0 ? Math.min(24, Math.max(0, nowHour)) : 24;

    let total = 0;
    for (let h = 0; h < 24; h++) {
      // Always advance the generator so output does not shift with nowHour.
      const noise = 0.75 + rand() * 0.5;
      if (h >= lastHour) continue;
      let litres = (HOUR_WEIGHTS[h] / WEIGHT_SUM) * DAILY_TARGET * dayFactor * spike * noise;
      if (offset === 4 && h >= 1 && h <= 4) litres += 20;
      litres = round1(litres);
      total += litres;
      hourly.push({ date, hour: h, litres, source: 'sample' });
    }
    if (lastHour > 0) daily.push({ date, litres: round1(total), source: 'sample' });
  }
  return { daily, hourly };
}
