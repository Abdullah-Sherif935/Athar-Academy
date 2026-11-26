import { BookOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Button, EmptyState } from '../../../components/ui';
import { EnrolledCourseCard } from '../components/EnrolledCourseCard';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

type LearningFilter = 'all' | 'in_progress' | 'completed';

export function MyLearningPage() {
  const { t } = useI18n();
  const { enrolledCourses, getCourseProgress } = useStudentDemo();
  const [filter, setFilter] = useState<LearningFilter>('all');

  const filtered = useMemo(() => {
    return enrolledCourses.filter((rec) => {
      const { completed, total } = getCourseProgress(rec.courseSlug);
      const isDone = total > 0 && completed >= total;
      if (filter === 'completed') return isDone;
      if (filter === 'in_progress') return !isDone;
      return true;
    });
  }, [enrolledCourses, filter, getCourseProgress]);

  return (
    <div>
      <StudentPageHeader
        title={t('student.myLearning.title')}
        subtitle={t('student.myLearning.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.myLearning') },
        ]}
      />

      <div className="filter-tabs" role="tablist" aria-label={t('student.myLearning.title')}>
        {(
          [
            { key: 'all', label: t('student.myLearning.filterAll') },
            { key: 'in_progress', label: t('student.myLearning.filterInProgress') },
            { key: 'completed', label: t('student.myLearning.filterCompleted') },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filter === tab.key}
            className={`filter-tab ${filter === tab.key ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid-2">
          {filtered.map((record) => (
            <EnrolledCourseCard key={record.courseSlug} record={record} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={24} />}
          title={t('student.myLearning.emptyTitle')}
          description={t('student.myLearning.emptyDesc')}
          action={
            <Button variant="secondary" onClick={() => setFilter('all')}>
              {t('student.myLearning.filterAll')}
            </Button>
          }
        />
      )}
    </div>
  );
}
