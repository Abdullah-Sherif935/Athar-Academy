import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';

export interface LessonItemProps {
  courseSlug: string;
  lessonId: string;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive?: boolean;
}

export function LessonItem({
  courseSlug,
  lessonId,
  title,
  durationMinutes,
  isCompleted,
  isUnlocked,
  isActive = false,
}: LessonItemProps) {
  const { t } = useI18n();

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {isCompleted ? (
          <CheckCircle2 size={18} style={{ color: 'var(--brand-teal)', flexShrink: 0 }} aria-hidden="true" />
        ) : isUnlocked ? (
          <PlayCircle size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} aria-hidden="true" />
        ) : (
          <Lock size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true" />
        )}
        <span
          className="text-small"
          style={{
            fontWeight: isActive ? 700 : 500,
            color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          {title}
        </span>
      </div>
      <span className="text-caption" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
        {t('common.minutesShort', { count: durationMinutes })}
      </span>
    </>
  );

  if (!isUnlocked) {
    return (
      <div className="lesson-item lesson-item--locked" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/student/courses/${courseSlug}/lessons/${lessonId}`}
      className={`lesson-item ${isActive ? 'lesson-item--active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}
