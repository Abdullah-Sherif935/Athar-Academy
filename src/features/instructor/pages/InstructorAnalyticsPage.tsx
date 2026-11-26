import { BarChart3, BookOpen, CheckCircle2, Users } from 'lucide-react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import { INSTRUCTOR_WEEKLY_ACTIVITY } from '../../../data/mock/instructor';
import { CourseProgressBar } from '../../student/components/CourseProgressBar';
import { LearningStatCard } from '../../student/components/LearningStatCard';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorAnalyticsPage() {
  const { t, locale } = useI18n();
  const { assignedCourses, students } = useInstructorDemo();

  const maxMinutes = Math.max(...INSTRUCTOR_WEEKLY_ACTIVITY.map((p) => p.minutes), 1);
  const allEnrollments = students.flatMap((s) => s.enrollments);
  const avgCompletion =
    allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((sum, e) => sum + e.percent, 0) / allEnrollments.length)
      : 0;
  const totalPublishedLessons = assignedCourses.reduce(
    (sum, c) =>
      sum + c.modules.flatMap((m) => m.lessons).filter((l) => l.status === 'published').length,
    0,
  );

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.analytics.title')}
        subtitle={t('instructor.analytics.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.analytics') },
        ]}
      />

      <div className="grid-4">
        <LearningStatCard
          icon={<BookOpen size={20} />}
          value={assignedCourses.length}
          label={t('instructor.dashboard.assignedCourses')}
          tone="blue"
        />
        <LearningStatCard
          icon={<Users size={20} />}
          value={students.length}
          label={t('instructor.dashboard.enrolledStudents')}
          tone="teal"
        />
        <LearningStatCard
          icon={<CheckCircle2 size={20} />}
          value={totalPublishedLessons}
          label={t('instructor.analytics.lessonsPublishedLabel')}
          tone="teal"
        />
        <LearningStatCard
          icon={<BarChart3 size={20} />}
          value={`${avgCompletion}%`}
          label={t('instructor.analytics.completionRate')}
          tone="orange"
        />
      </div>

      {/* Weekly Activity */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
          <h2 className="text-h3">{t('instructor.analytics.weeklyTitle')}</h2>
          <Badge variant="orange">{t('common.demoBadge')}</Badge>
        </div>
        <div className="weekly-chart" role="img" aria-label={t('instructor.analytics.weeklyTitle')}>
          {INSTRUCTOR_WEEKLY_ACTIVITY.map((point) => {
            const pct = Math.round((point.minutes / maxMinutes) * 100);
            return (
              <div key={point.id} className="weekly-bar">
                <span className="text-caption ltr-inline" style={{ color: 'var(--text-secondary)' }}>
                  {point.minutes}m
                </span>
                <div className="weekly-bar__track">
                  <div className="weekly-bar__fill" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-caption" style={{ fontWeight: 600 }}>
                  {point.day[locale]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Course Comparison */}
      <Card className="details-stack" style={{ gap: 16 }}>
        <h2 className="text-h3">{t('instructor.analytics.courseComparison')}</h2>
        {assignedCourses.map((course) => {
          const enrolled = students
            .map((s) => s.enrollments.find((e) => e.courseSlug === course.slug))
            .filter((e): e is NonNullable<typeof e> => Boolean(e));
          const avg =
            enrolled.length > 0
              ? Math.round(enrolled.reduce((s, e) => s + e.percent, 0) / enrolled.length)
              : 0;
          const pubLessons = course.modules
            .flatMap((m) => m.lessons)
            .filter((l) => l.status === 'published').length;

          return (
            <div
              key={course.slug}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingBlockEnd: 14,
                borderBlockEnd: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {course.title[locale]}
                </span>
                <div className="section-header__meta">
                  <Badge variant="brand">
                    {enrolled.length} {t('instructor.analytics.enrolledLabel')}
                  </Badge>
                  <Badge variant="neutral">
                    {pubLessons} {t('instructor.analytics.lessonsPublishedLabel')}
                  </Badge>
                </div>
              </div>
              <CourseProgressBar percent={avg} label={t('instructor.analytics.completionRate')} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
