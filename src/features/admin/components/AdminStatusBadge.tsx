import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge } from '../../../components/ui';

type StatusKey =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'revoked'
  | 'draft'
  | 'published'
  | 'archived'
  | 'pending'
  | 'pending_approval'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'hidden';

const VARIANT_MAP: Record<StatusKey, 'success' | 'warning' | 'error' | 'neutral' | 'brand' | 'teal'> = {
  active: 'success',
  published: 'success',
  approved: 'success',
  payment_confirmed: 'teal',
  awaiting_payment: 'brand',
  pending: 'warning',
  pending_approval: 'warning',
  draft: 'neutral',
  inactive: 'neutral',
  archived: 'neutral',
  cancelled: 'neutral',
  refunded: 'neutral',
  hidden: 'neutral',
  suspended: 'error',
  revoked: 'error',
  rejected: 'error',
};

export function AdminStatusBadge({ status }: { status: StatusKey }) {
  const { t } = useI18n();
  return <Badge variant={VARIANT_MAP[status]}>{t(`admin.statuses.${status}`)}</Badge>;
}
