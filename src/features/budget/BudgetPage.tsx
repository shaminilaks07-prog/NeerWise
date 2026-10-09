import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BudgetGauge } from '../../components/charts/BudgetGauge';
import { Recommendations } from '../../components/Recommendations';
import { Card } from '../../components/ui/Card';
import { describedBy, Field } from '../../components/ui/Field';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Stat } from '../../components/ui/Stat';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { dailyMap } from '../../lib/calc/aggregate';
import { runScenario } from '../../lib/calc/scenario';
import { addDays, formatDay, weekdayShort } from '../../lib/dates';
import { litres, num } from '../../lib/format';
import { useAppState } from '../../store/AppStateProvider';
import { useDerived } from '../../store/useDerived';
import './budget.css';
import { WeekChart } from './WeekChart';
import type { WeekDay } from './WeekChart';

export default function BudgetPage() {
  usePageTitle('Water Budget');
  const { state } = useAppState();
  const d = useDerived();
  const { projection: p, weeklyBudget } = d;
  const [pctText, setPctText] = useState('10');

  const pctNum = Number(pctText);
  const pctValid = pctText.trim() !== '' && Number.isFinite(pctNum) && pctNum >= 0 && pctNum <= 100;
  const pct = pctValid ? pctNum : 0;
  const pctError = pctValid ? undefined : 'Enter a percentage from 0 to 100.';

  const ready = p.status === 'ok' && p.expectedRemaining !== null && p.baselineDaily !== null;
  const expectedRemaining = p.expectedRemaining ?? 0;
  const scenario = ready ? runScenario(p.usedSoFar, expectedRemaining, weeklyBudget, pct) : null;
  const baseline = runScenario(p.usedSoFar, expectedRemaining, weeklyBudget, 0);
  const over = ready && weeklyBudget > 0 && (p.projectedTotal ?? 0) > weeklyBudget;

  // Day-by-day view for the week
  const map = dailyMap(state.daily);
  const keep = 1 - pct / 100;
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(p.weekStart, i);
    const label = weekdayShort(date);
    const logged = map.get(date);
    if (date < d.today) return { date, label, actual: logged ?? null, expected: null };
    if (!ready || p.baselineDaily === null) return { date, label, actual: logged ?? null, expected: null };
    if (date === d.today) {
      const rest = Math.max(0, p.baselineDaily - p.todayUsed) * keep;
      return { date, label, actual: logged ?? null, expected: rest };
    }
    return { date, label, actual: null, expected: p.baselineDaily * keep };
  });

  return (
    <>
      <div className="page-head">
        <h1>Water Budget</h1>
        <p>
          See how the week is likely to end, then test a saving to find out what it would take to stay within budget.
          Every figure below is simple arithmetic on your logged days, and the steps are shown at the bottom of this page.
        </p>
      </div>

      <Card
        title="Where the week stands"
        actions={<Link to="/settings">Change budget</Link>}
      >
        <div className="stack">
          <div className="grid grid--stats">
            <Stat label="Used so far" value={num(p.usedSoFar)} unit="L" note={`${p.daysLoggedThisWeek} days logged`} />
            <Stat label="Weekly budget" value={weeklyBudget > 0 ? num(weeklyBudget) : 'Not set'} unit={weeklyBudget > 0 ? 'L' : undefined} note={weeklyBudget > 0 ? `${num(weeklyBudget / 7, 10)} L per day` : <Link to="/settings">Set a budget</Link>} />
            <Stat
              label="Estimated end of week"
              value={p.projectedTotal === null ? 'Not enough data' : num(p.projectedTotal, 10)}
              unit={p.projectedTotal === null ? undefined : 'L'}
              tone={d.projState === 'over' ? 'over' : d.projState === 'near' ? 'near' : 'default'}
              note={p.projectedTotal === null ? p.reason : <><SourceBadge source="predicted" /> range {num(p.rangeLow, 10)} to {num(p.rangeHigh, 10)} L</>}
            />
          </div>
          <BudgetGauge used={p.usedSoFar} budget={weeklyBudget} projected={p.projectedTotal} />
        </div>
      </Card>

      {!ready ? (
        <div className="notice notice--info" role="status">
          {p.reason ?? 'Not enough data for an estimate.'} <Link to="/history">Add daily totals</Link> to unlock the scenario planner.
        </div>
      ) : (
        <div className="grid grid--2">
          <Card title="Saving scenario" tone="blue">
            <div className="stack">
              <p className="small muted">
                Choose how much less water the household uses for the rest of the week. The reduction applies only to water not yet used.
              </p>
              <Field id="pct" label="Reduce remaining use by (%)" error={pctError}>
                <div className="range-row">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={Math.min(50, pct)}
                    onChange={(e) => setPctText(e.target.value)}
                    aria-label="Reduction percentage slider"
                  />
                  <input
                    id="pct"
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={pctText}
                    onChange={(e) => setPctText(e.target.value)}
                    aria-invalid={!!pctError}
                    aria-describedby={describedBy('pct', undefined, pctError)}
                  />
                </div>
              </Field>

              {scenario && (
                <div className="scenario-result" aria-live="polite">
                  <Stat label="Estimated water saved" value={num(scenario.savedLitres, 10)} unit="L" note={<SourceBadge source="predicted" />} tone="ok" />
                  <Stat label="Estimated end of week" value={num(scenario.scenarioTotal, 10)} unit="L" note={`was ${num(baseline.scenarioTotal, 10)} L`} />
                  {scenario.vsBudget !== null && (
                    <Stat
                      label={scenario.vsBudget > 0 ? 'Still over budget by' : 'Under budget by'}
                      value={num(Math.abs(scenario.vsBudget), 10)}
                      unit="L"
                      tone={scenario.vsBudget > 0 ? 'over' : 'ok'}
                    />
                  )}
                </div>
              )}

              {scenario && over && scenario.neededPct !== null && (
                <p className="notice notice--warn">
                  To finish within budget you would need to cut the rest of the week's use by about {Math.ceil(scenario.neededPct)}%.
                </p>
              )}
              {scenario && over && scenario.unreachable && (
                <p className="notice notice--danger">
                  Even using no water for the rest of the week would not bring the total back to budget. Consider a higher budget or logging corrections in History.
                </p>
              )}
              {scenario && !over && weeklyBudget > 0 && (
                <p className="notice notice--ok">At the current pace the week is estimated to finish within budget.</p>
              )}
            </div>
          </Card>

          <Card title="Week by day">
            <WeekChart days={days} dailyBudget={weeklyBudget / 7} reductionPct={pct} />
          </Card>
        </div>
      )}

      {over && (
        <Card title="Practical ways to use less" tone="warn">
          <Recommendations people={state.profile.people} count={3} />
        </Card>
      )}

      <Card title="How these numbers were calculated">
        <details open>
          <summary>Show the steps with your numbers</summary>
          <ol className="calc-steps">
            <li>
              <strong>Weekly budget</strong>: {state.budget.period === 'daily' ? <>daily budget {num(state.budget.litres)} L × 7 = </> : 'as entered, '}
              <code>{litres(weeklyBudget)}</code>
            </li>
            <li>
              <strong>Used so far</strong>: the sum of logged days from {formatDay(p.weekStart)} to today = <code>{litres(p.usedSoFar)}</code>. Days with no entry count as nothing, not zero use.
            </li>
            <li>
              <strong>Typical day</strong>: the average of the up to 14 logged days before today
              {p.baselineDaily === null ? <> (found {p.baselineDaysUsed}, need at least 3, so no estimate is made)</> : <> ({p.baselineDaysUsed} found) = <code>{litres(p.baselineDaily, 10)}</code></>}
            </li>
            <li>
              <strong>Expected for the rest of the week</strong>: typical day × {p.daysAfterToday} full days left, plus whatever is still expected today (typical day − {num(p.todayUsed)} L logged today, never below 0)
              {ready && <> = <code>{litres(p.expectedRemaining, 10)}</code></>}
            </li>
            <li>
              <strong>Estimated end of week</strong>: used so far + expected rest of week{ready && <> = <code>{litres(p.projectedTotal, 10)}</code></>}. The range shown is one standard deviation of daily use across the remaining days.
            </li>
            <li>
              <strong>Scenario</strong>: water saved = expected rest of week × reduction; new total = used so far + expected rest × (1 − reduction)
              {scenario && <> = <code>{litres(scenario.savedLitres, 10)}</code> saved at {Math.round(pct)}%</>}
            </li>
          </ol>
          <p className="small muted" style={{ marginTop: 'var(--s3)' }}>
            Estimates are rounded to the nearest 10 L. This is an average of past days, not a forecast model. See <Link to="/methodology">Methodology and limits</Link>.
          </p>
        </details>
      </Card>
    </>
  );
}
