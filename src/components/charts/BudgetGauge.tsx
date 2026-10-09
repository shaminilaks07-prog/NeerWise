import { litres, num } from '../../lib/format';
import './charts.css';

interface Props {
  used: number;
  budget: number;
  /** Projected end-of-period total, or null when there is not enough data. */
  projected: number | null;
}

function niceStep(max: number): number {
  const steps = [100, 250, 500, 1000, 2500, 5000, 10000, 25000];
  return steps.find((s) => max / s <= 8) ?? 50000;
}

/** A horizontal measuring tank: filled to what has been used, hatched to the estimate, marker at the budget. */
export function BudgetGauge({ used, budget, projected }: Props) {
  const hasBudget = budget > 0;
  const max = Math.max(budget, used, projected ?? 0, 1) * 1.08;
  const w = (v: number) => `${(v / max) * 100}%`;
  const within = Math.min(used, hasBudget ? budget : used);
  const over = hasBudget ? Math.max(0, used - budget) : 0;
  const projEnd = projected !== null && projected > used ? projected : null;

  const step = niceStep(max);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);

  const label =
    `Water used ${litres(used)}` +
    (hasBudget ? ` of a ${litres(budget)} budget` : ', no budget set') +
    (projected !== null ? `. Estimated end of week: ${litres(projected, 10)}.` : '. No estimate yet.');

  return (
    <div className="gauge">
      <div className="gauge__body" role="img" aria-label={label}>
        <div className="gauge__track">
          <div className="gauge__fill" style={{ left: 0, width: w(within) }} />
          {over > 0 && <div className="gauge__fill gauge__fill--over" style={{ left: w(within), width: w(over) }} />}
          {projEnd !== null && <div className="gauge__proj" style={{ left: w(used), width: w(projEnd - used) }} />}
          {hasBudget && <div className="gauge__budget" style={{ left: w(budget) }} />}
        </div>
        <div className="gauge__scale" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ left: w(t) }}>
              {num(t)}
            </span>
          ))}
        </div>
      </div>
      <ul className="gauge__legend">
        <li>
          <span className="swatch swatch--used" /> Used so far
        </li>
        {over > 0 && (
          <li>
            <span className="swatch swatch--over" /> Over budget
          </li>
        )}
        {projEnd !== null && (
          <li>
            <span className="swatch swatch--proj" /> Estimated rest of week
          </li>
        )}
        {hasBudget && (
          <li>
            <span className="swatch swatch--budget" /> Budget: {litres(budget)}
          </li>
        )}
      </ul>
    </div>
  );
}
