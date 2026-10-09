import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UsageChart } from '../../components/charts/UsageChart';
import type { UsagePoint } from '../../components/charts/UsageChart';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { usePageTitle } from '../../components/ui/usePageTitle';
import { dailyMap, weeklyTotals } from '../../lib/calc/aggregate';
import { addDays, formatDay, formatShort } from '../../lib/dates';
import { litres, num } from '../../lib/format';
import { useAppState } from '../../store/AppStateProvider';
import { useDerived } from '../../store/useDerived';
import { EntryForm } from './EntryForm';

const RANGES = [7, 14, 28] as const;
const ROW_LIMIT = 30;

export default function HistoryPage() {
  usePageTitle('History');
  const { state, dispatch, today } = useAppState();
  const d = useDerived();
  const [range, setRange] = useState<(typeof RANGES)[number]>(14);
  const [showAll, setShowAll] = useState(false);

  const map = dailyMap(state.daily);
  const sourceOf = new Map(state.daily.map((r) => [r.date, r.source]));
  const points: UsagePoint[] = Array.from({ length: range }, (_, i) => {
    const date = addDays(today, i - (range - 1));
    return { date, label: formatShort(date), litres: map.get(date) ?? null, source: sourceOf.get(date) };
  });
  const weeks = weeklyTotals(state.daily, today, 4);
  const newestFirst = [...state.daily].sort((a, b) => (a.date < b.date ? 1 : -1));
  const rows = showAll ? newestFirst : newestFirst.slice(0, ROW_LIMIT);

  return (
    <>
      <div className="page-head">
        <h1>History</h1>
        <p>Add daily totals and review past use. Days without an entry are shown as gaps, not as zero.</p>
      </div>

      <Card title="Add a daily total">
        <EntryForm today={today} existing={state.daily} onSave={(record) => dispatch({ type: 'UPSERT_DAILY', record })} />
      </Card>

      <Card
        title="Daily use"
        actions={
          <div className="segmented" role="group" aria-label="Chart period">
            {RANGES.map((r) => (
              <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
                {r} days
              </button>
            ))}
          </div>
        }
      >
        {state.daily.length === 0 ? (
          <EmptyState title="No data to chart">Save a daily total above and it will appear here.</EmptyState>
        ) : (
          <UsageChart data={points} dailyBudget={d.weeklyBudget / 7} caption={`Daily water use over the last ${range} days`} />
        )}
      </Card>

      <Card title="Weekly totals">
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Water use per Monday to Sunday week</caption>
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col" className="num">Days logged</th>
                <th scope="col" className="num">Total (L)</th>
                <th scope="col" className="num">Average per logged day (L)</th>
              </tr>
            </thead>
            <tbody>
              {[...weeks].reverse().map((w, i) => (
                <tr key={w.weekStart}>
                  <th scope="row">
                    {formatShort(w.weekStart)} to {formatShort(w.weekEnd)}
                    {i === 0 && <span className="muted"> (this week, in progress)</span>}
                  </th>
                  <td className="num">{w.daysLogged} of 7</td>
                  <td className="num">{w.daysLogged ? num(w.total) : '–'}</td>
                  <td className="num">{w.daysLogged ? num(w.total / w.daysLogged, 10) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 'var(--s3)' }}>Weeks run Monday to Sunday. Totals only include logged days.</p>
      </Card>

      <Card title="All entries">
        {rows.length === 0 ? (
          <EmptyState title="No entries">Entries you add or load from sample data are listed here.</EmptyState>
        ) : (
          <div className="stack">
            <div className="table-wrap">
              <table>
                <caption className="sr-only">Logged daily totals, newest first</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col" className="num">Litres</th>
                    <th scope="col">Source</th>
                    <th scope="col"><span className="sr-only">Delete</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.date}>
                      <th scope="row">{formatDay(r.date)}</th>
                      <td className="num">{litres(r.litres)}</td>
                      <td><SourceBadge source={r.source} /></td>
                      <td>
                        <Button small variant="ghost" aria-label={`Delete entry for ${formatDay(r.date)}`} onClick={() => dispatch({ type: 'DELETE_DAILY', date: r.date })}>
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {newestFirst.length > ROW_LIMIT && (
              <Button small onClick={() => setShowAll((s) => !s)}>
                {showAll ? 'Show fewer' : `Show all ${newestFirst.length} entries`}
              </Button>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
