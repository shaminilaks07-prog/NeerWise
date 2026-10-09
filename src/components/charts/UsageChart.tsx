import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { litres, num } from '../../lib/format';
import type { DataSource } from '../../types/water';
import { SourceBadge } from '../ui/SourceBadge';
import { CHART } from './palette';
import './charts.css';

export interface UsagePoint {
  date: string;
  label: string;
  litres: number | null;
  source?: Exclude<DataSource, 'predicted'>;
}

interface Props {
  data: UsagePoint[];
  /** Weekly budget / 7, drawn as a reference line when above zero. */
  dailyBudget?: number;
  height?: number;
  caption: string;
}

export function UsageChart({ data, dailyBudget = 0, height = 260, caption }: Props) {
  const loggedDays = data.filter((d) => d.litres !== null).length;

  return (
    <div className="stack--sm stack">
      <div className="chart-box" style={{ height }} role="img" aria-label={`${caption}. ${loggedDays} of ${data.length} days have data. Daily litres, bars above the daily budget line are orange.`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART.axis }} interval="preserveStartEnd" minTickGap={12} />
            <YAxis
              tick={{ fontSize: 12, fill: CHART.axis }}
              width={52}
              tickFormatter={(v: number) => num(v)}
              label={{ value: 'Litres per day', angle: -90, position: 'insideLeft', fill: CHART.axis, fontSize: 12, dx: 4 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(27,106,168,0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as UsagePoint;
                return (
                  <div className="chart-tooltip">
                    <p>
                      <strong>{p.label}</strong>
                    </p>
                    <p>{p.litres === null ? 'No data' : litres(p.litres)}</p>
                    {p.source && <SourceBadge source={p.source} />}
                  </div>
                );
              }}
            />
            {dailyBudget > 0 && (
              <ReferenceLine
                y={dailyBudget}
                stroke={CHART.budgetLine}
                strokeDasharray="5 4"
                label={{ value: `Daily budget ${num(dailyBudget, 10)} L`, position: 'insideTopRight', fill: CHART.budgetLine, fontSize: 12 }}
              />
            )}
            <Bar dataKey="litres" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.date} fill={dailyBudget > 0 && d.litres !== null && d.litres > dailyBudget ? CHART.over : CHART.actual} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>View chart data as a table</summary>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col" className="num">
                  Litres
                </th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{d.label}</td>
                  <td className="num">{d.litres === null ? 'No data' : num(d.litres)}</td>
                  <td>{d.source ? <SourceBadge source={d.source} /> : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
