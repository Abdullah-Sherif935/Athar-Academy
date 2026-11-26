import { Heart, MessageCircle, Pin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Button, Card } from '../../../components/ui';
import type { CommunityPostItem } from '../../../data/mock/student';

export function CommunityPost({
  post,
  onToggleLike,
  onAddReply,
}: {
  post: CommunityPostItem;
  onToggleLike: (postId: string) => void;
  onAddReply: (postId: string, text: string) => void;
}) {
  const { t, locale } = useI18n();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = (event: FormEvent) => {
    event.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(post.id, replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <Card className="feature-card" style={{ gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className={`instructor-avatar ${
              post.authorRole === 'instructor' ? 'accent-badge--navy' : 'accent-badge--teal'
            }`}
            style={{ width: 42, height: 42, fontSize: '0.875rem' }}
            aria-hidden="true"
          >
            {post.initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {post.authorName[locale]}
              </span>
              <Badge variant={post.authorRole === 'instructor' ? 'brand' : 'neutral'}>
                {post.authorRole === 'instructor'
                  ? t('student.community.instructorBadge')
                  : t('student.community.studentBadge')}
              </Badge>
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
            <Badge variant="info">{t('student.community.announcementBadge')}</Badge>
          ) : null}
        </div>
      </div>

      {post.title ? <h3 className="text-h3">{post.title[locale]}</h3> : null}
      <p className="text-body" style={{ color: 'var(--text-primary)' }}>
        {post.content[locale]}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBlockStart: 8, borderBlockStart: '1px solid var(--border)' }}>
        <Button
          variant={post.likedByMe ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onToggleLike(post.id)}
        >
          <Heart size={14} aria-hidden="true" /> {t('student.community.likeBtn')} ({post.likes})
        </Button>
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => setShowReplyBox((prev) => !prev)}
        >
          <MessageCircle size={14} aria-hidden="true" /> {t('student.community.replyBtn')} (
          {post.replies.length})
        </Button>
      </div>

      {post.replies.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingInlineStart: 16,
            borderInlineStart: '2px solid var(--border)',
          }}
        >
          {post.replies.map((reply) => (
            <div
              key={reply.id}
              style={{
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBlockEnd: 4 }}>
                <span className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {reply.authorName[locale]}
                </span>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  · {reply.timeLabel[locale]}
                </span>
              </div>
              <p className="text-small" style={{ color: 'var(--text-primary)' }}>
                {reply.content[locale]}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {showReplyBox ? (
        <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="ui-field__control"
            style={{ flex: 1, minWidth: 200 }}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder={t('student.community.replyPlaceholder')}
            aria-label={t('student.community.replyPlaceholder')}
          />
          <Button type="submit" variant="primary" size="sm">
            {t('student.community.sendReply')}
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
