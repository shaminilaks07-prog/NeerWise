const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Format a number, rounded to the nearest `step`. Returns an en dash for missing values. */
export function num(n: number | null | undefined, step = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  return nf.format(Math.round(n / step) * step);
}

/** "3,600 L". Use step=10 for estimates so they do not look more precise than they are. */
export function litres(n: number | null | undefined, step = 1): string {
  const v = num(n, step);
  return v === '–' ? v : `${v} L`;
}

export function percent(share: number | null | undefined): string {
  if (share === null || share === undefined || !Number.isFinite(share)) return '–';
  return `${Math.round(share * 100)}%`;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
