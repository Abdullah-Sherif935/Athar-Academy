import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Card } from '../../../components/ui';
import { ADMIN_GROWTH_SERIES } from '../../../data/mock/admin';
import { CourseProgressBar } from '../../student/components/CourseProgressBar';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';

export function AdminAnalyticsPage() {
  const { t, locale } = useI18n();
  const { courses, instructors, students, reviews } = usePlatformDemo();

  const maxChart = Math.max(
    ...ADMIN_GROWTH_SERIES.map((d) => Math.max(d.registrations, d.enrollments)),
  );

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const draftCount = courses.filter((c) => c.status === 'draft').length;
  const archivedCount = courses.filter((c) => c.status === 'archived').length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.analytics.title')}
        subtitle={t('admin.analytics.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.analytics') },
        ]}
      />

      <div className="admin-stats-grid">
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('admin.analytics.published')}</span>
          <div className="student-stat-card__value">{publishedCount}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('admin.analytics.draft')}</span>
          <div className="student-stat-card__value">{draftCount}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('admin.analytics.archived')}</span>
          <div className="student-stat-card__value">{archivedCount}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('admin.analytics.avgRating')}</span>
          <div className="student-stat-card__value">{avgRating} / 5</div>
        </Card>
      </div>

      <div className="grid-2">
        <Card className="details-stack" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 className="text-h3">{t('admin.analytics.growthTitle')}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge variant="brand">{t('admin.dashboard.registrations')}</Badge>
              <Badge variant="teal">{t('admin.dashboard.enrollments')}</Badge>
            </div>
          </div>
          <div className="admin-bar-chart" role="img" aria-label={t('admin.analytics.growthTitle')}>
            {ADMIN_GROWTH_SERIES.map((pt) => (
              <div key={pt.id} className="admin-bar-chart__col">
                <div className="admin-bar-chart__bars">
                  <div
                    className="admin-bar-chart__bar admin-bar-chart__bar--blue"
                    style={{ height: `${Math.round((pt.registrations / maxChart) * 100)}%` }}
                  />
                  <div
                    className="admin-bar-chart__bar admin-bar-chart__bar--teal"
                    style={{ height: `${Math.round((pt.enrollments / maxChart) * 100)}%` }}
                  />
                </div>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {pt.label[locale]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="details-stack" style={{ gap: 14 }}>
          <h2 className="text-h3">{t('admin.analytics.completionTitle')}</h2>
          {courses.slice(0, 5).map((course, idx) => {
            const pct = Math.min(92, 42 + idx * 11);
            return (
              <div key={course.slug} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span className="text-small" style={{ fontWeight: 600 }}>
                    {course.title[locale]}
                  </span>
                  <span className="text-caption">{pct}%</span>
                </div>
                <CourseProgressBar percent={pct} label={t('admin.analytics.completionRate')} />
              </div>
            );
          })}
        </Card>
      </div>

      <Card className="details-stack" style={{ gap: 12 }}>
        <h2 className="text-h3">{t('admin.analytics.instructorPerfTitle')}</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.instructors.columns.instructor')}</th>
                <th>{t('admin.instructors.columns.assignedCourses')}</th>
                <th>{t('admin.dashboard.stats.totalStudents')}</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((inst) => {
                const assigned = courses.filter((c) => c.instructorSlugs.includes(inst.slug));
                const learnerCount = students.filter((s) =>
                  s.enrolledCourseSlugs.some((slug) => assigned.some((c) => c.slug === slug)),
                ).length;
                return (
                  <tr key={inst.slug}>
                    <td style={{ fontWeight: 700 }}>{inst.name[locale]}</td>
                    <td>{assigned.length}</td>
                    <td>{learnerCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
