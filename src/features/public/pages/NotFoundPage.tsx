import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, EmptyState } from '../../../components/ui';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <EmptyState
          icon={<Compass size={26} />}
          title={`${t('notFound.code')} — ${t('notFound.title')}`}
          description={t('notFound.description')}
          action={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <Badge variant="brand">404</Badge>
              <Link to="/" className="ui-btn ui-btn--primary ui-btn--md">
                {t('common.backToHome')}
              </Link>
              <Link to="/courses" className="ui-btn ui-btn--secondary ui-btn--md">
                {t('common.backToCourses')}
              </Link>
            </div>
          }
        />
      </div>
    </section>
  );
}
