import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { LanguageSwitcher } from '../../../components/brand/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { Alert, Button, Card } from '../../../components/ui';
import type { StudentNotificationPreferences } from '../../../data/mock/student';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

const PREF_ITEMS: Array<{ key: keyof StudentNotificationPreferences; labelKey: string }> = [
  { key: 'newLessons', labelKey: 'student.settings.prefNewLessons' },
  { key: 'instructorAnnouncements', labelKey: 'student.settings.prefAnnouncements' },
  { key: 'communityReplies', labelKey: 'student.settings.prefReplies' },
  { key: 'directMessages', labelKey: 'student.settings.prefMessages' },
  { key: 'weeklySummary', labelKey: 'student.settings.prefWeekly' },
];

export function StudentSettingsPage() {
  const { t, locale } = useI18n();
  const { profile, notificationPrefs, updateNotificationPref, resetDemoData } = useStudentDemo();
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.settings.title')}
        subtitle={t('student.settings.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.settings') },
        ]}
      />

      <Card className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h3">{t('student.settings.appearanceTitle')}</h2>
        <p className="text-small">{t('student.settings.appearanceDesc')}</p>

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
        <h2 className="text-h3">{t('student.settings.notificationsTitle')}</h2>
        {PREF_ITEMS.map(({ key, labelKey }) => (
          <label key={key} className="pref-row" style={{ cursor: 'pointer' }}>
            <span className="text-small" style={{ color: 'var(--text-primary)' }}>
              {t(labelKey)}
            </span>
            <input
              type="checkbox"
              checked={notificationPrefs[key]}
              onChange={(event) => updateNotificationPref(key, event.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--brand-blue)' }}
            />
          </label>
        ))}
      </Card>

      <Card className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h3">{t('student.settings.accountTitle')}</h2>
        <div className="meta-kv-list">
          <div className="meta-kv-row">
            <span>{t('student.profile.fullNameLabel')}</span>
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
          {t('student.settings.accountNote')}
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
            <RotateCcw size={15} aria-hidden="true" /> {t('student.settings.resetBtn')}
          </Button>
        </div>

        {resetDone ? (
          <Alert variant="success" title={t('student.settings.resetSuccess')} />
        ) : null}
      </Card>
    </div>
  );
}
