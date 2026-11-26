import { Play } from 'lucide-react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { YouTubeVideoPreview } from '../../../components/shared/YouTubeVideoPreview';
import { Badge } from '../../../components/ui';
import { isValidYouTubeVideoId } from '../../../utils/youtube';

export function VideoPlaceholder({
  lessonTitle,
  videoSourceId,
}: {
  lessonTitle: string;
  videoSourceId?: string;
}) {
  const { t } = useI18n();

  if (isValidYouTubeVideoId(videoSourceId)) {
    return <YouTubeVideoPreview videoId={videoSourceId} title={lessonTitle} />;
  }

  return (
    <div className="video-placeholder" role="region" aria-label={t('student.classroom.videoTitle')}>
      <Badge variant="teal">{t('student.classroom.videoBadge')}</Badge>
      <div className="video-placeholder__play" aria-hidden="true">
        <Play size={30} />
      </div>
      <div className="text-h3" style={{ color: 'var(--text-on-brand)' }}>
        {lessonTitle}
      </div>
      <p className="text-small" style={{ color: 'rgba(248, 250, 252, 0.8)', maxWidth: '52ch' }}>
        {t('student.classroom.videoSubtitle')}
      </p>
    </div>
  );
}
