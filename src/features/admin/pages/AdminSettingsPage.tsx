import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Alert, Button, Card, Input, Select } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';

export function AdminSettingsPage() {
  const { t } = useI18n();
  const { settings, updateSettings, resetAllPlatformDemo } = usePlatformDemo();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.settings.title')}
        subtitle={t('admin.settings.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.settings') },
        ]}
      />

      {saved ? (
        <Alert variant="success" title={t('common.demoBadge')}>
          {t('admin.common.savedDemo')}
        </Alert>
      ) : null}

      <form onSubmit={handleSave} className="details-stack">
        <Card className="details-stack" style={{ gap: 14 }}>
          <h2 className="text-h3">{t('admin.settings.brandingTitle')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div
              style={{
                padding: 14,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-subtle)',
              }}
            >
              <BrandLogo variant="horizontal" size="md" />
            </div>
            <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              {t('admin.settings.logoPreview')}
            </span>
          </div>

          <div className="grid-2">
            <Input
              label={t('admin.settings.platformNameAr')}
              value={settings.platformNameAr}
              onChange={(e) => {
                updateSettings({ platformNameAr: e.target.value });
                setSaved(false);
              }}
            />
            <Input
              label={t('admin.settings.platformNameEn')}
              value={settings.platformNameEn}
              onChange={(e) => {
                updateSettings({ platformNameEn: e.target.value });
                setSaved(false);
              }}
            />
          </div>
          <div className="grid-2">
            <Input
              label={t('admin.settings.taglineAr')}
              value={settings.taglineAr}
              onChange={(e) => {
                updateSettings({ taglineAr: e.target.value });
                setSaved(false);
              }}
            />
            <Input
              label={t('admin.settings.taglineEn')}
              value={settings.taglineEn}
              onChange={(e) => {
                updateSettings({ taglineEn: e.target.value });
                setSaved(false);
              }}
            />
          </div>
        </Card>

        <Card className="details-stack" style={{ gap: 14 }}>
          <h2 className="text-h3">{t('admin.settings.defaultsTitle')}</h2>
          <div className="grid-2">
            <Select
              label={t('admin.settings.defaultLanguage')}
              value={settings.defaultLanguage}
              onChange={(e) => {
                updateSettings({ defaultLanguage: e.target.value as 'ar' | 'en' });
                setSaved(false);
              }}
            >
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
            </Select>
            <Select
              label={t('admin.settings.defaultTheme')}
              value={settings.defaultTheme}
              onChange={(e) => {
                updateSettings({ defaultTheme: e.target.value as 'system' | 'light' | 'dark' });
                setSaved(false);
              }}
            >
              <option value="system">{t('theme.system')}</option>
              <option value="light">{t('theme.light')}</option>
              <option value="dark">{t('theme.dark')}</option>
            </Select>
          </div>
        </Card>

        <Card className="details-stack" style={{ gap: 6 }}>
          <h2 className="text-h3" style={{ marginBlockEnd: 8 }}>
            {t('admin.settings.policiesTitle')}
          </h2>

          <label className="admin-toggle-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="text-small" style={{ fontWeight: 700 }}>
                {t('admin.settings.allowPublicRegistration')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.allowPublicRegistration}
              onChange={(e) => {
                updateSettings({ allowPublicRegistration: e.target.checked });
                setSaved(false);
              }}
            />
          </label>

          <label className="admin-toggle-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="text-small" style={{ fontWeight: 700 }}>
                {t('admin.settings.requireEnrollmentApproval')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.requireEnrollmentApproval}
              onChange={(e) => {
                updateSettings({ requireEnrollmentApproval: e.target.checked });
                setSaved(false);
              }}
            />
          </label>

          <label className="admin-toggle-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="text-small" style={{ fontWeight: 700 }}>
                {t('admin.settings.requireLessonApproval')}
              </div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)', marginBlockStart: 4 }}>
                {t('admin.settings.requireLessonApprovalHint')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.requireLessonApproval}
              onChange={(e) => {
                updateSettings({ requireLessonApproval: e.target.checked });
                setSaved(false);
              }}
            />
          </label>

          <label className="admin-toggle-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="text-small" style={{ fontWeight: 700 }}>
                {t('admin.settings.requireReviewModeration')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.requireReviewModeration}
              onChange={(e) => {
                updateSettings({ requireReviewModeration: e.target.checked });
                setSaved(false);
              }}
            />
          </label>
        </Card>

        <div>
          <Button type="submit" variant="primary">
            {t('admin.common.save')}
          </Button>
        </div>
      </form>

      <Card className="details-stack" style={{ gap: 10 }}>
        <h2 className="text-h3">{t('admin.settings.resetTitle')}</h2>
        <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
          {t('admin.settings.resetDesc')}
        </p>
        <div>
          <Button variant="secondary" onClick={resetAllPlatformDemo}>
            <RotateCcw size={15} aria-hidden="true" /> {t('admin.settings.resetBtn')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
