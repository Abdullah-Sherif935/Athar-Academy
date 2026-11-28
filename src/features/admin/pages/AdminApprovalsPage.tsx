import { CheckCircle2, Eye, FileText, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { YouTubeVideoPreview } from '../../../components/shared/YouTubeVideoPreview';
import { Alert, Badge, Button, Card, Modal, Textarea } from '../../../components/ui';
import type { PlatformLesson } from '../../../data/mock/admin';
import {
  adminApproveSubmittedCourse,
  adminRejectSubmittedCourse,
  fetchPendingCoursesForAdmin,
  type PendingAdminCourseReview,
} from '../../../services/courseWorkflowService';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminApprovalsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const isAr = locale === 'ar';
  const {
    courses,
    courseProposals,
    instructors,
    settings,
    approvalHistory,
    refreshLiveCatalog,
    approveCourseSubmission,
    rejectCourseSubmission,
    approveCourseProposal,
    rejectCourseProposal,
    approveLessonSubmission,
    rejectLessonSubmission,
  } = usePlatformDemo();

  const [realPendingCourses, setRealPendingCourses] = useState<PendingAdminCourseReview[]>([]);
  const [loadingReal, setLoadingReal] = useState(false);
  const [realActionBusyId, setRealActionBusyId] = useState<string | null>(null);
  const [realFeedback, setRealFeedback] = useState<string | null>(null);
  const [realError, setRealError] = useState<string | null>(null);
  const [inspectCourse, setInspectCourse] = useState<PendingAdminCourseReview | null>(null);
  const [rejectRealCourse, setRejectRealCourse] = useState<PendingAdminCourseReview | null>(null);
  const [rejectRealReason, setRejectRealReason] = useState('');

  const loadRealPending = useCallback(async () => {
    if (!user) return;
    setLoadingReal(true);
    const { courses: rows, error } = await fetchPendingCoursesForAdmin();
    if (error) {
      setRealError(error);
    } else {
      setRealPendingCourses(rows);
    }
    setLoadingReal(false);
  }, [user]);

  useEffect(() => {
    void loadRealPending();
  }, [loadRealPending]);

  const handleApproveRealCourse = async (courseId: string, publishImmediately: boolean) => {
    setRealActionBusyId(courseId);
    setRealError(null);
    setRealFeedback(null);
    const { status, error } = await adminApproveSubmittedCourse(courseId, publishImmediately);
    setRealActionBusyId(null);
    if (error) {
      setRealError(error);
      return;
    }
    setInspectCourse(null);
    setRealFeedback(
      status === 'published'
        ? isAr
          ? 'تم اعتماد الدورة ونشرها بنجاح في قاعدة البيانات.'
          : 'Course approved and published in Supabase.'
        : isAr
          ? 'تم اعتماد الدورة بنجاح وأصبحت جاهزة للنشر.'
          : 'Course approved in Supabase and ready for publishing.',
    );
    await Promise.all([loadRealPending(), refreshLiveCatalog()]);
  };

  const handleRejectRealCourse = async () => {
    if (!rejectRealCourse) return;
    setRealActionBusyId(rejectRealCourse.id);
    setRealError(null);
    setRealFeedback(null);
    const { error } = await adminRejectSubmittedCourse(rejectRealCourse.id, rejectRealReason);
    setRealActionBusyId(null);
    if (error) {
      setRealError(error);
      return;
    }
    setRejectRealCourse(null);
    setRejectRealReason('');
    setInspectCourse(null);
    setRealFeedback(
      isAr ? 'تم رفض الدورة وإرسال الملاحظة للمدرب.' : 'Course rejected and feedback sent to instructor.',
    );
    await Promise.all([loadRealPending(), refreshLiveCatalog()]);
  };

  const [rejectTarget, setRejectTarget] = useState<
    | { type: 'course'; courseSlug: string }
    | { type: 'proposal'; proposalId: string }
    | { type: 'lesson'; courseSlug: string; lessonId: string }
    | null
  >(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewLesson, setPreviewLesson] = useState<{
    courseTitle: string;
    title: string;
    description: string;
    durationMinutes: number;
    videoProvider: string;
    videoSourceId: string;
    isRevision: boolean;
  } | null>(null);

  const pendingProposals = courseProposals.filter((p) => p.status === 'pending_approval');
  const pendingCourses = courses.filter((c) => c.pendingApproval);
  const pendingLessons = courses.flatMap((c) =>
    c.modules.flatMap((m) =>
      m.lessons
        .filter(
          (l) =>
            l.status === 'pending_approval' ||
            l.pendingRevision?.status === 'pending_approval',
        )
        .map((lesson: PlatformLesson) => {
          const isRevision = lesson.pendingRevision?.status === 'pending_approval';
          const effectiveTitle = isRevision ? lesson.pendingRevision!.title : lesson.title;
          const effectiveDesc = isRevision ? lesson.pendingRevision!.description : lesson.description;
          const effectiveDuration = isRevision
            ? lesson.pendingRevision!.durationMinutes
            : lesson.durationMinutes;
          const effectiveProvider = isRevision
            ? lesson.pendingRevision!.videoProvider
            : lesson.videoProvider;
          const effectiveSourceId = isRevision
            ? lesson.pendingRevision!.videoSourceId
            : lesson.videoSourceId;
          return {
            course: c,
            module: m,
            lesson,
            isRevision,
            effectiveTitle,
            effectiveDesc,
            effectiveDuration,
            effectiveProvider,
            effectiveSourceId,
          };
        }),
    ),
  );

  const handleConfirmReject = () => {
    if (!rejectTarget) return;
    if (rejectTarget.type === 'course') {
      rejectCourseSubmission(rejectTarget.courseSlug, rejectReason);
    } else if (rejectTarget.type === 'proposal') {
      rejectCourseProposal(rejectTarget.proposalId, rejectReason);
    } else {
      rejectLessonSubmission(rejectTarget.courseSlug, rejectTarget.lessonId, rejectReason);
    }
    setRejectTarget(null);
    setRejectReason('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.approvals.title')}
        subtitle={t('admin.approvals.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.approvals') },
        ]}
        action={
          <Link to="/admin/settings" className="ui-btn ui-btn--secondary ui-btn--sm">
            {t('admin.approvals.goToSettings')}
          </Link>
        }
      />

      <Alert
        variant={settings.requireLessonApproval ? 'info' : 'warning'}
        title={t('admin.settings.requireLessonApproval')}
      >
        {settings.requireLessonApproval
          ? t('admin.approvals.policyBannerOn')
          : t('admin.approvals.policyBannerOff')}
      </Alert>

      {/* Real Supabase Submitted Courses Pending Approval */}
      {user ? (
        <Card className="details-stack" style={{ gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="text-h3">
                {isAr ? 'دورات مرسلة من المدربين بانتظار الاعتماد' : 'Submitted Courses Pending Approval'}
              </h2>
              <Badge variant={realPendingCourses.length > 0 ? 'warning' : 'neutral'}>
                {realPendingCourses.length}
              </Badge>
            </div>
            <Button size="sm" variant="secondary" disabled={loadingReal} onClick={() => void loadRealPending()}>
              <RefreshCw size={14} aria-hidden="true" /> {isAr ? 'تحديث' : 'Refresh'}
            </Button>
          </div>

          {realError ? <Alert variant="error" title={realError} /> : null}
          {realFeedback ? <Alert variant="success" title={realFeedback} /> : null}

          {loadingReal ? (
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {isAr ? 'جارٍ تحميل الدورات المرسلة...' : 'Loading submitted courses from Supabase...'}
            </p>
          ) : realPendingCourses.length === 0 ? (
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {isAr ? 'لا توجد دورات جديدة بانتظار المراجعة حالياً.' : 'No submitted courses pending review right now.'}
            </p>
          ) : (
            realPendingCourses.map((rc) => {
              const totalLessons = rc.modules.reduce((acc, m) => acc + m.lessons.length, 0);
              return (
                <div
                  key={rc.id}
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="text-small" style={{ fontWeight: 700 }}>
                        {rc.title[locale]}
                      </span>
                      <Badge variant="neutral">
                        <bdi className="ltr-inline">{rc.code}</bdi>
                      </Badge>
                      <Badge variant="brand">
                        {rc.pricing.isFree
                          ? isAr
                            ? 'مجانية'
                            : 'Free'
                          : `${rc.pricing.priceAmount.toLocaleString()} ${rc.pricing.currency}`}
                      </Badge>
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-secondary)', marginBlockStart: 4 }}>
                      {rc.leadInstructorName[locale]} (<bdi className="ltr-inline">{rc.leadInstructorEmail}</bdi>) ·{' '}
                      {rc.modules.length} {isAr ? 'وحدات' : 'modules'} · {totalLessons}{' '}
                      {isAr ? 'دروس' : 'lessons'}
                    </div>
                  </div>
                  <div className="admin-table__actions">
                    <Button size="sm" variant="tertiary" onClick={() => setInspectCourse(rc)}>
                      <Eye size={14} aria-hidden="true" /> {isAr ? 'مراجعة التفاصيل' : 'Inspect'}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={realActionBusyId === rc.id}
                      onClick={() => void handleApproveRealCourse(rc.id, false)}
                    >
                      <CheckCircle2 size={14} aria-hidden="true" /> {t('admin.common.approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={realActionBusyId === rc.id}
                      onClick={() => {
                        setRejectRealCourse(rc);
                        setRejectRealReason('');
                      }}
                    >
                      {t('admin.common.reject')}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      ) : null}

      {/* Full Course Inspection Modal for Super Admin */}
      <Modal
        isOpen={Boolean(inspectCourse)}
        onClose={() => setInspectCourse(null)}
        title={inspectCourse ? inspectCourse.title[locale] : ''}
        footer={
          inspectCourse ? (
            <>
              <Button variant="secondary" onClick={() => setInspectCourse(null)}>
                {t('admin.common.cancel')}
              </Button>
              <Button
                variant="secondary"
                disabled={realActionBusyId === inspectCourse.id}
                onClick={() => {
                  setRejectRealCourse(inspectCourse);
                  setRejectRealReason('');
                }}
              >
                {t('admin.common.reject')}
              </Button>
              <Button
                variant="primary"
                disabled={realActionBusyId === inspectCourse.id}
                onClick={() => void handleApproveRealCourse(inspectCourse.id, false)}
              >
                {isAr ? 'اعتماد (جاهزة للنشر)' : 'Approve (Ready to Publish)'}
              </Button>
            </>
          ) : undefined
        }
      >
        {inspectCourse ? (
          <div className="details-stack" style={{ gap: 12 }}>
            <p className="text-small">{inspectCourse.fullDescription[locale]}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge variant="brand">
                {inspectCourse.pricing.isFree
                  ? isAr
                    ? 'مجانية'
                    : 'Free'
                  : `${inspectCourse.pricing.priceAmount} ${inspectCourse.pricing.currency}`}
              </Badge>
              <Badge variant="neutral">{inspectCourse.level}</Badge>
              <Badge variant="neutral">{inspectCourse.duration[locale]}</Badge>
            </div>
            <Alert variant="info" title={isAr ? 'تعليمات الدفع المباشر' : 'Direct Payment Instructions'}>
              {isAr
                ? inspectCourse.pricing.paymentInstructionsAr
                : inspectCourse.pricing.paymentInstructionsEn}
            </Alert>
            {inspectCourse.modules.map((m) => (
              <Card key={m.id} className="details-stack" style={{ gap: 8 }}>
                <div className="text-small" style={{ fontWeight: 700 }}>
                  {m.title[locale]}
                </div>
                {m.lessons.map((l) => (
                  <div key={l.id} className="details-stack" style={{ gap: 6, paddingInlineStart: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span className="text-small">{l.title[locale]}</span>
                      <Badge variant="neutral">
                        {l.lessonType} · {l.durationMinutes}m
                      </Badge>
                    </div>
                    {l.videoSourceId ? (
                      <YouTubeVideoPreview videoId={l.videoSourceId} title={l.title[locale]} />
                    ) : null}
                    {l.resources.length > 0 ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {l.resources.map((r) => (
                          <Badge key={r.id} variant="teal">
                            <FileText size={11} aria-hidden="true" /> {r.title[locale]} ({r.type})
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </Card>
            ))}
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(rejectRealCourse)}
        onClose={() => setRejectRealCourse(null)}
        title={isAr ? 'رفض الدورة المرسلة' : 'Reject Submitted Course'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectRealCourse(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectRealCourse || realActionBusyId === rejectRealCourse.id}
              onClick={() => void handleRejectRealCourse()}
            >
              {t('admin.common.reject')}
            </Button>
          </>
        }
      >
        <Textarea
          label={isAr ? 'سبب الرفض / ملاحظات للمدرب' : 'Rejection Reason / Instructor Feedback'}
          rows={3}
          value={rejectRealReason}
          onChange={(e) => setRejectRealReason(e.target.value)}
        />
      </Modal>

      {/* Pending Instructor Course Proposals */}
      <Card className="details-stack" style={{ gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h3">{t('admin.approvals.pendingProposalsTitle')}</h2>
          <Badge variant={pendingProposals.length > 0 ? 'warning' : 'neutral'}>
            {pendingProposals.length}
          </Badge>
        </div>

        {pendingProposals.length === 0 ? (
          <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.approvals.emptyProposals')}
          </p>
        ) : (
          pendingProposals.map((prop) => {
            const inst = instructors.find((i) => i.slug === prop.proposingInstructorSlug);
            return (
              <div
                key={prop.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div className="text-small" style={{ fontWeight: 700 }}>
                    {prop.title[locale]}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    {inst?.name[locale] ?? prop.proposingInstructorSlug} · {prop.shortDescription[locale]}
                  </div>
                </div>
                <div className="admin-table__actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => approveCourseProposal(prop.id)}
                  >
                    {t('admin.common.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setRejectTarget({ type: 'proposal', proposalId: prop.id });
                      setRejectReason('');
                    }}
                  >
                    {t('admin.common.reject')}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Pending Lesson Approvals & Revisions */}
      <Card className="details-stack" style={{ gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h3">{t('admin.approvals.pendingLessonsTitle')}</h2>
          <Badge variant={pendingLessons.length > 0 ? 'warning' : 'neutral'}>
            {pendingLessons.length}
          </Badge>
        </div>

        {pendingLessons.length === 0 ? (
          <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.approvals.emptyLessons')}
          </p>
        ) : (
          pendingLessons.map(
            ({
              course,
              module,
              lesson,
              isRevision,
              effectiveTitle,
              effectiveDesc,
              effectiveDuration,
              effectiveProvider,
              effectiveSourceId,
            }) => (
              <div
                key={`${course.slug}:${lesson.id}`}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="text-small" style={{ fontWeight: 700 }}>
                      {effectiveTitle[locale]}
                    </span>
                    {isRevision ? (
                      <Badge variant="brand">{t('admin.approvals.revisionBadge')}</Badge>
                    ) : null}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    {course.title[locale]} · {module.title[locale]}
                  </div>
                </div>
                <div className="admin-table__actions">
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() =>
                      setPreviewLesson({
                        courseTitle: course.title[locale],
                        title: effectiveTitle[locale],
                        description: effectiveDesc[locale],
                        durationMinutes: effectiveDuration,
                        videoProvider: effectiveProvider,
                        videoSourceId: effectiveSourceId,
                        isRevision,
                      })
                    }
                  >
                    <Eye size={14} aria-hidden="true" /> {t('admin.approvals.previewBtn')}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => approveLessonSubmission(course.slug, lesson.id)}
                  >
                    {t('admin.common.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setRejectTarget({
                        type: 'lesson',
                        courseSlug: course.slug,
                        lessonId: lesson.id,
                      });
                      setRejectReason('');
                    }}
                  >
                    {t('admin.common.reject')}
                  </Button>
                </div>
              </div>
            ),
          )
        )}
      </Card>

      {/* Pending Course Approvals */}
      <Card className="details-stack" style={{ gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h3">{t('admin.approvals.pendingCoursesTitle')}</h2>
          <Badge variant={pendingCourses.length > 0 ? 'warning' : 'neutral'}>
            {pendingCourses.length}
          </Badge>
        </div>

        {pendingCourses.length === 0 ? (
          <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.approvals.emptyCourses')}
          </p>
        ) : (
          pendingCourses.map((course) => (
            <div
              key={course.slug}
              style={{
                padding: 12,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="text-small" style={{ fontWeight: 700 }}>
                  {course.title[locale]}
                </div>
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  <bdi className="ltr-inline">{course.code}</bdi> · {course.shortDescription[locale]}
                </div>
              </div>
              <div className="admin-table__actions">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => approveCourseSubmission(course.slug)}
                >
                  {t('admin.common.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setRejectTarget({ type: 'course', courseSlug: course.slug });
                    setRejectReason('');
                  }}
                >
                  {t('admin.common.reject')}
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Approval History */}
      <Card className="details-stack" style={{ gap: 12 }}>
        <h2 className="text-h3">{t('admin.approvals.historyTitle')}</h2>
        {approvalHistory.map((item) => (
          <div
            key={item.id}
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
              <div className="text-small" style={{ fontWeight: 600 }}>
                {item.title[locale]}
              </div>
              {item.reason ? (
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {item.reason[locale]}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                {item.decidedAt[locale]}
              </span>
              <AdminStatusBadge status={item.decision} />
            </div>
          </div>
        ))}
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title={t('admin.approvals.rejectModal.title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleConfirmReject}>
              {t('admin.approvals.rejectModal.confirm')}
            </Button>
          </>
        }
      >
        <Textarea
          label={t('admin.approvals.rejectModal.reasonLabel')}
          placeholder={t('admin.approvals.rejectModal.reasonPlaceholder')}
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Lesson Preview Modal */}
      <Modal
        isOpen={Boolean(previewLesson)}
        onClose={() => setPreviewLesson(null)}
        title={t('admin.approvals.previewModal.title')}
      >
        {previewLesson ? (
          <div className="details-stack" style={{ gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div className="text-h3">{previewLesson.title}</div>
              {previewLesson.isRevision ? (
                <Badge variant="brand">{t('admin.approvals.revisionBadge')}</Badge>
              ) : null}
            </div>
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {previewLesson.courseTitle}
            </p>
            <p className="text-body">{previewLesson.description}</p>
            <div className="meta-kv-list">
              <div className="meta-kv-row">
                <span>{t('admin.approvals.previewModal.duration')}</span>
                <span>
                  {t('common.minutesShort', { count: previewLesson.durationMinutes })}
                </span>
              </div>
              <div className="meta-kv-row">
                <span>{t('admin.approvals.previewModal.provider')}</span>
                <span>
                  <bdi className="ltr-inline">{previewLesson.videoProvider}</bdi>
                </span>
              </div>
              <div className="meta-kv-row">
                <span>{t('admin.approvals.previewModal.sourceId')}</span>
                <span>
                  <bdi className="ltr-inline">{previewLesson.videoSourceId}</bdi>
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
