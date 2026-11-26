import { Award, BarChart3, BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import { MOCK_WEEKLY_ACTIVITY } from '../../../data/mock/student';
import { CourseProgressBar } from '../components/CourseProgressBar';
import { LearningStatCard } from '../components/LearningStatCard';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function LearningProgressPage() {
  const { t, locale } = useI18n();
  const { enrolledCourses, getCourseProgress } = useStudentDemo();

  const stats = enrolledCourses.map((rec) => ({
    record: rec,
    course: getCourseBySlug(rec.courseSlug),
    progress: getCourseProgress(rec.courseSlug),
  }));

  const totalLessons = stats.reduce((s, x) => s + x.progress.total, 0);
  const completedLessons = stats.reduce((s, x) => s + x.progress.completed, 0);
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = stats.filter(
    (x) => x.progress.total > 0 && x.progress.completed >= x.progress.total,
  ).length;
  const inProgressCourses = enrolledCourses.length - completedCourses;
  const maxMinutes = Math.max(...MOCK_WEEKLY_ACTIVITY.map((d) => d.minutes), 1);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.progress.title')}
        subtitle={t('student.progress.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.progress') },
        ]}
      />

      <div className="grid-4">
        <LearningStatCard
          icon={<BarChart3 size={20} />}
          value={`${overallPercent}%`}
          label={t('student.dashboard.overallProgress')}
          tone="teal"
        />
        <LearningStatCard
          icon={<BookOpen size={20} />}
          value={inProgressCourses}
          label={t('student.progress.inProgressCourses')}
          tone="blue"
        />
        <LearningStatCard
          icon={<Award size={20} />}
          value={completedCourses}
          label={t('student.progress.completedCourses')}
          tone="orange"
        />
        <LearningStatCard
          icon={<CheckCircle2 size={20} />}
          value={`${completedLessons}/${totalLessons}`}
          label={t('student.dashboard.completedLessons')}
          tone="teal"
        />
      </div>

      {/* Weekly Chart */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <h2 className="text-h3">{t('student.progress.weeklyTitle')}</h2>
            <p className="text-caption">{t('student.progress.weeklySubtitle')}</p>
          </div>
          <Badge variant="orange">{t('common.demoBadge')}</Badge>
        </div>

        <div className="weekly-chart" role="img" aria-label={t('student.progress.weeklyTitle')}>
          {MOCK_WEEKLY_ACTIVITY.map((point) => {
            const heightPct = Math.round((point.minutes / maxMinutes) * 100);
            return (
              <div key={point.id} className="weekly-bar">
                <span className="text-caption ltr-inline" style={{ color: 'var(--text-secondary)' }}>
                  {point.minutes}m
                </span>
                <div className="weekly-bar__track">
                  <div className="weekly-bar__fill" style={{ height: `${heightPct}%` }} />
                </div>
                <span className="text-caption" style={{ fontWeight: 600 }}>
                  {point.day[locale]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Course Breakdown */}
      <Card className="details-stack" style={{ gap: 16 }}>
        <h2 className="text-h3">{t('student.progress.courseBreakdown')}</h2>
        {stats.map(({ record, course, progress }) => {
          if (!course) return null;
          return (
            <div
              key={record.courseSlug}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingBlockEnd: 14,
                borderBlockEnd: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  to={`/student/courses/${course.slug}`}
                  className="text-small"
                  style={{ fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {course.title[locale]}
                </Link>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {t('student.myLearning.lessonsProgress', {
                    completed: progress.completed,
                    total: progress.total,
                  })}
                </span>
              </div>
              <CourseProgressBar percent={progress.percent} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
