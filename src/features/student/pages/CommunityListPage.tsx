import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function CommunityListPage() {
  const { t, locale } = useI18n();
  const { enrolledCourses, posts } = useStudentDemo();

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.community.title')}
        subtitle={t('student.community.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.community') },
        ]}
      />

      <div className="grid-2">
        {enrolledCourses.map((rec) => {
          const course = getCourseBySlug(rec.courseSlug);
          if (!course) return null;
          const coursePosts = posts.filter((p) => p.courseSlug === course.slug);
          const latest = coursePosts[0];
          const announcementsCount = coursePosts.filter((p) => p.isAnnouncement).length;

          return (
            <Card key={course.slug} interactive className="feature-card" style={{ gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div className="feature-card__icon" aria-hidden="true">
                  <MessageSquare size={20} />
                </div>
                <div className="section-header__meta">
                  <Badge variant="neutral">
                    {t('student.community.postsCount', { count: coursePosts.length })}
                  </Badge>
                  {announcementsCount > 0 ? (
                    <Badge variant="brand">{t('student.community.announcementBadge')}</Badge>
                  ) : null}
                </div>
              </div>

              <h2 className="text-h3">{course.title[locale]}</h2>
              <p className="text-small">
                {latest ? latest.content[locale] : t('student.community.noPosts')}
              </p>

              <div style={{ marginBlockStart: 'auto', paddingBlockStart: 8 }}>
                <Link
                  to={`/student/community/${course.slug}`}
                  className="ui-btn ui-btn--secondary ui-btn--sm"
                >
                  {t('student.community.openCommunity')}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
