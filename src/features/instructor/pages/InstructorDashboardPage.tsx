import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileEdit,
  Mail,
  Megaphone,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import { LearningStatCard } from '../../student/components/LearningStatCard';
import { InstructorConversationListItem } from '../components/InstructorConversationListItem';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorDashboardPage() {
  const { t, locale } = useI18n();
  const { profile, assignedCourses, students, announcements, conversations } = useInstructorDemo();

  const allLessons = assignedCourses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons.map((l) => ({ course: c, lesson: l }))),
  );
  const publishedLessons = allLessons.filter((x) => x.lesson.status === 'published').length;
  const draftLessonsList = allLessons.filter((x) => x.lesson.status === 'draft');

  const allEnrollments = students.flatMap((s) => s.enrollments);
  const avgCompletion =
    allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((sum, e) => sum + e.percent, 0) / allEnrollments.length)
      : 0;

  return (
    <div className="details-stack" style={{ gap: 28 }}>
      {/* Welcome Card */}
      <div className="welcome-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="instructor-avatar accent-badge--teal"
            style={{ width: 60, height: 60, fontSize: '1.25rem' }}
            aria-hidden="true"
          >
            {profile.initials}
          </div>
          <div>
            <Badge variant="teal">{t('instructor.portalName')}</Badge>
            <h1 className="text-h1" style={{ marginBlockStart: 6 }}>
              {t('instructor.dashboard.welcome', { name: profile.fullName[locale] })}
            </h1>
            <p className="text-small" style={{ marginBlockStart: 4 }}>
              {t('instructor.dashboard.subtitle')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/instructor/courses" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.dashboard.manageCourses')}
          </Link>
          <Link to="/instructor/announcements" className="ui-btn ui-btn--secondary ui-btn--md">
            {t('instructor.dashboard.newAnnouncement')}
          </Link>
        </div>
      </div>

      {/* Scoped Stats */}
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
          value={publishedLessons}
          label={t('instructor.dashboard.publishedLessons')}
          tone="teal"
        />
        <LearningStatCard
          icon={<BarChart3 size={20} />}
          value={`${avgCompletion}%`}
          label={t('instructor.dashboard.avgCompletion')}
          tone="orange"
        />
      </div>

      {/* Drafts & Recent Messages */}
      <div className="grid-2">
        <Card className="feature-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h2 className="text-h3">{t('instructor.dashboard.pendingDrafts')}</h2>
            <Badge variant="warning">
              <FileEdit size={12} aria-hidden="true" /> {draftLessonsList.length}
            </Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {draftLessonsList.slice(0, 3).map(({ course, lesson }) => (
              <Link
                key={`${course.slug}-${lesson.id}`}
                to={`/instructor/courses/${course.slug}/lessons/${lesson.id}`}
                className="lesson-item"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-subtle)' }}
              >
                <div>
                  <div className="text-small" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lesson.title[locale]}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    {course.title[locale]}
                  </div>
                </div>
                <LessonStatusBadge status={lesson.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="feature-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h2 className="text-h3">{t('instructor.dashboard.recentMessages')}</h2>
            <Link to="/instructor/messages" className="card-inline-link">
              <Mail size={15} aria-hidden="true" /> {t('instructor.dashboard.viewAll')}
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conversations.slice(0, 2).map((conv) => (
              <InstructorConversationListItem key={conv.id} conversation={conv} />
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card className="feature-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <h2 className="text-h3">{t('instructor.dashboard.recentAnnouncements')}</h2>
          <Link to="/instructor/announcements" className="card-inline-link">
            <Megaphone size={15} aria-hidden="true" /> {t('instructor.dashboard.viewAll')}
          </Link>
        </div>
        <div className="grid-2">
          {announcements.slice(0, 2).map((ann) => {
            const course = assignedCourses.find((c) => c.slug === ann.courseSlug);
            return (
              <div
                key={ann.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div className="section-header__meta">
                  <LessonStatusBadge status={ann.status} />
                  {course ? <Badge variant="brand">{course.title[locale]}</Badge> : null}
                </div>
                <div className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {ann.title[locale]}
                </div>
                <p className="text-caption">{ann.body[locale]}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
