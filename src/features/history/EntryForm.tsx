import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { describedBy, Field } from '../../components/ui/Field';
import { formatDay } from '../../lib/dates';
import { litres } from '../../lib/format';
import { validateEntry } from '../../lib/validate';
import type { DailyRecord, ISODate } from '../../types/water';

interface Props {
  today: ISODate;
  existing: DailyRecord[];
  onSave: (record: DailyRecord) => void;
}

export function EntryForm({ today, existing, onSave }: Props) {
  const [date, setDate] = useState(today);
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<{ date?: string; litres?: string }>({});
  const [message, setMessage] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateEntry(date, value, today);
    setErrors(errs);
    setMessage('');
    if (errs.date || errs.litres) return;
    const prior = existing.find((r) => r.date === date);
    const n = Math.round(Number(value) * 10) / 10;
    onSave({ date, litres: n, source: 'user-entered' });
    setMessage(
      prior
        ? `Replaced ${litres(prior.litres)} (${prior.source === 'sample' ? 'sample data' : 'earlier entry'}) with ${litres(n)} for ${formatDay(date)}.`
        : `Saved ${litres(n)} for ${formatDay(date)}.`,
    );
    setValue('');
  };

  return (
    <form onSubmit={submit} noValidate className="stack">
      <div className="form-grid">
        <Field id="entry-date" label="Date" error={errors.date}>
          <input id="entry-date" className="input" type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} aria-describedby={describedBy('entry-date', undefined, errors.date)} />
        </Field>
        <Field id="entry-litres" label="Total used that day (litres)" hint="From your meter, bills or tank readings." error={errors.litres}>
          <input id="entry-litres" className="input" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!errors.litres} aria-describedby={describedBy('entry-litres', 'hint', errors.litres)} />
        </Field>
      </div>
      <div className="row">
        <Button type="submit" variant="primary">Save daily total</Button>
        <span role="status" className="small" style={{ color: 'var(--ok)' }}>{message}</span>
      </div>
      <p className="small muted">Saving a date that already has a value replaces it. Entries are stored only in this browser.</p>
    </form>
  );
}
