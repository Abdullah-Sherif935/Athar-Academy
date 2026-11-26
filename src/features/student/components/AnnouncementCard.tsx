import { Megaphone, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Card } from '../../../components/ui';
import type { CommunityPostItem } from '../../../data/mock/student';

export function AnnouncementCard({
  post,
  courseTitle,
}: {
  post: CommunityPostItem;
  courseTitle?: string;
}) {
  const { t, locale } = useI18n();

  return (
    <Card className="feature-card" style={{ gap: 10 }}>
      <div className="section-header__meta">
        <Badge variant="brand">
          <Megaphone size={12} aria-hidden="true" /> {t('student.community.announcementBadge')}
        </Badge>
        {post.isPinned ? (
          <Badge variant="orange">
            <Pin size={12} aria-hidden="true" /> {t('student.community.pinnedBadge')}
          </Badge>
        ) : null}
        {courseTitle ? <Badge variant="neutral">{courseTitle}</Badge> : null}
      </div>
      {post.title ? <h3 className="text-h3">{post.title[locale]}</h3> : null}
      <p className="text-small">{post.content[locale]}</p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          {post.authorName[locale]} · {post.timeLabel[locale]}
        </span>
        <Link to={`/student/community/${post.courseSlug}`} className="card-inline-link">
          {t('student.community.openCommunity')}
        </Link>
      </div>
    </Card>
  );
}
