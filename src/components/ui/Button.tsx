import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
}

export function Button({ variant = 'secondary', small = false, type = 'button', className = '', ...rest }: ButtonProps) {
  return <button type={type} className={`btn btn--${variant}${small ? ' btn--sm' : ''} ${className}`.trim()} {...rest} />;
}

export function LinkButton({ to, variant = 'secondary', children }: { to: string; variant?: Variant; children: ReactNode }) {
  return (
    <Link to={to} className={`btn btn--${variant}`}>
      {children}
    </Link>
  );
}
