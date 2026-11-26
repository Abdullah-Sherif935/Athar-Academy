import { FolderSearch, MessageSquare, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Button, Card, EmptyState, Textarea } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import { CommunityPost } from '../components/CommunityPost';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function CourseCommunityPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const { posts, addPost, addReply, toggleLikePost } = useStudentDemo();
  const [postText, setPostText] = useState('');

  const course = getCourseBySlug(courseId);

  if (!course) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('student.courseOverview.notEnrolledTitle')}
        description={t('student.courseOverview.notEnrolledDesc')}
        action={
          <Link to="/student/community" className="ui-btn ui-btn--primary ui-btn--md">
            {t('student.nav.community')}
          </Link>
        }
      />
    );
  }

  const coursePosts = posts
    .filter((p) => p.courseSlug === course.slug)
    .sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));

  const handlePublish = (event: FormEvent) => {
    event.preventDefault();
    if (!postText.trim()) return;
    addPost(course.slug, postText);
    setPostText('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={t('student.community.demoHint')}
        breadcrumbs={[
          { label: t('student.nav.community'), to: '/student/community' },
          { label: course.title[locale] },
        ]}
        action={
          <Link to={`/student/courses/${course.slug}`} className="ui-btn ui-btn--secondary ui-btn--sm">
            {t('student.myLearning.overviewBtn')}
          </Link>
        }
      />

      <Card>
        <form onSubmit={handlePublish} className="details-stack" style={{ gap: 12 }}>
          <Textarea
            label={t('student.community.composerTitle')}
            placeholder={t('student.community.composerPlaceholder')}
            value={postText}
            onChange={(event) => setPostText(event.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" size="md" disabled={!postText.trim()}>
              <Send size={15} aria-hidden="true" /> {t('student.community.publishBtn')}
            </Button>
          </div>
        </form>
      </Card>

      <Alert variant="info" title={t('common.demoBadge')}>
        {t('student.community.demoHint')}
      </Alert>

      {coursePosts.length > 0 ? (
        <div className="details-stack" style={{ gap: 16 }}>
          {coursePosts.map((post) => (
            <CommunityPost
              key={post.id}
              post={post}
              onToggleLike={toggleLikePost}
              onAddReply={addReply}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare size={24} />}
          title={t('student.community.noPosts')}
          description={t('student.community.demoHint')}
        />
      )}
    </div>
  );
}
