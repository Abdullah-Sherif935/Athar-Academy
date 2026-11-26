import { AlertTriangle, ClipboardList, Mail, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Modal, Select, Textarea } from '../../../components/ui';
import type { DisputeCategory } from '../../../data/mock/admin';
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function EnrollmentRequestsPage() {
  const { t, locale } = useI18n();
  const { enrollmentRequests, myDisputes, submitDispute } = useStudentDemo();
  const { courses, disciplines, instructors } = usePlatformDemo();

  const [disputeTargetId, setDisputeTargetId] = useState<string | null>(null);
  const [disputeCategory, setDisputeCategory] = useState<DisputeCategory>('access_not_granted');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeToast, setDisputeToast] = useState(false);

  const handleSubmitDispute = () => {
    if (!disputeTargetId || !disputeDesc.trim()) return;
    submitDispute(disputeTargetId, disputeCategory, disputeDesc);
    setDisputeTargetId(null);
    setDisputeDesc('');
    setDisputeToast(true);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.enrollmentRequests.title')}
        subtitle={t('student.enrollmentRequests.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.enrollmentRequests.title') },
        ]}
        action={
          <Link to="/student/explore-courses" className="ui-btn ui-btn--primary ui-btn--sm">
            {t('student.explore.title')}
          </Link>
        }
      />

      <Alert variant="info" title={t('instructor.selfService.enrollments.businessNoticeTitle')}>
        {t('instructor.selfService.enrollments.businessNoticeBody')}
      </Alert>

      {disputeToast ? (
        <Alert variant="success" title={t('instructor.selfService.enrollments.disputeSubmitted')} />
      ) : null}

      {enrollmentRequests.length > 0 ? (
        <div className="details-stack" style={{ gap: 14 }}>
          {enrollmentRequests.map((req) => {
            const course = courses.find((c) => c.slug === req.courseSlug);
            if (!course) return null;
            const discipline = disciplines.find((d) => d.slug === course.disciplineSlug);
            const courseInstructors = course.instructorSlugs
              .map((slug) => instructors.find((i) => i.slug === slug))
              .filter(Boolean);
            const reqDisputes = myDisputes.filter((d) => d.enrollmentId === req.id);

            return (
              <Card key={req.id} className="feature-card" style={{ gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div className="section-header__meta">
                    <EnrollmentStatusBadge status={req.status} />
                    <Badge variant={req.paymentStatus === 'confirmed' ? 'success' : 'neutral'}>
                      {t(`admin.paymentStatuses.${req.paymentStatus}`)}
                    </Badge>
                    <Badge variant="brand">
                      {req.isFreeSnapshot
                        ? t('admin.paymentStatuses.not_required')
                        : `${req.priceSnapshot.toLocaleString()} ${req.currency}`}
                    </Badge>
                    {discipline ? <Badge variant="neutral">{discipline.name[locale]}</Badge> : null}
                  </div>
                  <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    {t('student.enrollmentRequests.requestDate')} {req.requestedAt[locale]}
                  </span>
                </div>

                <div>
                  <h2 className="text-h3">{course.title[locale]}</h2>
                  <p className="text-caption" style={{ marginBlockStart: 4 }}>
                    {courseInstructors.map((i) => i?.name[locale]).join(' · ')}
                  </p>
                </div>

                {/* Awaiting Payment Instructions */}
                {req.status === 'awaiting_payment' ? (
                  <Alert variant="info" title={t('admin.statuses.awaiting_payment')}>
                    <div className="details-stack" style={{ gap: 8 }}>
                      <span>{course.pricing.paymentInstructions[locale]}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {course.pricing.paymentMethods.map((pm) => (
                          <Badge key={pm} variant="neutral">
                            {t(`admin.paymentMethods.${pm}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Alert>
                ) : null}

                {req.status === 'suspended' ? (
                  <Alert variant="error" title={t('admin.statuses.suspended')}>
                    {req.reviewNote?.[locale] ?? t('admin.statuses.suspended')}
                  </Alert>
                ) : req.reviewNote ? (
                  <Alert
                    variant={
                      req.status === 'active' || req.status === 'approved'
                        ? 'success'
                        : req.status === 'rejected'
                          ? 'error'
                          : 'info'
                    }
                    title={t(`admin.statuses.${req.status}`)}
                  >
                    {req.reviewNote[locale]}
                  </Alert>
                ) : null}

                {reqDisputes.map((d) => (
                  <Alert
                    key={d.id}
                    variant={d.status === 'resolved' ? 'success' : 'warning'}
                    title={`${t('admin.enrollmentOversight.disputesTitle')} (${d.status})`}
                  >
                    <div>{d.description}</div>
                    {d.resolutionNote ? (
                      <div style={{ marginBlockStart: 6, fontWeight: 600 }}>
                        {d.resolutionNote}
                      </div>
                    ) : null}
                  </Alert>
                ))}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(req.status === 'active' || req.status === 'approved') ? (
                    <Link
                      to={`/student/courses/${course.slug}`}
                      className="ui-btn ui-btn--primary ui-btn--sm"
                    >
                      <Play size={14} aria-hidden="true" /> {t('student.explore.actions.openCourse')}
                    </Link>
                  ) : null}
                  <Link to="/student/messages" className="ui-btn ui-btn--secondary ui-btn--sm">
                    <Mail size={14} aria-hidden="true" /> {t('student.nav.messages')}
                  </Link>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => {
                      setDisputeTargetId(req.id);
                      setDisputeDesc('');
                      setDisputeToast(false);
                    }}
                  >
                    <AlertTriangle size={14} aria-hidden="true" />{' '}
                    {t('instructor.selfService.enrollments.reportDisputeBtn')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardList size={24} />}
          title={t('student.enrollmentRequests.emptyTitle')}
          description={t('student.enrollmentRequests.emptyDesc')}
          action={
            <Link to="/student/explore-courses" className="ui-btn ui-btn--primary ui-btn--md">
              {t('student.explore.title')}
            </Link>
          }
        />
      )}

      {/* Report Dispute Modal */}
      <Modal
        isOpen={Boolean(disputeTargetId)}
        onClose={() => setDisputeTargetId(null)}
        title={t('instructor.selfService.enrollments.disputeModalTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDisputeTargetId(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!disputeDesc.trim()}
              onClick={handleSubmitDispute}
            >
              {t('instructor.selfService.enrollments.disputeSubmitBtn')}
            </Button>
          </>
        }
      >
        <div className="details-stack" style={{ gap: 12 }}>
          <Select
            label={t('instructor.selfService.enrollments.disputeCategoryLabel')}
            value={disputeCategory}
            onChange={(e) => setDisputeCategory(e.target.value as DisputeCategory)}
          >
            <option value="access_not_granted">
              {t('admin.enrollmentOversight.disputeCategories.access_not_granted')}
            </option>
            <option value="instructor_no_response">
              {t('admin.enrollmentOversight.disputeCategories.instructor_no_response')}
            </option>
            <option value="course_mismatch">
              {t('admin.enrollmentOversight.disputeCategories.course_mismatch')}
            </option>
            <option value="other">
              {t('admin.enrollmentOversight.disputeCategories.other')}
            </option>
          </Select>
          <Textarea
            label={t('instructor.selfService.enrollments.disputeDescLabel')}
            rows={3}
            value={disputeDesc}
            onChange={(e) => setDisputeDesc(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
