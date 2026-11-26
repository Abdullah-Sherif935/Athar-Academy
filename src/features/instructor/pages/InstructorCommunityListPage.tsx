import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorCommunityListPage() {
  const { t, locale } = useI18n();
  const { assignedCourses, posts } = useInstructorDemo();

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.community.title')}
        subtitle={t('instructor.community.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.community') },
        ]}
      />

      <div className="grid-2">
        {assignedCourses.map((course) => {
          const coursePosts = posts.filter((p) => p.courseSlug === course.slug);
          const pinnedCount = coursePosts.filter((p) => p.isPinned).length;
          const latest = coursePosts[0];

          return (
            <Card key={course.slug} interactive className="feature-card" style={{ gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div className="feature-card__icon" aria-hidden="true">
                  <MessageSquare size={20} />
                </div>
                <div className="section-header__meta">
                  <Badge variant="neutral">
                    {t('student.community.postsCount', { count: coursePosts.length })}
                  </Badge>
                  {pinnedCount > 0 ? (
                    <Badge variant="orange">{t('student.community.pinnedBadge')}</Badge>
                  ) : null}
                </div>
              </div>
              <h2 className="text-h3">{course.title[locale]}</h2>
              <p className="text-small">
                {latest ? latest.content[locale] : t('student.community.noPosts')}
              </p>
              <div style={{ marginBlockStart: 'auto', paddingBlockStart: 8 }}>
                <Link
                  to={`/instructor/community/${course.slug}`}
                  className="ui-btn ui-btn--primary ui-btn--sm"
                >
                  {t('instructor.community.openModeration')}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
