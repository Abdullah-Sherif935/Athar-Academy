import { FolderSearch, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card, EmptyState } from '../../../components/ui';
import { CourseProgressBar } from '../../student/components/CourseProgressBar';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function StudentDetailsPage() {
  const { studentId = '' } = useParams();
  const { t, locale } = useI18n();
  const { getStudentById, getAssignedCourse } = useInstructorDemo();

  const student = getStudentById(studentId);

  if (!student) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('instructor.students.notFoundTitle')}
        description={t('instructor.students.notFoundDesc')}
        action={
          <Link to="/instructor/students" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.nav.students')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={student.fullName[locale]}
        subtitle={student.email}
        breadcrumbs={[
          { label: t('instructor.nav.students'), to: '/instructor/students' },
          { label: student.fullName[locale] },
        ]}
        action={
          student.conversationId ? (
            <Link
              to={`/instructor/messages/${student.conversationId}`}
              className="ui-btn ui-btn--primary ui-btn--md"
            >
              <Mail size={16} aria-hidden="true" /> {t('instructor.students.messageStudent')}
            </Link>
          ) : null
        }
      />

      <Card className="details-stack" style={{ gap: 16 }}>
        <h2 className="text-h3">{t('instructor.students.sharedCourses')}</h2>
        {student.enrollments.map((enr) => {
          const course = getAssignedCourse(enr.courseSlug);
          if (!course) return null;
          return (
            <div
              key={enr.courseSlug}
              style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <Link
                  to={`/instructor/courses/${course.slug}`}
                  className="text-body card-title-link"
                  style={{ fontWeight: 700 }}
                >
                  {course.title[locale]}
                </Link>
                <Badge variant={enr.status === 'completed' ? 'success' : 'brand'}>
                  {t(`instructor.status.${enr.status}`)}
                </Badge>
              </div>
              <CourseProgressBar
                percent={enr.percent}
                label={t('student.myLearning.lessonsProgress', {
                  completed: enr.completedLessons,
                  total: enr.totalLessons,
                })}
              />
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                {t('instructor.students.lastActivity')} {enr.lastActivity[locale]}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
