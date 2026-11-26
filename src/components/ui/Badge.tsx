import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'brand' | 'teal' | 'orange' | 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>{children}</span>;
}
