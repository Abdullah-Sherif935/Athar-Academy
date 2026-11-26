import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-h3">{title}</h3>
      <p className="text-small" style={{ maxWidth: '42ch' }}>
        {description}
      </p>
      {action ? <div style={{ marginBlockStart: '8px' }}>{action}</div> : null}
    </div>
  );
}
