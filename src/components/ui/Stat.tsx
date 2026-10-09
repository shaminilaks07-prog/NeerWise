import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  note?: ReactNode;
  tone?: 'default' | 'ok' | 'near' | 'over';
}

export function Stat({ label, value, unit, note, tone = 'default' }: StatProps) {
  return (
    <div className={`stat stat--${tone}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">
        {value}
        {unit && <span className="stat__unit">{unit}</span>}
      </span>
      {note && <span className="stat__note">{note}</span>}
    </div>
  );
}
