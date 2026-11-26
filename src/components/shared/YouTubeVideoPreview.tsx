import { AlertTriangle, ExternalLink, Play } from 'lucide-react';
import { useI18n } from '../../app/providers/I18nProvider';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, isValidYouTubeVideoId } from '../../utils/youtube';
import { Alert, Badge } from '../ui';

export function YouTubeVideoPreview({
  videoId,
  title,
  showSecurityNote = false,
  showThumbnail = false,
}: {
  videoId?: string;
  title: string;
  showSecurityNote?: boolean;
  showThumbnail?: boolean;
}) {
  const { t } = useI18n();
  const valid = isValidYouTubeVideoId(videoId);

  if (!valid || !videoId) {
    return (
      <div className="video-placeholder" role="region" aria-label={title}>
        <Badge variant="teal">{t('student.classroom.videoBadge')}</Badge>
        <div className="video-placeholder__play" aria-hidden="true">
          <Play size={30} />
        </div>
        <div className="text-h3" style={{ color: 'var(--text-on-brand)' }}>
          {title}
        </div>
        <p className="text-small" style={{ color: 'rgba(248, 250, 252, 0.8)', maxWidth: '52ch' }}>
          {t('student.classroom.videoSubtitle')}
        </p>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(videoId);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId);

  return (
    <div className="details-stack" style={{ gap: 10 }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--brand-navy)',
        }}
      >
        <iframe
          src={embedUrl}
          title={title}
          style={{ width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge variant="success">YouTube ID: <bdi className="ltr-inline">{videoId}</bdi></Badge>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
            className="text-caption card-inline-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ExternalLink size={13} aria-hidden="true" /> YouTube
          </a>
        </div>

        {showThumbnail ? (
          <img
            src={thumbnailUrl}
            alt={title}
            style={{
              width: 88,
              height: 50,
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}
          />
        ) : null}
      </div>

      {showSecurityNote ? (
        <Alert variant="warning" title={t('instructor.selfService.youtubeNoticeTitle')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} aria-hidden="true" />
            {t('instructor.selfService.youtubeNoticeBody')}
          </span>
        </Alert>
      ) : null}
    </div>
  );
}
