import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { describedBy, Field } from '../../components/ui/Field';
import { Stat } from '../../components/ui/Stat';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { LIMITS } from '../../config/defaults';
import { ACTIONS } from '../../data/conservationActions';
import { actionById, logSavings, progressShare, summarize } from '../../lib/calc/challengeSavings';
import { addDays, formatDay, weekStart } from '../../lib/dates';
import { litres, num, percent, uid } from '../../lib/format';
import { useAppState } from '../../store/AppStateProvider';
import './challenges.css';
import { ChallengeCard } from './ChallengeCard';

export default function ChallengesPage() {
  usePageTitle('Challenges');
  const { state, dispatch, today } = useAppState();
  const { members, logs, goalLitres } = state.challenge;

  const ws = weekStart(today);
  const we = addDays(ws, 6);
  const week = summarize(logs, ACTIONS, ws, we);
  const todaySummary = summarize(logs, ACTIONS, today, today);
  const goalProgress = progressShare(week.totalLitres, goalLitres);
  const share = goalLitres / members.length;

  const [goalText, setGoalText] = useState(String(goalLitres));
  const [goalError, setGoalError] = useState<string>();
  const [goalSaved, setGoalSaved] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();

  const saveGoal = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(goalText);
    setGoalSaved(false);
    if (goalText.trim() === '' || !Number.isFinite(n) || n <= 0) return setGoalError('Enter a goal above 0 litres.');
    if (n > 100000) return setGoalError('Goal above 100,000 L is not accepted.');
    setGoalError(undefined);
    dispatch({ type: 'SET_GOAL', litres: Math.round(n) });
    setGoalSaved(true);
  };

  const addMember = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setNameError('Enter a name.');
    if (n.length > LIMITS.maxNameLength) return setNameError(`Use ${LIMITS.maxNameLength} characters or fewer.`);
    if (members.some((m) => m.name.toLowerCase() === n.toLowerCase())) return setNameError('That name is already on the list.');
    setNameError(undefined);
    dispatch({ type: 'ADD_MEMBER', member: { id: uid(), name: n } });
    setName('');
  };

  const removeMember = (id: string, memberName: string) => {
    if (window.confirm(`Remove ${memberName} and their challenge entries?`)) dispatch({ type: 'REMOVE_MEMBER', id });
  };

  const periodCount = (actionId: string, cadence: 'daily' | 'weekly') => {
    const s = summarize(logs, ACTIONS, cadence === 'daily' ? today : ws, cadence === 'daily' ? today : we);
    return s.byAction[actionId]?.units ?? 0;
  };

  const recent = [...logs].sort((a, b) => (a.date === b.date ? (a.loggedAt < b.loggedAt ? 1 : -1) : a.date < b.date ? 1 : -1)).slice(0, 8);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'Unknown';

  return (
    <>
      <div className="page-head">
        <h1>Ripple Challenge</h1>
        <p>
          An optional weekly challenge. Pick small habits, log when you do them, and track progress toward a saving goal.
          Savings shown here are <strong>self-reported estimates</strong> based on the stated assumptions. They are not read from your meter.
        </p>
      </div>

      <Card title="This week's goal" tone="mint">
        <div className="stack">
          <div className="grid grid--stats">
            <Stat label="Estimated saved this week" value={num(week.totalLitres)} unit="L" note="Self-reported estimate" tone="ok" />
            <Stat label="Weekly goal" value={num(goalLitres)} unit="L" note={`${formatDay(ws)} to ${formatDay(we)}`} />
            <Stat label="Progress" value={percent(goalProgress)} note={`${week.entries} entries, ${litres(todaySummary.totalLitres)} today`} />
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Progress toward weekly saving goal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(goalProgress * 100)}
          >
            <div className="progress__bar" style={{ width: `${goalProgress * 100}%` }} />
          </div>
          <form onSubmit={saveGoal} noValidate className="row" style={{ alignItems: 'flex-end' }}>
            <Field id="goal" label="Change weekly goal (litres)" error={goalError}>
              <input id="goal" className="input" inputMode="numeric" value={goalText} onChange={(e) => { setGoalText(e.target.value); setGoalSaved(false); }} aria-invalid={!!goalError} aria-describedby={describedBy('goal', undefined, goalError)} style={{ maxWidth: 200 }} />
            </Field>
            <Button type="submit" small>Save goal</Button>
            <span role="status" className="small" style={{ color: 'var(--ok)' }}>{goalSaved ? 'Goal saved.' : ''}</span>
          </form>
        </div>
      </Card>

      <div className="stack">
        <h2>Daily challenges</h2>
        <div className="challenge-grid">
          {ACTIONS.filter((a) => a.cadence === 'daily').map((a) => (
            <ChallengeCard key={a.id} action={a} members={members} today={today} loggedInPeriod={periodCount(a.id, 'daily')} onLog={(log) => dispatch({ type: 'ADD_LOG', log })} />
          ))}
        </div>
        <h2>Weekly challenges</h2>
        <div className="challenge-grid">
          {ACTIONS.filter((a) => a.cadence === 'weekly').map((a) => (
            <ChallengeCard key={a.id} action={a} members={members} today={today} loggedInPeriod={periodCount(a.id, 'weekly')} onLog={(log) => dispatch({ type: 'ADD_LOG', log })} />
          ))}
        </div>
      </div>

      <Card title="Household view">
        <div className="stack">
          <p className="small muted">
            Everyone shares this browser, so entries are self-reported by whoever uses this device. Each person's share of the goal is the weekly goal divided by the number of members ({num(share)} L each).
          </p>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Estimated savings per household member this week</caption>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col" className="num">Entries</th>
                  <th scope="col" className="num">Estimated saved</th>
                  <th scope="col">Share of goal</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const s = week.byMember[m.id] ?? { litres: 0, entries: 0 };
                  const p = progressShare(s.litres, share);
                  return (
                    <tr key={m.id}>
                      <th scope="row">{m.name}</th>
                      <td className="num">{s.entries}</td>
                      <td className="num">{litres(s.litres)}</td>
                      <td>
                        <div className="mini-progress">
                          <div className="progress" role="progressbar" aria-label={`${m.name} progress toward their share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
                            <div className="progress__bar" style={{ width: `${p * 100}%` }} />
                          </div>
                          <span className="small muted">{percent(p)}</span>
                        </div>
                      </td>
                      <td>
                        {members.length > 1 && (
                          <Button small variant="ghost" onClick={() => removeMember(m.id, m.name)} aria-label={`Remove ${m.name}`}>
                            <Trash2 size={16} aria-hidden="true" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <form onSubmit={addMember} noValidate className="row" style={{ alignItems: 'flex-end' }}>
            <Field id="member-name" label="Add a household member" error={nameError}>
              <input id="member-name" className="input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!nameError} aria-describedby={describedBy('member-name', undefined, nameError)} style={{ maxWidth: 260 }} />
            </Field>
            <Button type="submit" small>Add member</Button>
          </form>
        </div>
      </Card>

      <Card title="Recent entries">
        {recent.length === 0 ? (
          <p className="muted">Nothing logged yet. Log a challenge above and it will appear here.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Most recent challenge entries</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th><th scope="col">Member</th><th scope="col">Challenge</th>
                  <th scope="col" className="num">Units</th><th scope="col" className="num">Estimated saved</th>
                  <th scope="col"><span className="sr-only">Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => (
                  <tr key={l.id}>
                    <td>{formatDay(l.date)}</td>
                    <td>{nameOf(l.memberId)}</td>
                    <td>{actionById(ACTIONS, l.actionId)?.title ?? 'Removed challenge'}</td>
                    <td className="num">{l.units}</td>
                    <td className="num">{litres(logSavings(l, ACTIONS))}</td>
                    <td>
                      <Button small variant="ghost" aria-label={`Delete entry from ${formatDay(l.date)}`} onClick={() => dispatch({ type: 'DELETE_LOG', id: l.id })}>
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
