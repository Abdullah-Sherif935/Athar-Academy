import { RotateCcw, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Button } from '../../../components/ui';
import { useStudentDemo } from '../context/StudentDemoContext';

export function DemoModeBanner() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { resetDemoData, exitDemoMode } = useStudentDemo();

  if (user) return null;

  return (
    <div className="demo-banner" role="status">
      <div className="demo-banner__text">
        <ShieldAlert size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} aria-hidden="true" />
        <span>{t('student.demoBanner.label')}</span>
      </div>
      <div className="demo-banner__actions">
        <Button variant="secondary" size="sm" onClick={resetDemoData}>
          <RotateCcw size={14} aria-hidden="true" /> {t('student.demoBanner.reset')}
        </Button>
        <Button variant="tertiary" size="sm" onClick={exitDemoMode}>
          <LogOut size={14} aria-hidden="true" /> {t('student.demoBanner.exit')}
        </Button>
      </div>
    </div>
  );
}
