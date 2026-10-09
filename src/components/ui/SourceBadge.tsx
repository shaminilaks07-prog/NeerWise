import type { DataSource } from '../../types/water';

const LABELS: Record<DataSource, { text: string; cls: string; title: string }> = {
  measured: { text: 'Measured', cls: 'badge--measured', title: 'Read from a meter or sensor.' },
  'user-entered': { text: 'Entered by you', cls: 'badge--user', title: 'Typed in by a person using this app.' },
  sample: { text: 'Sample data', cls: 'badge--sample', title: 'Generated demo data. Not a real reading.' },
  predicted: { text: 'Estimate', cls: 'badge--predicted', title: 'Calculated from past use. Not a reading.' },
};

export function SourceBadge({ source }: { source: DataSource }) {
  const s = LABELS[source];
  return (
    <span className={`badge ${s.cls}`} title={s.title}>
      {s.text}
    </span>
  );
}
