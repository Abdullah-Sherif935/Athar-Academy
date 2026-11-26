import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge } from '../../../components/ui';
import type { DemoStudentProfile } from '../../../data/mock/student';

export function StudentWelcomeCard({
  profile,
  overallPercent,
}: {
  profile: DemoStudentProfile;
  overallPercent: number;
}) {
  const { t, locale } = useI18n();

  return (
    <div className="welcome-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          className="instructor-avatar accent-badge--teal"
          style={{ width: 60, height: 60, fontSize: '1.25rem' }}
          aria-hidden="true"
        >
          {profile.initials}
        </div>
        <div>
          <Badge variant="teal">{t('common.demoBadge')}</Badge>
          <h1 className="text-h1" style={{ marginBlockStart: 6 }}>
            {t('student.dashboard.welcome', { name: profile.fullName[locale] })}
          </h1>
          <p className="text-small" style={{ marginBlockStart: 4 }}>
            {t('student.dashboard.subtitle')}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', paddingInline: 12 }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }} className="ltr-inline">
            {overallPercent}%
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            {t('student.dashboard.overallProgress')}
          </div>
        </div>
        <Link to="/student/my-learning" className="ui-btn ui-btn--primary ui-btn--md">
          {t('student.nav.myLearning')}
        </Link>
      </div>
    </div>
  );
}
