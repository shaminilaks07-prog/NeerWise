import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  actions?: ReactNode;
  tone?: 'default' | 'mint' | 'blue' | 'warn';
  children: ReactNode;
  className?: string;
}

export function Card({ title, actions, tone = 'default', children, className = '' }: CardProps) {
  const toneClass = tone === 'default' ? '' : ` card--${tone}`;
  return (
    <section className={`card${toneClass} ${className}`.trim()}>
      {(title || actions) && (
        <div className="card__head">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
