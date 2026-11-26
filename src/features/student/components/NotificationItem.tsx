import { Award, Bell, BookOpen, Mail, Megaphone, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Button, Card } from '../../../components/ui';
import type { NotificationKind, StudentNotification } from '../../../data/mock/student';

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  lesson: BookOpen,
  announcement: Megaphone,
  reply: MessageSquare,
  message: Mail,
  update: Award,
};

export function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: StudentNotification;
  onMarkRead: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const Icon = KIND_ICON[notification.kind];

  return (
    <Card
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        borderInlineStart: notification.isRead ? undefined : '4px solid var(--brand-blue)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 220 }}>
        <div className="feature-card__icon" aria-hidden="true">
          <Icon size={18} />
        </div>
        <div style={{ textAlign: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {notification.title[locale]}
            </span>
            {!notification.isRead ? <Badge variant="brand">{t('student.notifications.filterUnread')}</Badge> : null}
          </div>
          <p className="text-small" style={{ marginBlockStart: 4 }}>
            {notification.body[locale]}
          </p>
          <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            {notification.timeLabel[locale]}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!notification.isRead ? (
          <Button variant="secondary" size="sm" onClick={() => onMarkRead(notification.id)}>
            {t('student.notifications.markRead')}
          </Button>
        ) : null}
        <Link
          to={notification.targetPath}
          className="ui-btn ui-btn--primary ui-btn--sm"
          onClick={() => onMarkRead(notification.id)}
        >
          {t('student.notifications.openLink')}
        </Link>
      </div>
    </Card>
  );
}
