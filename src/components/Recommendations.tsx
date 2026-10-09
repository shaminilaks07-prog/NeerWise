import { ACTIONS } from '../data/conservationActions';
import { rankActions, weeklyPotential } from '../lib/calc/recommend';
import { litres } from '../lib/format';

interface Props {
  people: number;
  count?: number;
}

/** Ranked by rough weekly potential. Figures are planning assumptions, shown with their basis. */
export function Recommendations({ people, count = 2 }: Props) {
  const ranked = rankActions(ACTIONS, people).slice(0, count);
  return (
    <ul className="stack stack--sm" style={{ listStyle: 'none', padding: 0 }}>
      {ranked.map((a) => (
        <li key={a.id} className="stack stack--sm" style={{ margin: 0 }}>
          <strong>{a.title}</strong>
          <span className="muted small">
            {a.detail} Planning estimate: up to about {litres(weeklyPotential(a, people), 10)} a week for {people}{' '}
            {people === 1 ? 'person' : 'people'}.
          </span>
          <details>
            <summary className="small">How this estimate was made</summary>
            <p className="small muted">
              {a.litresPerUnit} L per {a.unitLabel}. {a.basis} This is an assumption, not a measurement of your home.
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
