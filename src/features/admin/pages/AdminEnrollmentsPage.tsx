import { ClipboardCheck, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Input, Modal, Select, Textarea } from '../../../components/ui';
import type { EnrollmentRequestStatus } from '../../../data/mock/student';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminEnrollmentsPage() {
  const { t, locale } = useI18n();
  const {
    enrollmentRequests,
    enrollmentDisputes,
    enrollmentAuditLog,
    courses,
    students,
    instructors,
    approveEnrollmentRequest,
    rejectEnrollmentRequest,
    suspendEnrollment,
    reactivateEnrollment,
    adminOverrideEnrollmentStatus,
    resolveEnrollmentDispute,
  } = usePlatformDemo();

  const [statusFilter, setStatusFilter] = useState<'all' | EnrollmentRequestStatus>('all');
  const [query, setQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<EnrollmentRequestStatus>('active');
  const [overrideReason, setOverrideReason] = useState('');

  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [suspendOnResolve, setSuspendOnResolve] = useState(false);
  const [refundConfirmed, setRefundConfirmed] = useState(false);

  const demoStudent = students.find((s) => s.id === 'stu-sara');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrollmentRequests.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (!q) return true;
      const course = courses.find((c) => c.slug === req.courseSlug);
      const studentName = `${demoStudent?.fullName.ar ?? ''} ${demoStudent?.fullName.en ?? ''}`.toLowerCase();
      return (
        studentName.includes(q) ||
        (course?.title.ar.toLowerCase().includes(q) ?? false) ||
        (course?.title.en.toLowerCase().includes(q) ?? false)
      );
    });
  }, [courses, demoStudent, enrollmentRequests, query, statusFilter]);

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    rejectEnrollmentRequest(rejectingId, rejectReason, 'admin', 'super-admin');
    setRejectingId(null);
    setRejectReason('');
  };

  const handleConfirmOverride = () => {
    if (!overrideId || !overrideReason.trim()) return;
    adminOverrideEnrollmentStatus(overrideId, overrideStatus, overrideReason);
    setOverrideId(null);
    setOverrideReason('');
  };

  const handleConfirmResolve = () => {
    if (!resolvingDisputeId || !resolutionNote.trim()) return;
    resolveEnrollmentDispute(resolvingDisputeId, resolutionNote, {
      suspendAccess: suspendOnResolve,
      refundConfirmedByParties: refundConfirmed,
    });
    setResolvingDisputeId(null);
    setResolutionNote('');
    setSuspendOnResolve(false);
    setRefundConfirmed(false);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.enrollments.title')}
        subtitle={t('admin.enrollments.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.enrollments') },
        ]}
      />

      <Card>
        <div className="admin-filter-bar">
          <div style={{ flex: '1 1 240px' }}>
            <Input
              aria-label={t('admin.common.searchPlaceholder')}
              placeholder={t('admin.common.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 1 200px' }}>
            <Select
              aria-label={t('admin.enrollments.columns.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | EnrollmentRequestStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="pending">{t('admin.statuses.pending')}</option>
              <option value="awaiting_payment">{t('admin.statuses.awaiting_payment')}</option>
              <option value="active">{t('admin.statuses.active')}</option>
              <option value="rejected">{t('admin.statuses.rejected')}</option>
              <option value="suspended">{t('admin.statuses.suspended')}</option>
              <option value="cancelled">{t('admin.statuses.cancelled')}</option>
              <option value="refunded">{t('admin.statuses.refunded')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={24} />}
          title={t('admin.enrollments.empty')}
          description={t('admin.enrollments.subtitle')}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.enrollments.columns.student')}</th>
                <th>{t('admin.enrollments.columns.course')}</th>
                <th>{t('admin.enrollmentOversight.leadInstructor')}</th>
                <th>{t('admin.enrollmentOversight.priceColumn')}</th>
                <th>{t('admin.enrollmentOversight.paymentStatus')}</th>
                <th>{t('admin.enrollments.columns.status')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const course = courses.find((c) => c.slug === req.courseSlug);
                const leadInst = instructors.find((i) => i.slug === req.leadInstructorSlug);
                const isActive = req.status === 'active' || req.status === 'approved';
                return (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{demoStudent?.fullName[locale] ?? 'Sara Al-Ali'}</div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        <bdi className="ltr-inline">{demoStudent?.email}</bdi>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{course?.title[locale] ?? req.courseSlug}</div>
                      {req.paymentConfirmation ? (
                        <div className="text-caption" style={{ color: 'var(--success)' }}>
                          {t('admin.enrollmentOversight.confirmedBy')}:{' '}
                          {req.paymentConfirmation.instructorName[locale]}
                        </div>
                      ) : null}
                    </td>
                    <td>{leadInst?.name[locale] ?? req.leadInstructorSlug}</td>
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
                        {req.status === 'pending' || req.status === 'awaiting_payment' ? (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => approveEnrollmentRequest(req.id)}
                            >
                              {t('admin.common.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setRejectingId(req.id);
                                setRejectReason('');
                              }}
                            >
                              {t('admin.common.reject')}
                            </Button>
                          </>
                        ) : null}
                        {isActive ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => suspendEnrollment(req.id, 'Suspended by Super Admin')}
                          >
                            {t('admin.enrollmentOversight.suspendBtn')}
                          </Button>
                        ) : null}
                        {req.status === 'suspended' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => reactivateEnrollment(req.id, 'Reactivated by Super Admin')}
                          >
                            {t('admin.enrollmentOversight.reactivateBtn')}
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="tertiary"
                          onClick={() => {
                            setOverrideId(req.id);
                            setOverrideStatus(req.status);
                            setOverrideReason('');
                          }}
                        >
                          {t('admin.enrollmentOversight.overrideBtn')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Disputes Queue */}
      <Card className="details-stack" style={{ gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} style={{ color: 'var(--brand-orange)' }} aria-hidden="true" />
            <h2 className="text-h3">{t('admin.enrollmentOversight.disputesTitle')}</h2>
          </div>
          <Badge variant={enrollmentDisputes.some((d) => d.status !== 'resolved') ? 'warning' : 'neutral'}>
            {enrollmentDisputes.length}
          </Badge>
        </div>

        {enrollmentDisputes.length === 0 ? (
          <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.enrollmentOversight.disputesEmpty')}
          </p>
        ) : (
          enrollmentDisputes.map((d) => {
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
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong>{course?.title[locale] ?? d.courseSlug}</strong>
                    <Badge variant="neutral">
                      {t(`admin.enrollmentOversight.disputeCategories.${d.category}`)}
                    </Badge>
                    <Badge variant={d.status === 'resolved' ? 'success' : 'warning'}>{d.status}</Badge>
                  </div>
                  <p className="text-small" style={{ marginBlockStart: 6 }}>
                    {d.description}
                  </p>
                  {d.resolutionNote ? (
                    <div className="text-caption" style={{ color: 'var(--success)', marginBlockStart: 4 }}>
                      {d.resolutionNote}
                    </div>
                  ) : null}
                </div>
                {d.status !== 'resolved' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setResolvingDisputeId(d.id);
                      setResolutionNote('');
                      setSuspendOnResolve(false);
                      setRefundConfirmed(false);
                    }}
                  >
                    {t('admin.enrollmentOversight.resolveBtn')}
                  </Button>
                ) : null}
              </div>
            );
          })
        )}
      </Card>

      {/* Immutable Audit Log */}
      <Card className="details-stack" style={{ gap: 10 }}>
        <h2 className="text-h3">{t('admin.enrollmentOversight.auditLogTitle')}</h2>
        {enrollmentAuditLog.slice(0, 12).map((ev) => (
          <div
            key={ev.id}
            style={{
              padding: 10,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span className="text-small" style={{ fontWeight: 700 }}>
                {ev.eventType}
              </span>{' '}
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                ({ev.actorRole}: {ev.actorId}) · {ev.enrollmentId}
              </span>
              {ev.reason ? (
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {ev.reason}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge variant="neutral">{ev.newStatus}</Badge>
              <span className="text-caption">{ev.timestamp[locale]}</span>
            </div>
          </div>
        ))}
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingId)}
        onClose={() => setRejectingId(null)}
        title={t('admin.enrollments.rejectModal.title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectingId(null)}>
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

      {/* Admin Override Modal */}
      <Modal
        isOpen={Boolean(overrideId)}
        onClose={() => setOverrideId(null)}
        title={t('admin.enrollmentOversight.overrideModalTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOverrideId(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!overrideReason.trim()}
              onClick={handleConfirmOverride}
            >
              {t('admin.common.save')}
            </Button>
          </>
        }
      >
        <div className="details-stack" style={{ gap: 12 }}>
          <Alert variant="info" title={t('admin.enrollmentOversight.overrideBtn')}>
            {t('admin.enrollmentOversight.overrideNote')}
          </Alert>
          <Select
            label={t('admin.enrollmentOversight.overrideStatusLabel')}
            value={overrideStatus}
            onChange={(e) => setOverrideStatus(e.target.value as EnrollmentRequestStatus)}
          >
            <option value="pending">{t('admin.statuses.pending')}</option>
            <option value="awaiting_payment">{t('admin.statuses.awaiting_payment')}</option>
            <option value="active">{t('admin.statuses.active')}</option>
            <option value="suspended">{t('admin.statuses.suspended')}</option>
            <option value="cancelled">{t('admin.statuses.cancelled')}</option>
            <option value="refunded">{t('admin.statuses.refunded')}</option>
          </Select>
          <Textarea
            label={t('admin.enrollmentOversight.overrideReasonLabel')}
            rows={3}
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Resolve Dispute Modal */}
      <Modal
        isOpen={Boolean(resolvingDisputeId)}
        onClose={() => setResolvingDisputeId(null)}
        title={t('admin.enrollmentOversight.resolveModalTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolvingDisputeId(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!resolutionNote.trim()}
              onClick={handleConfirmResolve}
            >
              {t('admin.enrollmentOversight.resolveBtn')}
            </Button>
          </>
        }
      >
        <div className="details-stack" style={{ gap: 12 }}>
          <Textarea
            label={t('admin.enrollmentOversight.resolutionNoteLabel')}
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={suspendOnResolve}
              onChange={(e) => setSuspendOnResolve(e.target.checked)}
            />
            <span className="text-small">{t('admin.enrollmentOversight.suspendAccessCheck')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={refundConfirmed}
              onChange={(e) => setRefundConfirmed(e.target.checked)}
            />
            <span className="text-small">{t('admin.enrollmentOversight.refundConfirmedCheck')}</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
