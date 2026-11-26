import { Eye, EyeOff, Pin, Trash2 } from 'lucide-react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Button } from '../../../components/ui';
import type { ModerationPostItem } from '../../../data/mock/instructor';

export function CommunityModerationActions({
  post,
  onTogglePin,
  onToggleHide,
  onRequestDelete,
}: {
  post: ModerationPostItem;
  onTogglePin: () => void;
  onToggleHide: () => void;
  onRequestDelete: () => void;
}) {
  const { t } = useI18n();

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <Button variant="secondary" size="sm" onClick={onTogglePin}>
        <Pin size={14} aria-hidden="true" />{' '}
        {post.isPinned ? t('instructor.community.unpin') : t('instructor.community.pin')}
      </Button>
      <Button variant="secondary" size="sm" onClick={onToggleHide}>
        {post.isHidden ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}{' '}
        {post.isHidden ? t('instructor.community.restore') : t('instructor.community.hide')}
      </Button>
      <Button variant="destructive" size="sm" onClick={onRequestDelete}>
        <Trash2 size={14} aria-hidden="true" /> {t('instructor.community.delete')}
      </Button>
    </div>
  );
}
