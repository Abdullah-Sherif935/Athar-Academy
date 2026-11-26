import {
  Activity,
  BookOpen,
  CheckSquare,
  ClipboardCheck,
  Compass,
  FileEdit,
  GraduationCap,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Card } from '../../../components/ui';
import { ADMIN_GROWTH_SERIES } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const {
    students,
    instructors,
    courses,
    disciplines,
    enrollmentRequests,
    reviews,
    activityTimeline,
  } = usePlatformDemo();

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;
  const draftCourses = courses.filter((c) => c.status === 'draft').length;
  const pendingEnrollments = enrollmentRequests.filter((r) => r.status === 'pending').length;
  const pendingApprovals =
    courses.filter((c) => c.pendingApproval).length +
    courses.reduce(
      (sum, c) =>
        sum +
        c.modules.reduce(
          (mSum, m) => mSum + m.lessons.filter((l) => l.status === 'pending_approval').length,
          0,
        ),
      0,
    );
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;

  const statCards = [
    {
      label: t('admin.dashboard.stats.totalStudents'),
      value: students.length,
      Icon: GraduationCap,
      to: '/admin/students',
    },
    {
      label: t('admin.dashboard.stats.activeStudents'),
      value: activeStudents,
      Icon: UserCheck,
      to: '/admin/students',
    },
    {
      label: t('admin.dashboard.stats.totalInstructors'),
      value: instructors.length,
      Icon: Users,
      to: '/admin/instructors',
    },
    {
      label: t('admin.dashboard.stats.totalCourses'),
      value: courses.length,
      Icon: BookOpen,
      to: '/admin/courses',
    },
    {
      label: t('admin.dashboard.stats.publishedCourses'),
      value: publishedCourses,
      Icon: BookOpen,
      to: '/admin/courses',
    },
    {
      label: t('admin.dashboard.stats.draftCourses'),
      value: draftCourses,
      Icon: FileEdit,
      to: '/admin/courses',
    },
    {
      label: t('admin.dashboard.stats.totalDisciplines'),
      value: disciplines.length,
      Icon: Compass,
      to: '/admin/disciplines',
    },
    {
      label: t('admin.dashboard.stats.pendingEnrollments'),
      value: pendingEnrollments,
      Icon: ClipboardCheck,
      to: '/admin/enrollments',
    },
    {
      label: t('admin.dashboard.stats.pendingApprovals'),
      value: pendingApprovals,
      Icon: CheckSquare,
      to: '/admin/approvals',
    },
    {
      label: t('admin.dashboard.stats.pendingReviews'),
      value: pendingReviews,
      Icon: Star,
      to: '/admin/reviews',
    },
  ];

  const maxChart = Math.max(...ADMIN_GROWTH_SERIES.map((d) => Math.max(d.registrations, d.enrollments)));

  const popularCourses = [...courses]
    .map((c) => ({
      course: c,
      enrolled: students.filter((s) => s.enrolledCourseSlugs.includes(c.slug)).length,
    }))
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 4);

  const activeInstructors = instructors.filter((i) => i.status === 'active').slice(0, 4);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.subtitle')}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/admin/enrollments" className="ui-btn ui-btn--secondary ui-btn--sm">
              {t('admin.nav.enrollments')} ({pendingEnrollments})
            </Link>
            <Link to="/admin/courses" className="ui-btn ui-btn--primary ui-btn--sm">
              {t('admin.courses.createBtn')}
            </Link>
          </div>
        }
      />

      {/* Platform Stats */}
      <div className="admin-stats-grid">
        {statCards.map(({ label, value, Icon, to }) => (
          <Link key={label} to={to} style={{ textDecoration: 'none' }}>
            <Card interactive className="student-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="student-stat-card__label">{label}</span>
                <Icon size={17} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
              </div>
              <div className="student-stat-card__value">{value}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Analytics + Popular Courses */}
      <div className="grid-2">
        <Card className="details-stack" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 className="text-h3">{t('admin.dashboard.growthTitle')}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge variant="brand">{t('admin.dashboard.registrations')}</Badge>
              <Badge variant="teal">{t('admin.dashboard.enrollments')}</Badge>
            </div>
          </div>

          <div className="admin-bar-chart" role="img" aria-label={t('admin.dashboard.growthTitle')}>
            {ADMIN_GROWTH_SERIES.map((pt) => (
              <div key={pt.id} className="admin-bar-chart__col">
                <div className="admin-bar-chart__bars">
                  <div
                    className="admin-bar-chart__bar admin-bar-chart__bar--blue"
                    style={{ height: `${Math.round((pt.registrations / maxChart) * 100)}%` }}
                    title={`${t('admin.dashboard.registrations')}: ${pt.registrations}`}
                  />
                  <div
                    className="admin-bar-chart__bar admin-bar-chart__bar--teal"
                    style={{ height: `${Math.round((pt.enrollments / maxChart) * 100)}%` }}
                    title={`${t('admin.dashboard.enrollments')}: ${pt.enrollments}`}
                  />
                </div>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {pt.label[locale]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('admin.dashboard.popularCoursesTitle')}</h2>
          <div className="details-stack" style={{ gap: 10 }}>
            {popularCourses.map(({ course, enrolled }) => (
              <Link
                key={course.slug}
                to={`/admin/courses/${course.slug}`}
                className="lesson-item"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="text-small" style={{ fontWeight: 700 }}>
                    {course.title[locale]}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    <bdi className="ltr-inline">{course.code}</bdi>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Badge variant="teal">
                    {t('admin.dashboard.enrolledCount', { count: enrolled })}
                  </Badge>
                  <AdminStatusBadge status={course.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Instructors + Recent Activity */}
      <div className="grid-2">
        <Card className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('admin.dashboard.activeInstructorsTitle')}</h2>
          <div className="details-stack" style={{ gap: 10 }}>
            {activeInstructors.map((inst) => {
              const assignedCount = courses.filter((c) => c.instructorSlugs.includes(inst.slug)).length;
              return (
                <Link
                  key={inst.slug}
                  to={`/admin/instructors/${inst.slug}`}
                  className="lesson-item"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--surface-subtle)',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span className="student-avatar-pill__circle" aria-hidden="true">
                      {inst.initials}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="text-small" style={{ fontWeight: 700 }}>
                        {inst.name[locale]}
                      </div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        {inst.title[locale]}
                      </div>
                    </div>
                  </div>
                  <Badge variant="brand">
                    {t('admin.dashboard.coursesCount', { count: assignedCount })}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="details-stack" style={{ gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: 'var(--brand-teal)' }} aria-hidden="true" />
            <h2 className="text-h3">{t('admin.dashboard.recentActivityTitle')}</h2>
          </div>
          <div className="details-stack" style={{ gap: 10 }}>
            {activityTimeline.slice(0, 6).map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span className="text-small">{act.message[locale]}</span>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {act.timeLabel[locale]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
