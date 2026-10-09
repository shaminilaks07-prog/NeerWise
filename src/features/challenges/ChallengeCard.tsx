import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { describedBy, Field } from '../../components/ui/Field';
import { isValidISODate } from '../../lib/dates';
import { litres, uid } from '../../lib/format';
import { validateUnits } from '../../lib/validate';
import type { ChallengeLog, ConservationAction, Member } from '../../types/challenges';
import type { ISODate } from '../../types/water';

interface Props {
  action: ConservationAction;
  members: Member[];
  today: ISODate;
  loggedInPeriod: number;
  onLog: (log: ChallengeLog) => void;
}

export function ChallengeCard({ action, members, today, loggedInPeriod, onLog }: Props) {
  const [memberId, setMemberId] = useState(members[0]?.id ?? '');
  const [units, setUnits] = useState('1');
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState<{ units?: string; date?: string }>({});
  const [done, setDone] = useState('');
  const id = `c-${action.id}`;

  // Keep the selected member valid if members change
  const activeMember = members.some((m) => m.id === memberId) ? memberId : members[0]?.id ?? '';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: { units?: string; date?: string } = {};
    const u = validateUnits(units, action.maxUnitsPerLog);
    if (u) next.units = u;
    if (!isValidISODate(date)) next.date = 'Enter a valid date.';
    else if (date > today) next.date = 'Future dates cannot be logged.';
    setErrors(next);
    setDone('');
    if (next.units || next.date) return;
    const n = Number(units);
    onLog({ id: uid(), memberId: activeMember, actionId: action.id, date, units: n, loggedAt: new Date().toISOString() });
    setDone(`Logged ${n} ${action.unitLabel}${n === 1 ? '' : 's'}. Estimated saving ${litres(n * action.litresPerUnit)} (self-reported).`);
    setUnits('1');
  };

  return (
    <article className="card challenge">
      <div className="row row--between">
        <h3>{action.title}</h3>
        <span className="badge">{action.cadence === 'daily' ? 'Daily' : 'Weekly'}</span>
      </div>
      <p className="small muted">{action.detail}</p>
      <p className="small">
        Counts as <strong>{action.litresPerUnit} L</strong> per {action.unitLabel}. Logged {action.cadence === 'daily' ? 'today' : 'this week'}: <strong>{loggedInPeriod}</strong>.
      </p>
      <details>
        <summary className="small">How {action.litresPerUnit} L was chosen</summary>
        <p className="small muted">{action.basis} It is a planning assumption, so your real saving may be lower or higher.</p>
      </details>
      <form onSubmit={submit} noValidate className="stack stack--sm">
        <div className="challenge__form">
          {members.length > 1 && (
            <Field id={`${id}-m`} label="Who">
              <select id={`${id}-m`} className="select" value={activeMember} onChange={(e) => setMemberId(e.target.value)}>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          )}
          <Field id={`${id}-u`} label={`How many (${action.unitLabel})`} error={errors.units}>
            <input id={`${id}-u`} className="input" inputMode="numeric" value={units} onChange={(e) => setUnits(e.target.value)} aria-invalid={!!errors.units} aria-describedby={describedBy(`${id}-u`, undefined, errors.units)} />
          </Field>
          <Field id={`${id}-d`} label="Date" error={errors.date}>
            <input id={`${id}-d`} className="input" type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} aria-describedby={describedBy(`${id}-d`, undefined, errors.date)} />
          </Field>
        </div>
        <div className="row">
          <Button type="submit" variant="primary" small>Log it</Button>
        </div>
        <p role="status" className="small" style={{ color: 'var(--ok)' }}>{done}</p>
      </form>
    </article>
  );
}
