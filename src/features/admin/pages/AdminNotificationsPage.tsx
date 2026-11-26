import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, Input, Modal, Textarea } from '../../../components/ui';
import type { NotificationEventConfig } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';

export function AdminNotificationsPage() {
  const { t, locale } = useI18n();
  const { notificationEvents, updateNotificationEvent } = usePlatformDemo();

  const [editing, setEditing] = useState<NotificationEventConfig | null>(null);
  const [subjectAr, setSubjectAr] = useState('');
  const [subjectEn, setSubjectEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');

  const openEditor = (ev: NotificationEventConfig) => {
    setEditing(ev);
    setSubjectAr(ev.subject.ar);
    setSubjectEn(ev.subject.en);
    setBodyAr(ev.templateBody.ar);
    setBodyEn(ev.templateBody.en);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateNotificationEvent(editing.key, {
      subject: { ar: subjectAr.trim(), en: subjectEn.trim() },
      templateBody: { ar: bodyAr.trim(), en: bodyEn.trim() },
    });
    setEditing(null);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.notifications.title')}
        subtitle={t('admin.notifications.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.notifications') },
        ]}
      />

      <Alert variant="info" title={t('common.demoBadge')}>
        {t('admin.notifications.demoNotice')}
      </Alert>

      <Card>
        {notificationEvents.map((ev) => (
          <div key={ev.key} className="admin-toggle-row">
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="text-small" style={{ fontWeight: 700 }}>
                  {ev.label[locale]}
                </span>
                <Badge variant={ev.enabled ? 'success' : 'neutral'}>
                  {ev.enabled ? t('admin.notifications.enabled') : t('admin.notifications.disabled')}
                </Badge>
              </div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)', marginBlockStart: 4 }}>
                {ev.subject[locale]}
              </div>
            </div>

            <div className="admin-table__actions" style={{ flexShrink: 0 }}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => updateNotificationEvent(ev.key, { enabled: !ev.enabled })}
              >
                {ev.enabled ? t('admin.disciplines.deactivate') : t('admin.disciplines.activate')}
              </Button>
              <Button size="sm" variant="tertiary" onClick={() => openEditor(ev)}>
                {t('admin.notifications.editTemplate')}
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t('admin.notifications.modalTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('admin.common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="details-stack" style={{ gap: 12 }}>
          <Input
            label={t('admin.notifications.subjectAr')}
            value={subjectAr}
            onChange={(e) => setSubjectAr(e.target.value)}
          />
          <Input
            label={t('admin.notifications.subjectEn')}
            value={subjectEn}
            onChange={(e) => setSubjectEn(e.target.value)}
          />
          <Textarea
            label={t('admin.notifications.bodyAr')}
            rows={3}
            value={bodyAr}
            onChange={(e) => setBodyAr(e.target.value)}
          />
          <Textarea
            label={t('admin.notifications.bodyEn')}
            rows={3}
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
