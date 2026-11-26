import type { ReactNode } from 'react';
import { Card } from '../../../components/ui';

export function LearningStatCard({
  icon,
  value,
  label,
  tone = 'blue',
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  tone?: 'blue' | 'teal' | 'orange';
}) {
  const toneClass =
    tone === 'teal'
      ? 'feature-card__icon feature-card__icon--teal'
      : tone === 'orange'
        ? 'feature-card__icon feature-card__icon--orange'
        : 'feature-card__icon';

  return (
    <Card className="stat-card">
      <div className={toneClass} aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="stat-card__value ltr-inline">{value}</div>
        <div className="stat-card__label">{label}</div>
      </div>
    </Card>
  );
}
