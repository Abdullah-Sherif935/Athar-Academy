import { Archive, CheckCircle2, Clock, FileEdit, XCircle } from 'lucide-react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge } from '../../../components/ui';
import type { AdminCourseStatus, AdminLessonStatus } from '../../../data/mock/admin';

type CombinedStatus = AdminCourseStatus | AdminLessonStatus;

export function LessonStatusBadge({ status }: { status: CombinedStatus }) {
  const { t } = useI18n();
  if (status === 'published') {
    return (
      <Badge variant="success">
        <CheckCircle2 size={12} aria-hidden="true" /> {t('instructor.status.published')}
      </Badge>
    );
  }
  if (status === 'pending_approval') {
    return (
      <Badge variant="warning">
        <Clock size={12} aria-hidden="true" /> {t('admin.status.pendingApproval')}
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge variant="error">
        <XCircle size={12} aria-hidden="true" /> {t('admin.status.rejected')}
      </Badge>
    );
  }
  if (status === 'archived') {
    return (
      <Badge variant="neutral">
        <Archive size={12} aria-hidden="true" /> {t('admin.status.archived')}
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      <FileEdit size={12} aria-hidden="true" /> {t('instructor.status.draft')}
    </Badge>
  );
}
