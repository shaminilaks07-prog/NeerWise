import { describe, expect, it } from 'vitest';
import { ACTIONS } from '../../data/conservationActions';
import { generateSample } from '../../data/sampleData';
import type { ChallengeLog } from '../../types/challenges';
import type { DailyRecord, HourlyRecord } from '../../types/water';
import { addDays, diffDays, isValidISODate, weekStart } from '../dates';
import { validateBudget, validateEntry, validateProfile } from '../validate';
import { weeklyTotals } from './aggregate';
import { detectAnomalies } from './anomaly';
import { budgetStatus, projectionState, weeklyBudgetOf } from './budget';
import { progressShare, summarize } from './challengeSavings';
import { projectWeek } from './projection';
import { runScenario } from './scenario';

// 2026-10-09 is a Friday, so the week runs Mon 2026-10-05 to Sun 2026-10-11.
const TODAY = '2026-10-09';

function flatDays(n: number, litres: number, endExclusive = TODAY): DailyRecord[] {
  return Array.from({ length: n }, (_, i) => ({
    date: addDays(endExclusive, -(n - i)),
    litres,
    source: 'user-entered' as const,
  }));
}

describe('dates', () => {
  it('finds the Monday of a week', () => {
    expect(weekStart(TODAY)).toBe('2026-10-05');
    expect(weekStart('2026-10-11')).toBe('2026-10-05');
    expect(weekStart('2026-10-05')).toBe('2026-10-05');
  });
  it('adds and diffs days across month ends', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(diffDays('2026-09-30', '2026-10-05')).toBe(5);
  });
  it('rejects impossible dates', () => {
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('2026-2-3')).toBe(false);
    expect(isValidISODate('2026-02-28')).toBe(true);
  });
});

describe('budget', () => {
  it('converts daily budgets and guards invalid input', () => {
    expect(weeklyBudgetOf({ period: 'daily', litres: 500 })).toBe(3500);
    expect(weeklyBudgetOf({ period: 'weekly', litres: 3600 })).toBe(3600);
    expect(weeklyBudgetOf({ period: 'weekly', litres: -1 })).toBe(0);
    expect(weeklyBudgetOf({ period: 'weekly', litres: NaN })).toBe(0);
  });
  it('computes remaining and utilization without dividing by zero', () => {
    const s = budgetStatus(1800, 3600);
    expect(s.remaining).toBe(1800);
    expect(s.utilization).toBeCloseTo(0.5);
    expect(s.state).toBe('on-track');
    expect(budgetStatus(3300, 3600).state).toBe('near');
    expect(budgetStatus(3700, 3600).state).toBe('over');
    expect(budgetStatus(100, 0).state).toBe('no-budget');
    expect(budgetStatus(100, 0).utilization).toBeNull();
  });
  it('classifies projections', () => {
    expect(projectionState(null, 3600)).toBe('no-budget');
    expect(projectionState(3700, 3600)).toBe('over');
    expect(projectionState(3300, 3600)).toBe('near');
    expect(projectionState(2000, 3600)).toBe('on-track');
  });
});

describe('projection', () => {
  it('uses used-so-far plus baseline for the rest of the week', () => {
    const p = projectWeek(flatDays(14, 500), TODAY);
    expect(p.status).toBe('ok');
    expect(p.usedSoFar).toBe(2000); // Mon-Thu, today not logged yet
    expect(p.daysAfterToday).toBe(2);
    expect(p.baselineDaily).toBe(500);
    expect(p.expectedRemaining).toBe(1500); // 500 * 2 + max(0, 500 - 0)
    expect(p.projectedTotal).toBe(3500);
  });
  it('does not double count when today is already above baseline', () => {
    const daily = [...flatDays(14, 500), { date: TODAY, litres: 700, source: 'user-entered' as const }];
    const p = projectWeek(daily, TODAY);
    expect(p.expectedRemaining).toBe(1000); // 500 * 2 + 0
    expect(p.projectedTotal).toBe(2000 + 700 + 1000);
  });
  it('reports insufficient data instead of guessing', () => {
    const p = projectWeek(flatDays(2, 500), TODAY);
    expect(p.status).toBe('insufficient-data');
    expect(p.projectedTotal).toBeNull();
  });
  it('handles no data at all', () => {
    const p = projectWeek([], TODAY);
    expect(p.status).toBe('insufficient-data');
    expect(p.usedSoFar).toBe(0);
  });
  it('ignores invalid records', () => {
    const bad: DailyRecord[] = [
      { date: 'nope', litres: 500, source: 'user-entered' },
      { date: '2026-10-08', litres: NaN, source: 'user-entered' },
      { date: '2026-10-07', litres: -5, source: 'user-entered' },
    ];
    expect(projectWeek(bad, TODAY).usedSoFar).toBe(0);
  });
});

