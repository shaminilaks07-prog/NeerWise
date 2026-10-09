import { PROJECTION_CONFIG } from '../../config/defaults';
import type { ProjectionConfig } from '../../types/alerts';
import type { DailyRecord, ISODate } from '../../types/water';
import { addDays, diffDays, weekStart } from '../dates';
import { dailyMap, mean, stdDev, sumRange, windowValues } from './aggregate';

export interface Projection {
  status: 'ok' | 'insufficient-data';
  reason?: string;
  weekStart: ISODate;
  weekEnd: ISODate;
  /** Calendar days left in the week after today. */
  daysAfterToday: number;
  /** Logged litres from Monday through today. */
  usedSoFar: number;
  todayUsed: number;
  daysLoggedThisWeek: number;
  baselineDaily: number | null;
  baselineSd: number | null;
  baselineDaysUsed: number;
  /** baselineDaily * daysAfterToday + max(0, baselineDaily - todayUsed) */
  expectedRemaining: number | null;
  projectedTotal: number | null;
  /** projectedTotal +/- one standard deviation of daily use over the remaining days. */
  rangeLow: number | null;
  rangeHigh: number | null;
}

/**
 * Projects end-of-week use.
 *
 *   baselineDaily     = mean of daily totals over the (up to) 14 days before today that have data
 *   expectedRemaining = baselineDaily * daysAfterToday + max(0, baselineDaily - todayUsed)
 *   projectedTotal    = usedSoFar + expectedRemaining
 *
 * Today is treated as an unfinished day. This is arithmetic on past averages, not a forecast model.
 */
export function projectWeek(
  daily: DailyRecord[],
  today: ISODate,
  config: ProjectionConfig = PROJECTION_CONFIG,
): Projection {
  const map = dailyMap(daily);
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  const daysAfterToday = diffDays(today, we);
  const { total: usedSoFar, days: daysLoggedThisWeek } = sumRange(map, ws, today);
  const todayUsed = map.get(today) ?? 0;

  const values = windowValues(map, today, config.baselineDays);
  const base = {
    weekStart: ws,
    weekEnd: we,
    daysAfterToday,
    usedSoFar,
    todayUsed,
    daysLoggedThisWeek,
    baselineDaysUsed: values.length,
  };

  if (values.length < config.minBaselineDays) {
    return {
      ...base,
      status: 'insufficient-data',
      reason: `Needs at least ${config.minBaselineDays} days of logged use before today. Found ${values.length}.`,
      baselineDaily: null,
      baselineSd: null,
      expectedRemaining: null,
      projectedTotal: null,
      rangeLow: null,
      rangeHigh: null,
    };
  }

  const baselineDaily = mean(values) as number;
  const baselineSd = stdDev(values);
  const expectedRemaining = baselineDaily * daysAfterToday + Math.max(0, baselineDaily - todayUsed);
  const projectedTotal = usedSoFar + expectedRemaining;
  const remainingDays = daysAfterToday + (todayUsed < baselineDaily ? 1 : 0);
  const spread = baselineSd === null ? 0 : baselineSd * Math.sqrt(remainingDays);

  return {
    ...base,
    status: 'ok',
    baselineDaily,
    baselineSd,
    expectedRemaining,
    projectedTotal,
    rangeLow: Math.max(usedSoFar, projectedTotal - spread),
    rangeHigh: projectedTotal + spread,
  };
}
