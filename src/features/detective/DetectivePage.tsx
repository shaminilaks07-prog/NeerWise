import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { ANOMALY_CONFIG } from '../../config/defaults';
import { useAppState } from '../../store/AppStateProvider';
import { useDerived } from '../../store/useDerived';
import type { AlertDecision } from '../../types/alerts';
import { AlertCard } from './AlertCard';

type Tab = 'open' | 'acknowledged' | 'dismissed';

export default function DetectivePage() {
  usePageTitle('Waste Detective');
  const { state, dispatch } = useAppState();
  const d = useDerived();
  const [tab, setTab] = useState<Tab>('open');

  const counts: Record<Tab, number> = {
    open: d.alerts.filter((a) => a.status === null).length,
    acknowledged: d.alerts.filter((a) => a.status?.decision === 'acknowledged').length,
    dismissed: d.alerts.filter((a) => a.status?.decision === 'dismissed').length,
  };
  const shown = d.alerts.filter((a) => (tab === 'open' ? a.status === null : a.status?.decision === tab));
  const hasHourly = state.hourly.length > 0;
  const o = ANOMALY_CONFIG.overnight;

  const decide = (id: string, decision: AlertDecision) => dispatch({ type: 'SET_ALERT', id, decision, at: new Date().toISOString() });
  const restore = (id: string) => dispatch({ type: 'CLEAR_ALERT', id });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'open', label: 'Open' },
    { id: 'acknowledged', label: 'Acknowledged' },
    { id: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <>
      <div className="page-head">
        <h1>Waste Detective</h1>
        <p>
          Compares each recent day with your household's own history and flags usage that looks unusual. An alert means
          "worth a look", never "there is a leak". Without a flow sensor, only a physical check can confirm the cause.
        </p>
      </div>

      {state.daily.length === 0 ? (
        <EmptyState title="Nothing to compare yet" action={<Link className="btn btn--primary" to="/history">Add daily totals</Link>}>
          The detective needs at least {ANOMALY_CONFIG.minBaselineDays} earlier days of logged use before it can judge whether a day is unusual.
        </EmptyState>
      ) : (
        <>
          <div className="row" role="group" aria-label="Alert status filter">
            <div className="segmented">
              {tabs.map((t) => (
                <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                  {t.label} ({counts[t.id]})
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <EmptyState title={tab === 'open' ? 'No open alerts' : `No ${tab} alerts`}>
              {tab === 'open'
                ? `Nothing in the last ${ANOMALY_CONFIG.lookbackDays} days looks unusual compared with your history. New alerts appear when you log more days.`
                : 'Alerts you move here from Open will be listed with the date you decided.'}
            </EmptyState>
          ) : (
            <div className="stack">
              {shown.map((a) => (
                <AlertCard key={a.id} alert={a} hourly={state.hourly} onDecide={decide} onRestore={restore} />
              ))}
            </div>
          )}
        </>
      )}

      <Card title="How alerts are decided">
        <div className="stack stack--sm">
          <p>
            <strong>Unusually high day.</strong> A day is flagged when its total is above the average of the previous {ANOMALY_CONFIG.baselineWindow} logged days
            plus {ANOMALY_CONFIG.sigma} standard deviations, and at least {ANOMALY_CONFIG.minExcessLitres} L or {Math.round(ANOMALY_CONFIG.minExcessFraction * 100)}% above that average. It needs
            at least {ANOMALY_CONFIG.minBaselineDays} earlier days. It is marked High when the excess is {Math.round(ANOMALY_CONFIG.highExcessFraction * 100)}% or more of the average.
          </p>
          <p>
            <strong>Continuous night-time use.</strong> Flagged when each of {o.minConsecutiveHours} or more hours in a row between {String(o.startHour).padStart(2, '0')}:00 and {String(o.endHour + 1).padStart(2, '0')}:00 uses at least {o.minLitresPerHour} L.
            It is marked High when the excess over typical night use is {o.highLitres} L or more. {hasHourly ? '' : 'This rule needs hourly data, which is only available with sample data in this prototype.'}
          </p>
          <p className="small muted">Only the last {ANOMALY_CONFIG.lookbackDays} days are checked. Acknowledged and dismissed decisions are saved in this browser.</p>
        </div>
      </Card>
    </>
  );
}