describe('scenario', () => {
  it('applies the reduction to remaining use only', () => {
    const s = runScenario(2000, 1500, 3200, 10);
    expect(s.savedLitres).toBeCloseTo(150);
    expect(s.scenarioTotal).toBeCloseTo(3350);
    expect(s.vsBudget).toBeCloseTo(150);
    expect(s.neededPct).toBeCloseTo(20);
    expect(s.unreachable).toBe(false);
  });
  it('flags a budget that cannot be reached', () => {
    const s = runScenario(2000, 1500, 1000, 50);
    expect(s.unreachable).toBe(true);
    expect(s.neededPct).toBeNull();
  });
  it('needs no reduction when already under budget', () => {
    const s = runScenario(1000, 1000, 3000, 0);
    expect(s.neededPct).toBeNull();
    expect(s.unreachable).toBe(false);
  });
  it('clamps bad percentages', () => {
    expect(runScenario(0, 1000, 0, -20).savedLitres).toBe(0);
    expect(runScenario(0, 1000, 0, 500).savedLitres).toBe(1000);
    expect(runScenario(0, 1000, 0, NaN).savedLitres).toBe(0);
  });
});

describe('weekly totals', () => {
  it('sums Monday-Sunday weeks and counts logged days', () => {
    const w = weeklyTotals(flatDays(14, 500), TODAY, 2);
    expect(w).toHaveLength(2);
    expect(w[1].weekStart).toBe('2026-10-05');
    expect(w[1].total).toBe(2000);
    expect(w[1].daysLogged).toBe(4);
  });
});

describe('daily spike rule', () => {
  const base = flatDays(14, 500).map((r, i) => ({ ...r, litres: i % 2 ? 490 : 510 }));
  it('flags a day far above baseline', () => {
    const alerts = detectAnomalies({
      daily: [...base, { date: TODAY, litres: 1000, source: 'user-entered' }],
      hourly: [],
      today: TODAY,
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].rule).toBe('daily-spike');
    expect(alerts[0].severity).toBe('high');
    expect(alerts[0].excessLitres).toBeGreaterThan(400);
  });
  it('does not flag a normal day', () => {
    const alerts = detectAnomalies({
      daily: [...base, { date: TODAY, litres: 530, source: 'user-entered' }],
      hourly: [],
      today: TODAY,
    });
    expect(alerts).toHaveLength(0);
  });
  it('stays quiet without enough baseline', () => {
    const alerts = detectAnomalies({
      daily: [...flatDays(3, 500), { date: TODAY, litres: 2000, source: 'user-entered' }],
      hourly: [],
      today: TODAY,
    });
    expect(alerts).toHaveLength(0);
  });
});

describe('overnight rule', () => {
  const mk = (date: string, hours: number[], litres: number): HourlyRecord[] =>
    hours.map((hour) => ({ date, hour, litres, source: 'sample' }));
  it('flags 3+ consecutive hours at or above the threshold', () => {
    const hourly = [...mk('2026-10-08', [0, 4], 1), ...mk('2026-10-08', [1, 2, 3], 12)];
    const a = detectAnomalies({ daily: [], hourly, today: TODAY });
    expect(a).toHaveLength(1);
    expect(a[0].rule).toBe('overnight-flow');
    expect(a[0].startHour).toBe(1);
    expect(a[0].endHour).toBe(4);
    expect(a[0].observedLitres).toBe(36);
  });
  it('ignores short runs', () => {
    const hourly = [...mk('2026-10-08', [0, 3, 4], 1), ...mk('2026-10-08', [1, 2], 12)];
    expect(detectAnomalies({ daily: [], hourly, today: TODAY })).toHaveLength(0);
  });
});

