import { CheckCircle2, ClipboardCheck, Mail, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Modal, Select, Textarea } from '../../../components/ui';
import type { EnrollmentRequestRecord, EnrollmentRequestStatus } from '../../../data/mock/student';
import { AdminStatusBadge } from '../../admin/components/AdminStatusBadge';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorEnrollmentsPage() {
  const { t, locale } = useI18n();
  const { courses, students } = usePlatformDemo();
  const {
    isInstructorDisabled,
    assignedCourses,
    assignedEnrollmentRequests,
    assignedDisputes,
    canConfirmPaymentForCourse,
    acceptEnrollmentForPayment,
    confirmDirectPayment,
    rejectEnrollment,
    cancelEnrollment,
  } = useInstructorDemo();

  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EnrollmentRequestStatus>('all');
  const [confirmTarget, setConfirmTarget] = useState<EnrollmentRequestRecord | null>(null);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = useMemo(
    () =>
      assignedEnrollmentRequests.filter((r) => {
        if (courseFilter !== 'all' && r.courseSlug !== courseFilter) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        return true;
      }),
    [assignedEnrollmentRequests, courseFilter, statusFilter],
  );

  if (isInstructorDisabled) {
    return (
      <Alert variant="error" title={t('instructor.selfService.revokedTitle')}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={16} aria-hidden="true" />
          {t('instructor.selfService.revokedBody')}
        </span>
      </Alert>
    );
  }

  const stats = {
    total: assignedEnrollmentRequests.length,
    pending: assignedEnrollmentRequests.filter((r) => r.status === 'pending').length,
    awaitingPayment: assignedEnrollmentRequests.filter((r) => r.status === 'awaiting_payment').length,
    confirmed: assignedEnrollmentRequests.filter((r) => r.paymentStatus === 'confirmed').length,
    active: assignedEnrollmentRequests.filter((r) => r.status === 'active' || r.status === 'approved').length,
    rejected: assignedEnrollmentRequests.filter((r) => r.status === 'rejected').length,
  };

  const handleConfirmPayment = () => {
    if (!confirmTarget || !declarationChecked) return;
    confirmDirectPayment(confirmTarget.id);
    setConfirmTarget(null);
    setDeclarationChecked(false);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetId) return;
    rejectEnrollment(rejectTargetId, rejectReason);
    setRejectTargetId(null);
    setRejectReason('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.selfService.enrollments.title')}
        subtitle={t('instructor.selfService.enrollments.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.enrollments') },
        ]}
      />

      <Alert variant="info" title={t('instructor.selfService.enrollments.businessNoticeTitle')}>
        {t('instructor.selfService.enrollments.businessNoticeBody')}
      </Alert>

      {/* Stats Strip */}
      <div className="admin-stats-grid">
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('instructor.selfService.enrollments.stats.total')}</span>
          <div className="student-stat-card__value">{stats.total}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('instructor.selfService.enrollments.stats.pending')}</span>
          <div className="student-stat-card__value">{stats.pending}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('instructor.selfService.enrollments.stats.awaitingPayment')}</span>
          <div className="student-stat-card__value">{stats.awaitingPayment}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('instructor.selfService.enrollments.stats.confirmed')}</span>
          <div className="student-stat-card__value">{stats.confirmed}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('instructor.selfService.enrollments.stats.active')}</span>
          <div className="student-stat-card__value">{stats.active}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">{t('instructor.selfService.enrollments.stats.rejected')}</span>
          <div className="student-stat-card__value">{stats.rejected}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="admin-filter-bar">
          <div style={{ flex: '1 1 220px' }}>
            <Select
              aria-label={t('admin.common.allCourses')}
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">{t('admin.common.allCourses')}</option>
              {assignedCourses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title[locale]}
                </option>
              ))}
            </Select>
          </div>
          <div style={{ flex: '0 1 200px' }}>
            <Select
              aria-label={t('admin.common.allStatuses')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | EnrollmentRequestStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="pending">{t('admin.statuses.pending')}</option>
              <option value="awaiting_payment">{t('admin.statuses.awaiting_payment')}</option>
              <option value="active">{t('admin.statuses.active')}</option>
              <option value="rejected">{t('admin.statuses.rejected')}</option>
              <option value="cancelled">{t('admin.statuses.cancelled')}</option>
              <option value="suspended">{t('admin.statuses.suspended')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Enrollment Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={24} />}
          title={t('admin.enrollments.empty')}
          description={t('instructor.selfService.enrollments.subtitle')}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.enrollments.columns.student')}</th>
                <th>{t('admin.enrollments.columns.course')}</th>
                <th>{t('admin.enrollments.columns.date')}</th>
                <th>{t('admin.enrollmentOversight.priceColumn')}</th>
                <th>{t('admin.enrollmentOversight.paymentStatus')}</th>
                <th>{t('admin.enrollments.columns.status')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const student = students.find((s) => s.id === req.studentId);
                const course = courses.find((c) => c.slug === req.courseSlug);
                const canConfirm = canConfirmPaymentForCourse(req.courseSlug);

                return (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{student?.fullName[locale] ?? req.studentId}</div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        <bdi className="ltr-inline">{student?.email}</bdi>
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/instructor/enrollments/${req.id}`}
                        className="card-title-link"
                        style={{ fontWeight: 600 }}
                      >
                        {course?.title[locale] ?? req.courseSlug}
                      </Link>
                      {!canConfirm ? (
                        <div className="text-caption" style={{ color: 'var(--warning)' }}>
                          {t('instructor.selfService.enrollments.coInstructorNotice')}
                        </div>
                      ) : null}
                    </td>
                    <td>{req.requestedAt[locale]}</td>
                    <td>
                      <Badge variant="neutral">
                        {req.isFreeSnapshot
                          ? t('admin.paymentStatuses.not_required')
                          : `${req.priceSnapshot.toLocaleString()} ${req.currency}`}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={req.paymentStatus === 'confirmed' ? 'success' : 'neutral'}>
                        {t(`admin.paymentStatuses.${req.paymentStatus}`)}
                      </Badge>
                    </td>
                    <td>
                      <AdminStatusBadge status={req.status} />
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/instructor/enrollments/${req.id}`}
                          className="ui-btn ui-btn--secondary ui-btn--sm"
                        >
                          {t('admin.common.viewDetails')}
                        </Link>
                        {req.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => acceptEnrollmentForPayment(req.id)}
                          >
                            {t('instructor.selfService.enrollments.acceptForPaymentBtn')}
                          </Button>
                        ) : null}
                        {(req.status === 'awaiting_payment' || req.status === 'pending') &&
                        !req.isFreeSnapshot ? (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={!canConfirm}
                            onClick={() => {
                              setConfirmTarget(req);
                              setDeclarationChecked(false);
                            }}
                          >
                            <CheckCircle2 size={14} aria-hidden="true" />{' '}
                            {t('instructor.selfService.enrollments.confirmPaymentBtn')}
                          </Button>
                        ) : null}
                        {req.status === 'pending' || req.status === 'awaiting_payment' ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectTargetId(req.id);
                              setRejectReason('');
                            }}
                          >
                            {t('instructor.selfService.enrollments.rejectBtn')}
                          </Button>
                        ) : null}
                        {req.status === 'awaiting_payment' ? (
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => cancelEnrollment(req.id, 'Cancelled by instructor')}
                          >
                            {t('instructor.selfService.enrollments.cancelBtn')}
                          </Button>
                        ) : null}
                        <Link
                          to="/instructor/messages"
                          className="ui-btn ui-btn--tertiary ui-btn--sm"
                          aria-label={t('instructor.selfService.enrollments.contactStudentBtn')}
                        >
                          <Mail size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Course Disputes visible to Instructor */}
      {assignedDisputes.length > 0 ? (
        <Card className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('admin.enrollmentOversight.disputesTitle')}</h2>
          {assignedDisputes.map((d) => {
            const course = courses.find((c) => c.slug === d.courseSlug);
            return (
              <div
                key={d.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong>{course?.title[locale] ?? d.courseSlug}</strong>
                  <Badge variant={d.status === 'resolved' ? 'success' : 'warning'}>{d.status}</Badge>
                </div>
                <p className="text-small">{d.description}</p>
                {d.resolutionNote ? (
                  <Alert variant="success" title={t('admin.enrollmentOversight.resolveBtn')}>
                    {d.resolutionNote}
                  </Alert>
                ) : null}
              </div>
            );
          })}
        </Card>
      ) : null}

      {/* Direct Payment Confirmation Declaration Modal */}
      <Modal
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        title={t('instructor.selfService.enrollments.confirmModalTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmTarget(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!declarationChecked}
              onClick={handleConfirmPayment}
            >
              {t('instructor.selfService.enrollments.confirmSubmitBtn')}
            </Button>
          </>
        }
      >
        {confirmTarget ? (
          <div className="details-stack" style={{ gap: 12 }}>
            <Alert variant="warning" title={t('instructor.selfService.enrollments.businessNoticeTitle')}>
              {t('instructor.selfService.enrollments.confirmDisclaimer')}
            </Alert>
            <div className="meta-kv-list">
              <div className="meta-kv-row">
                <span>{t('admin.enrollmentOversight.priceColumn')}</span>
                <strong>
                  {confirmTarget.priceSnapshot.toLocaleString()} {confirmTarget.currency}
                </strong>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
              />
              <span className="text-small" style={{ fontWeight: 600 }}>
                {t('instructor.selfService.enrollments.confirmCheckboxLabel')}
              </span>
            </label>
          </div>
        ) : null}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectTargetId)}
        onClose={() => setRejectTargetId(null)}
        title={t('admin.enrollments.rejectModal.title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTargetId(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              {t('admin.enrollments.rejectModal.confirm')}
            </Button>
          </>
        }
      >
        <Textarea
          label={t('admin.enrollments.rejectModal.reasonLabel')}
          placeholder={t('admin.enrollments.rejectModal.reasonPlaceholder')}
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
