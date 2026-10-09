import { Link } from 'react-router-dom';
import { LinkButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Stat } from '../../components/ui/Stat';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { BudgetGauge } from '../../components/charts/BudgetGauge';
import { UsageChart } from '../../components/charts/UsageChart';
import type { UsagePoint } from '../../components/charts/UsageChart';
import { Recommendations } from '../../components/Recommendations';
import { dailyMap } from '../../lib/calc/aggregate';
import { addDays, formatDay, formatShort, weekdayShort } from '../../lib/dates';
import { litres, num, percent } from '../../lib/format';
import { runScenario } from '../../lib/calc/scenario';
import { useAppState } from '../../store/AppStateProvider';
import { useDerived } from '../../store/useDerived';
import './overview.css';

export default function OverviewPage() {
  usePageTitle('Overview');
  const { state } = useAppState();
  const d = useDerived();
  const { projection, weeklyBudget, status, projState } = d;

  const hasData = state.daily.length > 0;
  const sourceOf = new Map(state.daily.map((r) => [r.date, r.source]));
  const map = dailyMap(state.daily);
  const points: UsagePoint[] = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(d.today, i - 13);
    return { date, label: formatShort(date), litres: map.get(date) ?? null, source: sourceOf.get(date) };
  });
  const usingSample = state.daily.some((r) => r.source === 'sample');
  const stale = d.latestDate !== null && d.latestDate < d.today;

  const over = projState === 'over' && projection.projectedTotal !== null;
  const needed =
    over && projection.expectedRemaining !== null
      ? runScenario(projection.usedSoFar, projection.expectedRemaining, weeklyBudget, 0).neededPct
      : null;

  const remainingTone = status.state === 'over' ? 'over' : status.state === 'near' ? 'near' : 'ok';
  const projTone = projState === 'over' ? 'over' : projState === 'near' ? 'near' : 'default';

  return (
    <>
      <div className="page-head">
        <h1>This week's water</h1>
        <p>
          Week of {formatDay(projection.weekStart)}. Compare what your household has used with a weekly budget,
          see where the week is heading, and review days that look unusual.
        </p>
      </div>

      {usingSample && (
        <div className="notice notice--warn" role="note">
          You are looking at <SourceBadge source="sample" />. These litres are generated for the demo and are not readings from a meter.{' '}
          <Link to="/settings">Replace or clear sample data</Link>.
        </div>
      )}

      {!hasData ? (
        <EmptyState
          title="No water use logged yet"
          action={<LinkButton to="/history" variant="primary">Add a daily total</LinkButton>}
        >
          Add the litres your household used on a few days and this page will show your budget, an end-of-week estimate and
          any unusual days. You can also load sample data from Settings to try the app.
        </EmptyState>
      ) : (
        <>
          <Card>
            <div className="hero">
              <div className="hero__lede">
                <h2>Budget status</h2>
                <p>
                  {weeklyBudget <= 0
                    ? 'No budget is set. Set one to see how much of it you have used.'
                    : status.state === 'over'
                      ? `You are ${litres(Math.abs(status.remaining ?? 0))} over this week's ${litres(weeklyBudget)} budget.`
                      : `You have used ${percent(status.utilization)} of this week's ${litres(weeklyBudget)} budget.`}
                </p>
                <div className="row">
                  <LinkButton to="/history" variant="primary">Add daily usage</LinkButton>
                  <LinkButton to="/budget">Try a saving scenario</LinkButton>
                </div>
              </div>
              <div className="grid grid--stats" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <Stat label="Used so far" value={num(projection.usedSoFar)} unit="L" note={`${projection.daysLoggedThisWeek} days logged this week`} />
                <Stat label="Weekly budget" value={weeklyBudget > 0 ? num(weeklyBudget) : 'Not set'} unit={weeklyBudget > 0 ? 'L' : undefined} />
                <Stat
                  label={status.state === 'over' ? 'Over budget by' : 'Budget remaining'}
                  value={status.remaining === null ? '–' : num(Math.abs(status.remaining))}
                  unit={status.remaining === null ? undefined : 'L'}
                  tone={status.remaining === null ? 'default' : remainingTone}
                />
                <Stat
                  label="Estimated end of week"
                  value={projection.projectedTotal === null ? 'Not enough data' : num(projection.projectedTotal, 10)}
                  unit={projection.projectedTotal === null ? undefined : 'L'}
                  tone={projTone}
                  note={
                    projection.projectedTotal === null ? (
                      projection.reason
                    ) : (
                      <>
                        <SourceBadge source="predicted" /> typical range {num(projection.rangeLow, 10)} to {num(projection.rangeHigh, 10)} L
                      </>
                    )
                  }
                />
              </div>
            </div>
          </Card>

          <Card title="Used against budget">
            <BudgetGauge used={projection.usedSoFar} budget={weeklyBudget} projected={projection.projectedTotal} />
          </Card>

          {stale && d.latestDate && (
            <div className="notice notice--info" role="note">
              Your latest entry is {formatDay(d.latestDate)}. Days without entries are left out of this week's total, so the figures above may be low.{' '}
              <Link to="/history">Add recent days</Link>.
            </div>
          )}

          <div className="grid grid--2">
            <Card title="Last 14 days">
              <UsageChart data={points} dailyBudget={weeklyBudget / 7} caption="Daily water use over the last 14 days" />
            </Card>

            <div className="stack">
              <Card title="Alerts to review" actions={<Link to="/detective">Open Waste Detective</Link>}>
                {d.openAlerts.length === 0 ? (
                  <p className="muted">No open alerts. Unusual days and night-time use will appear here.</p>
                ) : (
                  <div>
                    {d.openAlerts.slice(0, 3).map((a) => (
                      <div key={a.id} className="alert-row">
                        <div className="row">
                          <span className={`badge badge--${a.severity}`}>{a.severity === 'high' ? 'High' : 'Watch'}</span>
                          <strong>{a.title}</strong>
                        </div>
                        <span className="small muted">Suspicious pattern: about {litres(a.excessLitres, 10)} above normal.</span>
                      </div>
                    ))}
                    {d.openAlerts.length > 3 && <p className="small muted">{d.openAlerts.length - 3} more in Waste Detective.</p>}
                  </div>
                )}
              </Card>

              <Card title={over ? 'Next actions to stay in budget' : 'Next actions'} tone={over ? 'warn' : 'mint'}>
                {over && needed !== null && (
                  <p className="small" style={{ marginBottom: 'var(--s3)' }}>
                    At the current pace you would finish about {litres((projection.projectedTotal ?? 0) - weeklyBudget, 10)} over budget. Cutting the rest of the week's use by about {Math.ceil(needed)}% would bring it back to budget.
                  </p>
                )}
                <Recommendations people={state.profile.people} count={2} />
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
