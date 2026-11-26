import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { getCourseBySlug, getInstructorBySlug } from '../../../data/mock';
import type { ConversationItem } from '../../../data/mock/student';

export function ConversationListItem({
  conversation,
  isActive = false,
}: {
  conversation: ConversationItem;
  isActive?: boolean;
}) {
  const { locale } = useI18n();
  const instructor = getInstructorBySlug(conversation.instructorSlug);
  const course = getCourseBySlug(conversation.courseSlug);
  const lastMsg = conversation.messages[conversation.messages.length - 1];

  return (
    <Link
      to={`/student/messages/${conversation.id}`}
      className={`lesson-item ${isActive ? 'lesson-item--active' : ''}`}
      style={{
        padding: 14,
        border: '1px solid var(--border)',
        background: isActive ? 'var(--brand-blue-soft)' : 'var(--surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <div
          className={`instructor-avatar accent-badge--${instructor?.accent ?? 'navy'}`}
          style={{ width: 42, height: 42, fontSize: '0.875rem' }}
          aria-hidden="true"
        >
          {instructor?.initials ?? 'IN'}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {instructor?.name[locale]}
            </span>
            {conversation.unreadCount > 0 ? (
              <span className="student-nav-link__badge">{conversation.unreadCount}</span>
            ) : null}
          </div>
          {course ? (
            <div className="text-caption" style={{ color: 'var(--brand-blue)' }}>
              {course.title[locale]}
            </div>
          ) : null}
          {lastMsg ? (
            <div
              className="text-caption"
              style={{
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {lastMsg.content[locale]}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
