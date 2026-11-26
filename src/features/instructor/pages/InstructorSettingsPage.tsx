import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { LanguageSwitcher } from '../../../components/brand/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { Alert, Button, Card } from '../../../components/ui';
import type { InstructorNotificationPreferences } from '../../../data/mock/instructor';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

const PREF_ITEMS: Array<{ key: keyof InstructorNotificationPreferences; labelKey: string }> = [
  { key: 'newStudentMessages', labelKey: 'instructor.settings.prefMessages' },
  { key: 'communityQuestions', labelKey: 'instructor.settings.prefCommunity' },
  { key: 'courseMilestones', labelKey: 'instructor.settings.prefMilestones' },
  { key: 'weeklySummary', labelKey: 'instructor.settings.prefWeekly' },
];

export function InstructorSettingsPage() {
  const { t, locale } = useI18n();
  const { profile, notificationPrefs, updateNotificationPref, resetDemoData } = useInstructorDemo();
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.settings.title')}
        subtitle={t('instructor.settings.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.settings') },
        ]}
      />

      <Card className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h3">{t('student.settings.appearanceTitle')}</h2>
        <div className="pref-row">
          <span className="text-small" style={{ fontWeight: 600 }}>
            {t('student.settings.languageLabel')}
          </span>
          <LanguageSwitcher />
        </div>
        <div className="pref-row">
          <span className="text-small" style={{ fontWeight: 600 }}>
            {t('student.settings.themeLabel')}
          </span>
          <ThemeSwitcher />
        </div>
      </Card>

      <Card className="details-stack" style={{ gap: 10 }}>
        <h2 className="text-h3">{t('instructor.settings.notificationsTitle')}</h2>
        {PREF_ITEMS.map(({ key, labelKey }) => (
          <label key={key} className="pref-row" style={{ cursor: 'pointer' }}>
            <span className="text-small" style={{ color: 'var(--text-primary)' }}>
              {t(labelKey)}
            </span>
            <input
              type="checkbox"
              checked={notificationPrefs[key]}
              onChange={(e) => updateNotificationPref(key, e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--brand-blue)' }}
            />
          </label>
        ))}
      </Card>

      <Card className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h3">{t('student.settings.accountTitle')}</h2>
        <div className="meta-kv-list">
          <div className="meta-kv-row">
            <span>{t('instructor.profile.fullNameLabel')}</span>
            <span>{profile.fullName[locale]}</span>
          </div>
          <div className="meta-kv-row">
            <span>{t('student.profile.emailLabel')}</span>
            <span>
              <bdi className="ltr-inline">{profile.email}</bdi>
            </span>
          </div>
        </div>

        <Alert variant="info" title={t('common.demoBadge')}>
          {t('instructor.settings.scopeNote')}
        </Alert>

        <div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              resetDemoData();
              setResetDone(true);
            }}
          >
            <RotateCcw size={15} aria-hidden="true" /> {t('instructor.settings.resetBtn')}
          </Button>
        </div>

        {resetDone ? <Alert variant="success" title={t('instructor.settings.resetSuccess')} /> : null}
      </Card>
    </div>
  );
}
