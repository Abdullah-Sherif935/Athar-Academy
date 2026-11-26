import { FolderSearch, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Card, EmptyState } from '../../../components/ui';
import { AdminStatusBadge } from '../../admin/components/AdminStatusBadge';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorEnrollmentDetailsPage() {
  const { enrollmentId = '' } = useParams();
  const { t, locale } = useI18n();
  const { courses, students, enrollmentAuditLog } = usePlatformDemo();
  const { assignedEnrollmentRequests, canConfirmPaymentForCourse } = useInstructorDemo();

  const request = assignedEnrollmentRequests.find((r) => r.id === enrollmentId);

  if (!request) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('instructor.courses.notAssignedTitle')}
        description={t('instructor.courses.notAssignedDesc')}
        action={
          <Link to="/instructor/enrollments" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.nav.enrollments')}
          </Link>
        }
      />
    );
  }

  const course = courses.find((c) => c.slug === request.courseSlug);
  const student = students.find((s) => s.id === request.studentId);
  const auditEvents = enrollmentAuditLog.filter((e) => e.enrollmentId === request.id);
  const canConfirm = canConfirmPaymentForCourse(request.courseSlug);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course?.title[locale] ?? request.courseSlug}
        subtitle={student?.fullName[locale] ?? request.studentId}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.enrollments'), to: '/instructor/enrollments' },
          { label: request.id },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <AdminStatusBadge status={request.status} />
            <Link to="/instructor/messages" className="ui-btn ui-btn--secondary ui-btn--sm">
              <Mail size={14} aria-hidden="true" />{' '}
              {t('instructor.selfService.enrollments.contactStudentBtn')}
            </Link>
          </div>
        }
      />

      {!canConfirm ? (
        <Alert variant="warning" title={t('instructor.selfService.enrollments.coInstructorNotice')} />
      ) : null}

      <div className="grid-2">
        <Card className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('admin.common.viewDetails')}</h2>
          <div className="meta-kv-list">
            <div className="meta-kv-row">
              <span>{t('admin.enrollments.columns.student')}</span>
              <span>{student?.fullName[locale]}</span>
            </div>
            <div className="meta-kv-row">
              <span>{t('admin.enrollmentOversight.priceColumn')}</span>
              <strong>
                {request.isFreeSnapshot
                  ? t('admin.paymentStatuses.not_required')
                  : `${request.priceSnapshot.toLocaleString()} ${request.currency}`}
              </strong>
            </div>
            <div className="meta-kv-row">
              <span>{t('admin.enrollmentOversight.paymentStatus')}</span>
              <Badge variant={request.paymentStatus === 'confirmed' ? 'success' : 'neutral'}>
                {t(`admin.paymentStatuses.${request.paymentStatus}`)}
              </Badge>
            </div>
            <div className="meta-kv-row">
              <span>{t('admin.enrollments.columns.date')}</span>
              <span>{request.requestedAt[locale]}</span>
            </div>
          </div>
          {request.studentMessage ? (
            <Alert variant="info" title={student?.fullName[locale] ?? ''}>
              {request.studentMessage}
            </Alert>
          ) : null}
          {request.paymentConfirmation ? (
            <Alert variant="success" title={t('admin.enrollmentOversight.confirmedBy')}>
              {request.paymentConfirmation.instructorName[locale]} —{' '}
              {request.paymentConfirmation.amount.toLocaleString()} {request.paymentConfirmation.currency} (
              {request.paymentConfirmation.confirmedAt[locale]})
            </Alert>
          ) : null}
        </Card>

        <Card className="details-stack" style={{ gap: 10 }}>
          <h2 className="text-h3">{t('admin.enrollmentOversight.auditLogTitle')}</h2>
          {auditEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: 10,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong className="text-small">{ev.eventType}</strong>
                <span className="text-caption">{ev.timestamp[locale]}</span>
              </div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                {ev.actorRole}: {ev.actorId} → {ev.newStatus}
              </div>
              {ev.reason ? <div className="text-caption">{ev.reason}</div> : null}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
