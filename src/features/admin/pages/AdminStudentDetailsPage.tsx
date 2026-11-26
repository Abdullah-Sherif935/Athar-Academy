import { FolderSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Button, Card, EmptyState } from '../../../components/ui';
import { CourseProgressBar } from '../../student/components/CourseProgressBar';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminStudentDetailsPage() {
  const { studentId = '' } = useParams();
  const { t, locale } = useI18n();
  const { students, courses, enrollmentRequests, setStudentStatus } = usePlatformDemo();

  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('admin.students.notFound')}
        description={t('admin.students.subtitle')}
        action={
          <Link to="/admin/students" className="ui-btn ui-btn--primary ui-btn--md">
            {t('admin.nav.students')}
          </Link>
        }
      />
    );
  }

  const enrolledCourses = courses.filter((c) => student.enrolledCourseSlugs.includes(c.slug));

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={student.fullName[locale]}
        subtitle={student.email}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.students'), to: '/admin/students' },
          { label: student.fullName[locale] },
        ]}
        action={<AdminStatusBadge status={student.status} />}
      />

      <div className="details-layout">
        <div className="details-stack">
          <Card className="details-stack" style={{ gap: 14 }}>
            <h2 className="text-h3">{t('admin.students.enrolledCoursesTitle')}</h2>
            {enrolledCourses.length === 0 ? (
              <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                {t('admin.students.withoutEnrollments')}
              </p>
            ) : (
              enrolledCourses.map((course) => (
                <div
                  key={course.slug}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/admin/courses/${course.slug}`} className="card-title-link" style={{ fontWeight: 700 }}>
                      {course.title[locale]}
                    </Link>
                    <Badge variant="brand">
                      <bdi className="ltr-inline">{course.code}</bdi>
                    </Badge>
                  </div>
                  <CourseProgressBar percent={student.avgProgress} label={t('admin.students.columns.progress')} />
                </div>
              ))
            )}
          </Card>

          {student.id === 'stu-sara' ? (
            <Card className="details-stack" style={{ gap: 12 }}>
              <h2 className="text-h3">{t('admin.students.enrollmentRequestsTitle')}</h2>
              {enrollmentRequests.map((req) => {
                const course = courses.find((c) => c.slug === req.courseSlug);
                return (
                  <div
                    key={req.id}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div className="text-small" style={{ fontWeight: 700 }}>
                        {course?.title[locale] ?? req.courseSlug}
                      </div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        {req.requestedAt[locale]}
                      </div>
                    </div>
                    <AdminStatusBadge status={req.status} />
                  </div>
                );
              })}
            </Card>
          ) : null}
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 14 }}>
            <h2 className="text-h3">{t('admin.students.accountActionsTitle')}</h2>
            <div className="meta-kv-list">
              <div className="meta-kv-row">
                <span>{t('admin.students.columns.registered')}</span>
                <span>{student.registeredAt[locale]}</span>
              </div>
              <div className="meta-kv-row">
                <span>{t('admin.students.columns.lastActivity')}</span>
                <span>{student.lastActivity[locale]}</span>
              </div>
              <div className="meta-kv-row">
                <span>{t('admin.students.columns.progress')}</span>
                <span>{student.avgProgress}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button
                variant={student.status === 'active' ? 'secondary' : 'primary'}
                onClick={() => setStudentStatus(student.id, 'active')}
                disabled={student.status === 'active'}
              >
                {t('admin.students.actions.activate')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStudentStatus(student.id, 'inactive')}
                disabled={student.status === 'inactive'}
              >
                {t('admin.students.actions.deactivate')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStudentStatus(student.id, 'suspended')}
                disabled={student.status === 'suspended'}
              >
                {t('admin.students.actions.suspend')}
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
