import { ANOMALY_CONFIG } from '../../config/defaults';
import type { Alert, AnomalyConfig, Severity } from '../../types/alerts';
import type { DailyRecord, HourlyRecord, ISODate } from '../../types/water';
import { addDays, formatDay, hourLabel, isValidISODate } from '../dates';
import { litres } from '../format';
import { dailyMap, mean, median, stdDev, windowValues } from './aggregate';

/**
 * Rule 1 - daily spike
 *   baseline = the previous `baselineWindow` days that have data (needs >= minBaselineDays)
 *   flag when  litres > mean + sigma * sd
 *         and  litres - mean >= max(minExcessLitres, minExcessFraction * mean)
 *
 * Rule 2 - overnight flow (needs hourly data)
 *   flag when >= minConsecutiveHours consecutive hours between startHour and endHour
 *   each use at least minLitresPerHour litres.
 *
 * Both rules only flag suspicious patterns. They cannot confirm a leak.
 */
export function detectAnomalies(input: {
  daily: DailyRecord[];
  hourly: HourlyRecord[];
  today: ISODate;
  config?: AnomalyConfig;
}): Alert[] {
  const config = input.config ?? ANOMALY_CONFIG;
  const alerts = [...dailySpikes(input.daily, input.today, config), ...overnightFlows(input.hourly, input.today, config)];
  const rank: Record<Severity, number> = { high: 0, watch: 1 };
  return alerts.sort((a, b) => (a.date === b.date ? rank[a.severity] - rank[b.severity] : a.date < b.date ? 1 : -1));
}

function dailySpikes(daily: DailyRecord[], today: ISODate, c: AnomalyConfig): Alert[] {
  const map = dailyMap(daily);
  const out: Alert[] = [];
  for (let offset = 0; offset < c.lookbackDays; offset++) {
    const date = addDays(today, -offset);
    const observed = map.get(date);
    if (observed === undefined) continue;
    const base = windowValues(map, date, c.baselineWindow);
    if (base.length < c.minBaselineDays) continue;
    const m = mean(base) as number;
    const sd = stdDev(base) ?? 0;
    const threshold = m + c.sigma * sd;
    const excess = observed - m;
    const minExcess = Math.max(c.minExcessLitres, c.minExcessFraction * m);
    if (!(observed > threshold && excess >= minExcess)) continue;

    const severity: Severity = excess >= c.highExcessFraction * m ? 'high' : 'watch';
    out.push({
      id: `daily-spike:${date}`,
      rule: 'daily-spike',
      date,
      severity,
      title: `Unusually high day: ${formatDay(date)}`,
      explanation:
        `${formatDay(date)} shows ${litres(observed)}. The previous ${base.length} logged days averaged ` +
        `${litres(m, 10)} (typical spread about ${litres(sd, 10)}). That is ${litres(excess, 10)} ` +
        `(${Math.round((excess / m) * 100)}%) above the average and above the alert line of ${litres(threshold, 10)}, ` +
        `which is the average plus ${c.sigma} standard deviations.`,
      observedLitres: observed,
      expectedLitres: m,
      excessLitres: excess,
      thresholdLitres: threshold,
    });
  }
  return out;
}

function overnightFlows(hourly: HourlyRecord[], today: ISODate, c: AnomalyConfig): Alert[] {
  const o = c.overnight;
  const byDate = new Map<ISODate, Map<number, number>>();
  const overnightAll: number[] = [];
  for (const r of hourly) {
    if (!isValidISODate(r.date) || !Number.isFinite(r.litres) || r.litres < 0) continue;
    if (r.hour < 0 || r.hour > 23) continue;
    if (!byDate.has(r.date)) byDate.set(r.date, new Map());
    (byDate.get(r.date) as Map<number, number>).set(r.hour, r.litres);
    if (r.hour >= o.startHour && r.hour <= o.endHour) overnightAll.push(r.litres);
  }
  const typicalHourly = median(overnightAll) ?? 0;

  const out: Alert[] = [];
  for (let offset = 0; offset < c.lookbackDays; offset++) {
    const date = addDays(today, -offset);
    const hours = byDate.get(date);
    if (!hours) continue;

    let best = { start: -1, len: 0 };
    let cur = { start: -1, len: 0 };
    for (let h = o.startHour; h <= o.endHour; h++) {
      if ((hours.get(h) ?? 0) >= o.minLitresPerHour) {
        if (cur.len === 0) cur.start = h;
        cur.len += 1;
        if (cur.len > best.len) best = { ...cur };
      } else {
        cur = { start: -1, len: 0 };
      }
    }
    if (best.len < o.minConsecutiveHours) continue;

    let observed = 0;
    for (let h = best.start; h < best.start + best.len; h++) observed += hours.get(h) ?? 0;
    const expected = typicalHourly * best.len;
    const excess = observed - expected;
    const severity: Severity = excess >= o.highLitres ? 'high' : 'watch';
    const endHour = best.start + best.len;

    out.push({
      id: `overnight-flow:${date}`,
      rule: 'overnight-flow',
      date,
      severity,
      title: `Continuous night-time use: ${formatDay(date)}`,
      explanation:
        `Between ${hourLabel(best.start)} and ${hourLabel(endHour)} on ${formatDay(date)}, water use stayed at ` +
        `${o.minLitresPerHour} L or more in each of ${best.len} hours in a row, ${litres(observed)} in total. ` +
        `Typical use in those hours is about ${litres(typicalHourly, 1)} per hour. ` +
        `Sustained night-time use can mean a tap, fixture or tank is running, but it can also be a timer or appliance.`,
      observedLitres: observed,
      expectedLitres: expected,
      excessLitres: excess,
      thresholdLitres: null,
      startHour: best.start,
      endHour,
    });
  }
  return out;
}
