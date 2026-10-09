import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART } from '../../components/charts/palette';
import '../../components/charts/charts.css';
import { litres, num } from '../../lib/format';
import { SourceBadge } from '../../components/ui/SourceBadge';

export interface WeekDay {
  date: string;
  label: string;
  actual: number | null;
  expected: number | null;
}

interface Props {
  days: WeekDay[];
  dailyBudget: number;
  reductionPct: number;
}

export function WeekChart({ days, dailyBudget, reductionPct }: Props) {
  const expectedName = reductionPct > 0 ? `Expected with ${Math.round(reductionPct)}% reduction` : 'Expected at current pace';
  return (
    <div className="stack stack--sm">
      <div className="chart-box" style={{ height: 260 }} role="img" aria-label="Water use by day this week. Solid bars are logged use. Lighter bars are estimates for the rest of the week.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART.axis }} />
            <YAxis tick={{ fontSize: 12, fill: CHART.axis }} width={52} tickFormatter={(v: number) => num(v)} label={{ value: 'Litres per day', angle: -90, position: 'insideLeft', fill: CHART.axis, fontSize: 12, dx: 4 }} />
            <Tooltip
              cursor={{ fill: 'rgba(27,106,168,0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as WeekDay;
                return (
                  <div className="chart-tooltip">
                    <p><strong>{p.label}</strong></p>
                    {p.actual !== null && <p>Logged: {litres(p.actual)}</p>}
                    {p.expected !== null && <p>{expectedName}: {litres(p.expected, 10)} <SourceBadge source="predicted" /></p>}
                    {p.actual === null && p.expected === null && <p>No data</p>}
                  </div>
                );
              }}
            />
            {dailyBudget > 0 && <ReferenceLine y={dailyBudget} stroke={CHART.budgetLine} strokeDasharray="5 4" label={{ value: `Daily budget ${num(dailyBudget, 10)} L`, position: 'insideTopRight', fill: CHART.budgetLine, fontSize: 12 }} />}
            <Bar dataKey="actual" stackId="d" fill={CHART.actual} isAnimationActive={false} />
            <Bar dataKey="expected" stackId="d" fill={reductionPct > 0 ? CHART.scenario : CHART.expected} stroke={CHART.actual} strokeDasharray="3 3" isAnimationActive={false} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="week-legend">
        <li><span className="swatch swatch--used" /> Logged use</li>
        <li><span className="swatch" style={{ background: reductionPct > 0 ? CHART.scenario : CHART.expected }} /> {expectedName}</li>
      </ul>
      <details>
        <summary>View chart data as a table</summary>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Water use by day this week</caption>
            <thead><tr><th scope="col">Day</th><th scope="col" className="num">Logged (L)</th><th scope="col" className="num">Expected (L)</th></tr></thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date}>
                  <td>{d.label}</td>
                  <td className="num">{d.actual === null ? '–' : num(d.actual)}</td>
                  <td className="num">{d.expected === null ? '–' : num(d.expected, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
