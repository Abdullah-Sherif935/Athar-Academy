import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Button, EmptyState } from '../../../components/ui';
import { NotificationItem } from '../components/NotificationItem';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function NotificationsPage() {
  const { t } = useI18n();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStudentDemo();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.notifications.title')}
        subtitle={t('student.notifications.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.notifications') },
        ]}
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllNotificationsRead}>
              <CheckCheck size={15} aria-hidden="true" /> {t('student.notifications.markAllRead')}
            </Button>
          ) : null
        }
      />

      <div className="filter-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('student.notifications.filterAll')} ({notifications.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'unread'}
          className={`filter-tab ${filter === 'unread' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          {t('student.notifications.filterUnread')} ({unreadCount})
        </button>
      </div>

      {visible.length > 0 ? (
        <div className="details-stack" style={{ gap: 12 }}>
          {visible.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={markNotificationRead}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell size={24} />}
          title={t('student.notifications.emptyTitle')}
          description={t('student.notifications.emptyDesc')}
        />
      )}
    </div>
  );
}
