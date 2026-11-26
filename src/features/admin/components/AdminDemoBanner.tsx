import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Button } from '../../../components/ui';

export function AdminDemoBanner() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { exitAdminDemo } = usePlatformDemo();

  if (user) return null;

  return (
    <div className="student-demo-banner" role="region" aria-label={t('admin.demoBanner.badge')}>
      <div className="student-demo-banner__text">
        <ShieldCheck size={16} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} aria-hidden="true" />
        <Badge variant="brand">{t('admin.demoBanner.badge')}</Badge>
        <span>{t('admin.demoBanner.text')}</span>
      </div>
      <Button variant="tertiary" size="sm" onClick={exitAdminDemo}>
        {t('admin.demoBanner.exit')}
      </Button>
    </div>
  );
}
