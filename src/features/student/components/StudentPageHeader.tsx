import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';

export interface StudentPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  action?: ReactNode;
}

export function StudentPageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
}: StudentPageHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="student-page-header">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {idx > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-h1">{title}</h1>
        {subtitle ? (
          <p className="text-small" style={{ marginBlockStart: 6, maxWidth: '64ch' }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
