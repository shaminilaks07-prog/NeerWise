import { Check, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { HourlyChart } from '../../components/charts/HourlyChart';
import { Button } from '../../components/ui/Button';
import { Stat } from '../../components/ui/Stat';
import { formatDay, hourLabel } from '../../lib/dates';
import { litres } from '../../lib/format';
import type { AlertView } from '../../store/useDerived';
import type { AlertDecision } from '../../types/alerts';
import type { HourlyRecord } from '../../types/water';
import { GUIDANCE } from './guidance';
import './detective.css';

interface Props {
  alert: AlertView;
  hourly: HourlyRecord[];
  onDecide: (id: string, decision: AlertDecision) => void;
  onRestore: (id: string) => void;
}

export function AlertCard({ alert, hourly, onDecide, onRestore }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const g = GUIDANCE[alert.rule];
  const dayHourly = hourly.filter((h) => h.date === alert.date);
  const closed = alert.status !== null;
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article className={`card alert-card alert-card--${closed ? 'closed' : alert.severity}`} aria-labelledby={`t-${alert.id}`}>
      <div className="row row--between">
        <div className="row">
          <span className={`badge badge--${alert.severity}`}>{alert.severity === 'high' ? 'High' : 'Watch'}</span>
          {alert.status && (
            <span className="badge badge--done">{alert.status.decision === 'acknowledged' ? 'Acknowledged' : 'Dismissed'}</span>
          )}
        </div>
        <span className="small muted">{formatDay(alert.date)}</span>
      </div>

      <div className="stack stack--sm">
        <h2 id={`t-${alert.id}`}>{alert.title}</h2>
        <p className="small"><strong>Suspicious pattern, not a confirmed leak.</strong> This app only compares numbers and cannot see inside your pipes.</p>
      </div>

      <div className="alert-metrics">
        <Stat label={alert.rule === 'overnight-flow' ? 'Night-time use' : 'Logged that day'} value={litres(alert.observedLitres)} />
        <Stat label="Normal for comparison" value={litres(alert.expectedLitres, 10)} />
        <Stat label="Above normal by" value={litres(alert.excessLitres, 10)} tone={alert.severity === 'high' ? 'over' : 'near'} />
        {alert.startHour !== undefined && alert.endHour !== undefined && (
          <Stat label="Time period" value={`${hourLabel(alert.startHour)} to ${hourLabel(alert.endHour)}`} />
        )}
      </div>

      <div className="stack stack--sm">
        <h3>Why this alert appeared</h3>
        <p>{alert.explanation}</p>
      </div>

      {dayHourly.length > 0 && (
        <div className="stack stack--sm">
          <h3>Hour-by-hour use on {formatDay(alert.date)}</h3>
          <HourlyChart
            records={dayHourly}
            highlightStart={alert.startHour}
            highlightEnd={alert.endHour}
            caption={`Litres used in each hour on ${formatDay(alert.date)}.${alert.startHour !== undefined ? ' The flagged hours are orange.' : ''}`}
          />
        </div>
      )}

      {!closed && (
        <details>
          <summary>Possible causes and what to check</summary>
          <div className="stack">
            <div className="stack stack--sm">
              <h3>Possible causes</h3>
              <ul>{g.causes.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div className="stack stack--sm">
              <h3>Investigation checklist</h3>
              <ul className="checklist">
                {g.checklist.map((item, i) => (
                  <li key={item}>
                    <label>
                      <input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} />
                      <span>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="small muted">{checked.size} of {g.checklist.length} checked. Checklist ticks are not saved.</p>
            </div>
          </div>
        </details>
      )}

      <div className="alert-actions">
        {!closed ? (
          <>
            <Button variant="primary" small onClick={() => onDecide(alert.id, 'acknowledged')}>
              <Check size={16} aria-hidden="true" /> Acknowledge
            </Button>
            <Button small onClick={() => onDecide(alert.id, 'dismissed')}>
              <X size={16} aria-hidden="true" /> Dismiss
            </Button>
          </>
        ) : (
          <Button small onClick={() => onRestore(alert.id)}>
            <RotateCcw size={16} aria-hidden="true" /> Move back to open
          </Button>
        )}
      </div>
    </article>
  );
}
