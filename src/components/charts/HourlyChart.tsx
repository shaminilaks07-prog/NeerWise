import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { hourLabel } from '../../lib/dates';
import { litres } from '../../lib/format';
import type { HourlyRecord } from '../../types/water';
import { CHART } from './palette';
import './charts.css';

interface Props {
  records: HourlyRecord[];
  /** Hours [startHour, endHour) drawn in the alert colour. */
  highlightStart?: number;
  highlightEnd?: number;
  caption: string;
}

export function HourlyChart({ records, highlightStart, highlightEnd, caption }: Props) {
  const byHour = new Map(records.map((r) => [r.hour, r.litres]));
  const data = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: String(h).padStart(2, '0'), litres: byHour.get(h) ?? null }));
  const isHot = (h: number) => highlightStart !== undefined && highlightEnd !== undefined && h >= highlightStart && h < highlightEnd;

  return (
    <div className="chart-box" style={{ height: 200 }} role="img" aria-label={caption}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART.axis }} interval={2} />
          <YAxis tick={{ fontSize: 12, fill: CHART.axis }} width={44} label={{ value: 'Litres per hour', angle: -90, position: 'insideLeft', fill: CHART.axis, fontSize: 12, dx: 4 }} />
          <Tooltip
            cursor={{ fill: 'rgba(27,106,168,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { hour: number; litres: number | null };
              return (
                <div className="chart-tooltip">
                  <p>
                    <strong>{hourLabel(p.hour)}</strong>
                  </p>
                  <p>{p.litres === null ? 'No data' : litres(p.litres, 1)}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="litres" isAnimationActive={false} radius={[2, 2, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.hour} fill={isHot(d.hour) ? CHART.over : CHART.actual} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
