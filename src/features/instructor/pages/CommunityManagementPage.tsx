import { FolderSearch, Megaphone, Pin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Badge, Button, Card, EmptyState, Input, Modal, Textarea } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { CommunityModerationActions } from '../components/CommunityModerationActions';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function CommunityManagementPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const {
    getAssignedCourse,
    posts,
    replyToPost,
    togglePinPost,
    toggleHidePost,
    deletePost,
    publishCommunityAnnouncement,
  } = useInstructorDemo();

  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const course = getAssignedCourse(courseId);

  if (!course) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('instructor.courses.notAssignedTitle')}
        description={t('instructor.courses.notAssignedDesc')}
        action={
          <Link to="/instructor/community" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.nav.community')}
          </Link>
        }
      />
    );
  }

  const coursePosts = posts
    .filter((p) => p.courseSlug === course.slug)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  const handlePublishAnn = (event: FormEvent) => {
    event.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    publishCommunityAnnouncement(course.slug, annTitle, annBody);
    setAnnTitle('');
    setAnnBody('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={t('instructor.community.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.community'), to: '/instructor/community' },
          { label: course.title[locale] },
        ]}
      />

      {/* Quick Instructor Announcement */}
      <Card>
        <form onSubmit={handlePublishAnn} className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('instructor.community.newAnnTitle')}</h2>
          <Input
            label={t('instructor.announcements.titleLabel')}
            placeholder={t('instructor.community.annTitlePlaceholder')}
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
          />
          <Textarea
            label={t('instructor.announcements.bodyLabel')}
            placeholder={t('instructor.community.annBodyPlaceholder')}
            value={annBody}
            onChange={(e) => setAnnBody(e.target.value)}
          />
          <div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!annTitle.trim() || !annBody.trim()}
            >
              <Megaphone size={14} aria-hidden="true" /> {t('instructor.community.publishAnnBtn')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Posts Moderation Feed */}
      <div className="details-stack" style={{ gap: 14 }}>
        {coursePosts.map((post) => (
          <Card
            key={post.id}
            className="feature-card"
            style={{ gap: 12, opacity: post.isHidden ? 0.72 : 1 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  className={`instructor-avatar ${
                    post.authorRole === 'instructor' ? 'accent-badge--navy' : 'accent-badge--teal'
                  }`}
                  style={{ width: 40, height: 40, fontSize: '0.85rem' }}
                  aria-hidden="true"
                >
                  {post.initials}
                </div>
                <div>
                  <div className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {post.authorName[locale]}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    {post.timeLabel[locale]}
                  </div>
                </div>
              </div>

              <div className="section-header__meta">
                {post.isPinned ? (
                  <Badge variant="orange">
                    <Pin size={12} aria-hidden="true" /> {t('student.community.pinnedBadge')}
                  </Badge>
                ) : null}
                {post.isAnnouncement ? (
                  <Badge variant="brand">{t('student.community.announcementBadge')}</Badge>
                ) : null}
                {post.isHidden ? (
                  <Badge variant="error">{t('instructor.status.hidden')}</Badge>
                ) : null}
              </div>
            </div>

            {post.isHidden ? (
              <Alert variant="warning" title={t('instructor.community.hiddenNotice')} />
            ) : null}

            {post.title ? <h3 className="text-h3">{post.title[locale]}</h3> : null}
            <p className="text-body" style={{ color: 'var(--text-primary)' }}>
              {post.content[locale]}
            </p>

            <CommunityModerationActions
              post={post}
              onTogglePin={() => togglePinPost(post.id)}
              onToggleHide={() => toggleHidePost(post.id)}
              onRequestDelete={() => setDeleteTargetId(post.id)}
            />

            {post.replies.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  paddingInlineStart: 14,
                  borderInlineStart: '2px solid var(--border)',
                }}
              >
                {post.replies.map((rep) => (
                  <div
                    key={rep.id}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-subtle)',
                    }}
                  >
                    <div className="text-caption" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rep.authorName[locale]} · {rep.timeLabel[locale]}
                    </div>
                    <p className="text-small" style={{ color: 'var(--text-primary)' }}>
                      {rep.content[locale]}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const text = replyDrafts[post.id] ?? '';
                if (!text.trim()) return;
                replyToPost(post.id, text);
                setReplyDrafts((prev) => ({ ...prev, [post.id]: '' }));
              }}
              style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
            >
              <input
                type="text"
                className="ui-field__control"
                style={{ flex: 1, minWidth: 200 }}
                value={replyDrafts[post.id] ?? ''}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                placeholder={t('instructor.community.replyPlaceholder')}
                aria-label={t('instructor.community.replyPlaceholder')}
              />
              <Button type="submit" variant="secondary" size="sm">
                {t('instructor.community.sendReply')}
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title={t('instructor.community.deleteConfirmTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTargetId(null)}>
              {t('student.explore.confirmModal.cancelBtn')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTargetId) deletePost(deleteTargetId);
                setDeleteTargetId(null);
              }}
            >
              {t('instructor.community.delete')}
            </Button>
          </>
        }
      >
        <p className="text-body">{t('instructor.community.deleteConfirmBody')}</p>
      </Modal>
    </div>
  );
}
