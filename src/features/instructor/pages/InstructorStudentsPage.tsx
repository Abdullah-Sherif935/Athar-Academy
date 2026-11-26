import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { SearchBar } from '../../../components/shared';
import { Badge, Card, EmptyState } from '../../../components/ui';
import { CourseProgressBar } from '../../student/components/CourseProgressBar';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorStudentsPage() {
  const { t, locale } = useI18n();
  const { students, assignedCourses, getAssignedCourse } = useInstructorDemo();

  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((stu) => {
      if (
        courseFilter !== 'all' &&
        !stu.enrollments.some((e) => e.courseSlug === courseFilter)
      ) {
        return false;
      }
      if (progressFilter === 'completed' && !stu.enrollments.some((e) => e.percent === 100)) {
        return false;
      }
      if (progressFilter === 'in_progress' && !stu.enrollments.some((e) => e.percent < 100)) {
        return false;
      }
      if (!q) return true;
      return (
        stu.fullName[locale].toLowerCase().includes(q) ||
        stu.email.toLowerCase().includes(q) ||
        stu.fullName.en.toLowerCase().includes(q) ||
        stu.fullName.ar.toLowerCase().includes(q)
      );
    });
  }, [courseFilter, locale, progressFilter, query, students]);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.students.title')}
        subtitle={t('instructor.students.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.students') },
        ]}
      />

      <div className="filter-toolbar filter-toolbar--discipline">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t('instructor.students.searchPlaceholder')}
        />
        <div className="ui-field">
          <label htmlFor="stu-course-filter" className="ui-field__label">
            {t('instructor.students.courseFilter')}
          </label>
          <select
            id="stu-course-filter"
            className="filter-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all">{t('instructor.students.allCourses')}</option>
            {assignedCourses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title[locale]}
              </option>
            ))}
          </select>
        </div>
        <div className="ui-field">
          <label htmlFor="stu-progress-filter" className="ui-field__label">
            {t('instructor.students.progressFilter')}
          </label>
          <select
            id="stu-progress-filter"
            className="filter-select"
            value={progressFilter}
            onChange={(e) =>
              setProgressFilter(e.target.value as 'all' | 'completed' | 'in_progress')
            }
          >
            <option value="all">{t('instructor.students.allProgress')}</option>
            <option value="in_progress">{t('instructor.students.progressInProgress')}</option>
            <option value="completed">{t('instructor.students.progressCompleted')}</option>
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="details-stack" style={{ gap: 12 }}>
          {filtered.map((stu) => (
            <Card key={stu.id} className="feature-card" style={{ gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="instructor-avatar accent-badge--navy" style={{ width: 44, height: 44, fontSize: '0.9rem' }} aria-hidden="true">
                    {stu.initials}
                  </div>
                  <div>
                    <Link to={`/instructor/students/${stu.id}`} className="text-body card-title-link" style={{ fontWeight: 700 }}>
                      {stu.fullName[locale]}
                    </Link>
                    <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                      <bdi className="ltr-inline">{stu.email}</bdi>
                    </div>
                  </div>
                </div>
                <Link to={`/instructor/students/${stu.id}`} className="ui-btn ui-btn--secondary ui-btn--sm">
                  {t('instructor.students.viewDetails')}
                </Link>
              </div>

              <div className="grid-2">
                {stu.enrollments.map((enr) => {
                  const c = getAssignedCourse(enr.courseSlug);
                  return (
                    <div
                      key={enr.courseSlug}
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-subtle)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span className="text-small" style={{ fontWeight: 600 }}>
                          {c?.title[locale]}
                        </span>
                        <Badge variant={enr.status === 'completed' ? 'success' : 'brand'}>
                          {t(`instructor.status.${enr.status}`)}
                        </Badge>
                      </div>
                      <CourseProgressBar percent={enr.percent} />
                      <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        {t('instructor.students.lastActivity')} {enr.lastActivity[locale]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users size={24} />}
          title={t('coursesPage.emptyTitle')}
          description={t('coursesPage.emptyDescription')}
        />
      )}
    </div>
  );
}
