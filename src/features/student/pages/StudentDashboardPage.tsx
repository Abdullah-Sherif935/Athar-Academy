import { Award, BookOpen, Calendar, CheckCircle2, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { ConversationListItem } from '../components/ConversationListItem';
import { EnrolledCourseCard } from '../components/EnrolledCourseCard';
import { LearningStatCard } from '../components/LearningStatCard';
import { StudentWelcomeCard } from '../components/StudentWelcomeCard';
import { useStudentDemo } from '../context/StudentDemoContext';

export function StudentDashboardPage() {
  const { t, locale } = useI18n();
  const { profile, enrolledCourses, getCourseProgress, posts, conversations, certificates } =
    useStudentDemo();

  const progressList = enrolledCourses.map((rec) => getCourseProgress(rec.courseSlug));
  const totalLessons = progressList.reduce((sum, p) => sum + p.total, 0);
  const completedLessons = progressList.reduce((sum, p) => sum + p.completed, 0);
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const inProgressRecords = enrolledCourses.filter((rec) => {
    const p = getCourseProgress(rec.courseSlug);
    return p.total > 0 && p.completed < p.total;
  });

  const announcements = posts.filter((p) => p.isAnnouncement).slice(0, 2);
  const upcomingItems = enrolledCourses.filter((rec) => Boolean(rec.upcomingActivity));

  return (
    <div className="details-stack" style={{ gap: 28 }}>
      <StudentWelcomeCard profile={profile} overallPercent={overallPercent} />

      {/* Stats */}
      <div className="grid-4">
        <LearningStatCard
          icon={<BookOpen size={20} />}
          value={enrolledCourses.length}
          label={t('student.dashboard.enrolledCourses')}
          tone="blue"
        />
        <LearningStatCard
          icon={<CheckCircle2 size={20} />}
          value={`${completedLessons}/${totalLessons}`}
          label={t('student.dashboard.completedLessons')}
          tone="teal"
        />
        <LearningStatCard
          icon={<Award size={20} />}
          value={certificates.length}
          label={t('student.dashboard.earnedCertificates')}
          tone="orange"
        />
        <LearningStatCard
          icon={<MessageSquare size={20} />}
          value={`${overallPercent}%`}
          label={t('student.dashboard.overallProgress')}
          tone="teal"
        />
      </div>

      {/* Continue Learning */}
      <section>
        <div className="section-heading-row" style={{ marginBlockEnd: 16 }}>
          <h2 className="text-h2">{t('student.dashboard.continueLearning')}</h2>
          <Link to="/student/my-learning" className="card-inline-link">
            {t('student.dashboard.viewAll')}
          </Link>
        </div>
        <div className="grid-2">
          {inProgressRecords.slice(0, 2).map((record) => (
            <EnrolledCourseCard key={record.courseSlug} record={record} />
          ))}
        </div>
      </section>

      {/* Upcoming & Quick Navigation */}
      <div className="grid-2">
        <Card className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <h2 className="text-h3">{t('student.dashboard.upcomingTitle')}</h2>
            <Badge variant="orange">{t('common.demoBadge')}</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingItems.map((rec) => {
              const course = getCourseBySlug(rec.courseSlug);
              if (!course || !rec.upcomingActivity) return null;
              return (
                <Link
                  key={rec.courseSlug}
                  to={`/student/courses/${course.slug}/lessons/${rec.lastLessonId}`}
                  className="lesson-item"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-subtle)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Calendar
                      size={17}
                      style={{ color: 'var(--brand-blue)', marginBlockStart: 2, flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-small" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rec.upcomingActivity.title[locale]}
                      </div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        {course.title[locale]} · {rec.upcomingActivity.dueLabel[locale]}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <h2 className="text-h3">{t('student.dashboard.recentMessages')}</h2>
            <Link to="/student/messages" className="card-inline-link">
              <Mail size={15} aria-hidden="true" /> {t('student.dashboard.viewAll')}
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conversations.slice(0, 2).map((conv) => (
              <ConversationListItem key={conv.id} conversation={conv} />
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Announcements */}
      <section>
        <div className="section-heading-row" style={{ marginBlockEnd: 16 }}>
          <h2 className="text-h2">{t('student.dashboard.recentAnnouncements')}</h2>
          <Link to="/student/community" className="card-inline-link">
            {t('student.dashboard.viewAll')}
          </Link>
        </div>
        <div className="grid-2">
          {announcements.map((post) => (
            <AnnouncementCard
              key={post.id}
              post={post}
              courseTitle={getCourseBySlug(post.courseSlug)?.title[locale]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
