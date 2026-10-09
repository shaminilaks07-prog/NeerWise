import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { describedBy, Field } from '../../components/ui/Field';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { BRAND } from '../../config/brand';
import { generateSample } from '../../data/sampleData';
import { weeklyBudgetOf } from '../../lib/calc/budget';
import { litres, num } from '../../lib/format';
import { normalizeBudget, validateBudget, validateProfile } from '../../lib/validate';
import { clearSavedState } from '../../store/persistence';
import { createInitialState } from '../../store/initialState';
import { useAppState } from '../../store/AppStateProvider';
import type { BudgetPeriod } from '../../types/water';

export default function SettingsPage() {
  usePageTitle('Settings');
  const { state, dispatch, today, nowHour } = useAppState();

  const [name, setName] = useState(state.profile.name);
  const [people, setPeople] = useState(String(state.profile.people));
  const [period, setPeriod] = useState<BudgetPeriod>(state.budget.period);
  const [budget, setBudget] = useState(String(state.budget.litres));
  const [errors, setErrors] = useState<{ name?: string; people?: string; budget?: string }>({});
  const [saved, setSaved] = useState('');
  const [dataMsg, setDataMsg] = useState('');

  const save = (e: FormEvent) => {
    e.preventDefault();
    const pe = validateProfile(name, people);
    const be = validateBudget(budget);
    setErrors({ name: pe.name, people: pe.people, budget: be.litres });
    setSaved('');
    if (pe.name || pe.people || be.litres) return;
    dispatch({ type: 'SET_PROFILE', profile: { name: name.trim(), people: Number(people) } });
    dispatch({ type: 'SET_BUDGET', budget: normalizeBudget(period, budget) });
    setSaved(`Saved. Weekly budget is ${litres(weeklyBudgetOf(normalizeBudget(period, budget)))}.`);
  };

  const preview = !validateBudget(budget).litres ? weeklyBudgetOf(normalizeBudget(period, budget)) : null;

  const loadSample = () => {
    if (state.daily.some((r) => r.source !== 'sample') && !window.confirm('This replaces all logged days, including entries you typed in, with generated sample data. Continue?')) return;
    const s = generateSample(today, nowHour);
    dispatch({ type: 'LOAD_SAMPLE', daily: s.daily, hourly: s.hourly });
    setDataMsg('Sample data loaded. It is generated, not measured.');
  };
  const clearUsage = () => {
    if (!window.confirm('Delete all logged water use and alert decisions? Your budget and profile are kept.')) return;
    dispatch({ type: 'CLEAR_USAGE' });
    setDataMsg('All logged use deleted.');
  };
  const resetAll = () => {
    if (!window.confirm('Reset the whole app to its starting state, with fresh sample data? Budget, profile and challenge entries will be replaced.')) return;
    clearSavedState();
    const fresh = createInitialState(today, nowHour, true);
    dispatch({ type: 'RESET_ALL', state: fresh });
    setName(fresh.profile.name);
    setPeople(String(fresh.profile.people));
    setPeriod(fresh.budget.period);
    setBudget(String(fresh.budget.litres));
    setErrors({});
    setSaved('');
    setDataMsg('App reset to its starting state.');
  };

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Your household details and water budget. Everything here is stored only in this browser.</p>
      </div>

      <Card title="Household and budget">
        <form onSubmit={save} noValidate className="stack">
          <div className="form-grid">
            <Field id="hh-name" label="Household name" error={errors.name}>
              <input id="hh-name" className="input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={describedBy('hh-name', undefined, errors.name)} />
            </Field>
            <Field id="hh-people" label="People in the household" hint="Used to size the saving tips." error={errors.people}>
              <input id="hh-people" className="input" inputMode="numeric" value={people} onChange={(e) => setPeople(e.target.value)} aria-invalid={!!errors.people} aria-describedby={describedBy('hh-people', 'hint', errors.people)} />
            </Field>
          </div>
          <div className="form-grid">
            <Field id="budget-period" label="Budget is set per">
              <select id="budget-period" className="select" value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}>
                <option value="weekly">Week</option>
                <option value="daily">Day</option>
              </select>
            </Field>
            <Field id="budget-litres" label={`Budget (litres per ${period === 'daily' ? 'day' : 'week'})`} hint={preview !== null ? `Equals ${num(preview)} L per week, ${num(preview / 7, 10)} L per day.` : undefined} error={errors.budget}>
              <input id="budget-litres" className="input" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} aria-invalid={!!errors.budget} aria-describedby={describedBy('budget-litres', preview !== null ? 'hint' : undefined, errors.budget)} />
            </Field>
          </div>
          <div className="row">
            <Button type="submit" variant="primary">Save settings</Button>
            <span role="status" className="small" style={{ color: 'var(--ok)' }}>{saved}</span>
          </div>
        </form>
      </Card>

      <Card title="Demo and data controls">
        <div className="stack">
          <p className="muted measure">
            {state.daily.length} daily entries are stored ({state.daily.filter((r) => r.source === 'sample').length} sample, {state.daily.filter((r) => r.source === 'user-entered').length} entered by you).
            Sample data is generated to end today so the demo always has a current week. Load it again on another day to refresh the dates.
          </p>
          <div className="row">
            <Button onClick={loadSample}>Load sample data</Button>
            <Button variant="danger" onClick={clearUsage}>Delete all logged use</Button>
            <Button variant="danger" onClick={resetAll}>Reset {BRAND.name}</Button>
          </div>
          <p role="status" className="small" style={{ color: 'var(--ok)' }}>{dataMsg}</p>
        </div>
      </Card>
    </>
  );
}