describe('sample data', () => {
  it('is deterministic', () => {
    expect(generateSample(TODAY, 10)).toEqual(generateSample(TODAY, 10));
  });
  it('contains a partial today and the two injected events', () => {
    const { daily, hourly } = generateSample(TODAY, 10);
    expect(daily[daily.length - 1].date).toBe(TODAY);
    expect(hourly.filter((h) => h.date === TODAY)).toHaveLength(10);
    const ids = detectAnomalies({ daily, hourly, today: TODAY }).map((a) => a.id);
    expect(ids).toContain('daily-spike:2026-09-30');
    expect(ids).toContain('overnight-flow:2026-10-05');
  });
  it('labels everything as sample', () => {
    const { daily, hourly } = generateSample(TODAY, 10);
    expect(daily.every((d) => d.source === 'sample')).toBe(true);
    expect(hourly.every((h) => h.source === 'sample')).toBe(true);
  });
  it('omits today when it is midnight', () => {
    const { daily } = generateSample(TODAY, 0);
    expect(daily[daily.length - 1].date).toBe('2026-10-08');
  });
});

describe('challenge savings', () => {
  const logs: ChallengeLog[] = [
    { id: '1', memberId: 'a', actionId: 'tap-off-brushing', date: '2026-10-06', units: 4, loggedAt: '' },
    { id: '2', memberId: 'b', actionId: 'shorter-shower', date: '2026-10-07', units: 2, loggedAt: '' },
    { id: '3', memberId: 'a', actionId: 'does-not-exist', date: '2026-10-07', units: 5, loggedAt: '' },
    { id: '4', memberId: 'a', actionId: 'tap-off-brushing', date: '2026-09-01', units: 4, loggedAt: '' },
  ];
  it('multiplies units by documented litres per unit and ignores unknown or out-of-range logs', () => {
    const s = summarize(logs, ACTIONS, '2026-10-05', '2026-10-11');
    expect(s.totalLitres).toBe(4 * 8 + 2 * 18);
    expect(s.byMember.a.litres).toBe(32);
    expect(s.byMember.b.litres).toBe(36);
    expect(s.entries).toBe(2);
  });
  it('caps progress at 100% and survives a zero goal', () => {
    expect(progressShare(300, 150)).toBe(1);
    expect(progressShare(75, 150)).toBeCloseTo(0.5);
    expect(progressShare(75, 0)).toBe(0);
  });
});

describe('validation', () => {
  it('validates entries', () => {
    expect(validateEntry('2026-10-08', '420', TODAY)).toEqual({});
    expect(validateEntry('', '420', TODAY).date).toBeTruthy();
    expect(validateEntry('2026-10-10', '420', TODAY).date).toBeTruthy();
    expect(validateEntry('2026-10-08', '', TODAY).litres).toBeTruthy();
    expect(validateEntry('2026-10-08', '-3', TODAY).litres).toBeTruthy();
    expect(validateEntry('2026-10-08', 'abc', TODAY).litres).toBeTruthy();
    expect(validateEntry('2026-10-08', '999999', TODAY).litres).toBeTruthy();
  });
  it('validates budget and profile', () => {
    expect(validateBudget('3600')).toEqual({});
    expect(validateBudget('0').litres).toBeTruthy();
    expect(validateProfile('Home', '4')).toEqual({});
    expect(validateProfile('', '4').name).toBeTruthy();
    expect(validateProfile('Home', '2.5').people).toBeTruthy();
    expect(validateProfile('Home', '0').people).toBeTruthy();
  });
});
