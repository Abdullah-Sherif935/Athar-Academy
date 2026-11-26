import { Ban, CheckCircle2, Clock, CreditCard, PauseCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, type BadgeProps } from '../../../components/ui';
import type { CourseAvailabilityState, EnrollmentRequestStatus } from '../../../data/mock/student';

type StatusValue = CourseAvailabilityState | EnrollmentRequestStatus;

const STATUS_CONFIG: Record<
  StatusValue,
  { variant: BadgeProps['variant']; Icon: typeof CheckCircle2; labelKey: string }
> = {
  available: {
    variant: 'brand',
    Icon: Sparkles,
    labelKey: 'student.explore.status.available',
  },
  pending: {
    variant: 'warning',
    Icon: Clock,
    labelKey: 'student.explore.status.pending',
  },
  awaiting_payment: {
    variant: 'brand',
    Icon: CreditCard,
    labelKey: 'admin.statuses.awaiting_payment',
  },
  payment_confirmed: {
    variant: 'teal',
    Icon: CheckCircle2,
    labelKey: 'admin.statuses.payment_confirmed',
  },
  active: {
    variant: 'success',
    Icon: CheckCircle2,
    labelKey: 'admin.statuses.active',
  },
  enrolled: {
    variant: 'success',
    Icon: CheckCircle2,
    labelKey: 'student.explore.status.enrolled',
  },
  approved: {
    variant: 'success',
    Icon: CheckCircle2,
    labelKey: 'student.explore.status.approved',
  },
  rejected: {
    variant: 'error',
    Icon: XCircle,
    labelKey: 'student.explore.status.rejected',
  },
  cancelled: {
    variant: 'neutral',
    Icon: Ban,
    labelKey: 'admin.statuses.cancelled',
  },
  suspended: {
    variant: 'error',
    Icon: PauseCircle,
    labelKey: 'admin.statuses.suspended',
  },
  refunded: {
    variant: 'neutral',
    Icon: RotateCcw,
    labelKey: 'admin.statuses.refunded',
  },
};

export function EnrollmentStatusBadge({ status }: { status: StatusValue }) {
  const { t } = useI18n();
  const { variant, Icon, labelKey } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <Badge variant={variant}>
      <Icon size={13} aria-hidden="true" />
      <span>{t(labelKey)}</span>
    </Badge>
  );
}
