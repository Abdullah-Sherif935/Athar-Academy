import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ interactive = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`ui-card ${interactive ? 'ui-card--interactive' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
