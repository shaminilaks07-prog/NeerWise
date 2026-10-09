import type { ReactNode } from 'react';

/** Marks a detail the project owner must confirm before any public launch. */
export function OwnerNote({ children }: { children: ReactNode }) {
  return (
    <span className="notice notice--warn" style={{ display: 'block', margin: 'var(--s2) 0' }}>
      <strong>Owner to confirm before public launch:</strong> {children}
    </span>
  );
}
