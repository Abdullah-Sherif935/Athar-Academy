import { FolderSearch, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Input, Textarea } from '../../../components/ui';
import {
  adminSetCourseInstructor,
  adminUpdateRealInstructor,
  fetchInstructorAuditEvents,
  fetchRealInstructors,
  type RealAccountStatus,
  type RealAdminAuditEvent,
  type RealInstructorRecord,
} from '../../../services/instructorOnboardingService';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminInstructorDetailsPage() {
  const { instructorId = '' } = useParams();
  const { t, locale } = useI18n();
  const { courses, getCourseDbId } = usePlatformDemo();
  const isAr = locale === 'ar';

  const [instructor, setInstructor] = useState<RealInstructorRecord | null>(null);
  const [auditEvents, setAuditEvents] = useState<RealAdminAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Editable profile fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [specializationsText, setSpecializationsText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const loadInstructor = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { instructors, error: fetchErr } = await fetchRealInstructors();
    if (fetchErr) {
      setError(fetchErr);
      setLoading(false);
      return;
    }
    const found =
      instructors.find((i) => i.slug === instructorId || i.userId === instructorId) ?? null;
    setInstructor(found);
    if (found) {
      setNameAr(found.fullName.ar);
      setNameEn(found.fullName.en);
      setTitleAr(found.title.ar);
      setTitleEn(found.title.en);
      setBioAr(found.biography.ar);
      setBioEn(found.biography.en);
      setSpecializationsText(found.expertise.map((e) => e[locale] || e.en).join(', '));
      setAvatarUrl(found.avatarUrl ?? '');
      const events = await fetchInstructorAuditEvents(found.userId);
      setAuditEvents(events);
    }
    setLoading(false);
  }, [instructorId, locale]);

  useEffect(() => {
    void loadInstructor();
  }, [loadInstructor]);

  if (loading) {
    return (
      <Card>
        <p className="text-body" style={{ textAlign: 'center', paddingBlock: 32 }}>
          {isAr ? 'جارٍ تحميل بيانات المدرب...' : 'Loading instructor details...'}
        </p>
      </Card>
    );
  }

  if (!instructor) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('admin.instructors.notFound')}
        description={t('admin.instructors.subtitle')}
        action={
          <Link to="/admin/instructors" className="ui-btn ui-btn--primary ui-btn--md">
            {t('admin.nav.instructors')}
          </Link>
        }
      />
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSavedMsg(null);

    const expertise = specializationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ ar: s, en: s }));

    const { error: updErr } = await adminUpdateRealInstructor(instructor.userId, {
      fullNameAr: nameAr.trim(),
      fullNameEn: nameEn.trim(),
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      shortBioAr: bioAr.trim(),
      shortBioEn: bioEn.trim(),
      biographyAr: bioAr.trim(),
      biographyEn: bioEn.trim(),
      expertise,
      avatarUrl: avatarUrl.trim(),
    });

    setBusy(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setSavedMsg(isAr ? 'تم حفظ تعديلات ملف المدرب في قاعدة البيانات.' : 'Instructor profile saved to Supabase.');
    await loadInstructor();
  };

  const handleSetStatus = async (status: RealAccountStatus) => {
    setBusy(true);
    setError(null);
    setSavedMsg(null);
    const { error: updErr } = await adminUpdateRealInstructor(instructor.userId, {
      accountStatus: status,
    });
    setBusy(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setSavedMsg(isAr ? 'تم تحديث حالة حساب المدرب.' : 'Instructor account status updated.');
    await loadInstructor();
  };

  const handleCourseAction = async (
    courseSlug: string,
    action: 'assign' | 'remove' | 'set_lead' | 'set_co' | 'set_payment_permission',
    canConfirmPayments = false,
  ) => {
    const courseDbId = getCourseDbId(courseSlug);
    if (!courseDbId) return;
    setBusy(true);
    setError(null);
    setSavedMsg(null);
    const { error: actErr } = await adminSetCourseInstructor(
      courseDbId,
      instructor.userId,
      action,
      canConfirmPayments,
    );
    setBusy(false);
    if (actErr) {
      setError(actErr.message);
      return;
    }
    setSavedMsg(isAr ? 'تم تحديث تعيينات وصلاحيات الدورة.' : 'Course assignment & permissions updated.');
    await loadInstructor();
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={instructor.fullName[locale]}
        subtitle={instructor.title[locale]}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.instructors'), to: '/admin/instructors' },
          { label: instructor.fullName[locale] },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant={instructor.invitationStatus === 'active' ? 'success' : 'warning'}>
              {instructor.invitationStatus === 'active'
                ? isAr
                  ? 'الدعوة: مُفعّل'
                  : 'Invite: Active'
                : isAr
                  ? 'الدعوة: بانتظار الإعداد'
                  : 'Invite: Pending'}
            </Badge>
            <AdminStatusBadge status={instructor.accountStatus} />
          </div>
        }
      />

      {error ? <Alert variant="error" title={error} /> : null}
      {savedMsg ? <Alert variant="success" title={savedMsg} /> : null}

      <div className="details-layout">
        <div className="details-stack">
          {/* Course Assignments, Lead/Co-Instructor & Payment Confirmation Permissions */}
          <Card className="details-stack" style={{ gap: 14 }}>
            <div>
              <h2 className="text-h3">{t('admin.instructors.assignedCoursesTitle')}</h2>
              <p className="text-small" style={{ color: 'var(--text-secondary)', marginBlockStart: 4 }}>
                {isAr
                  ? 'قم بتعيين الدورات وتحديد دور المدرب (رئيسي أو مشارك) وصلاحية تأكيد الدفع المباشر.'
                  : 'Assign courses, designate Lead vs Co-Instructor, and control direct payment confirmation permissions.'}
              </p>
            </div>

            <div className="details-stack" style={{ gap: 10 }}>
              {courses.map((course) => {
                const assignment = instructor.assignments.find((a) => a.courseSlug === course.slug);
                const assigned = Boolean(assignment);
                const isLead = assignment?.role === 'lead';
                const canConfirm = Boolean(assignment?.canConfirmPayments);

                return (
                  <div
                    key={course.slug}
                    className="admin-checkbox-card"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={assigned}
                        disabled={busy}
                        onChange={() =>
                          void handleCourseAction(course.slug, assigned ? 'remove' : 'assign')
                        }
                      />
                      <div>
                        <div className="text-small" style={{ fontWeight: 700 }}>
                          {course.title[locale]}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                          <bdi className="ltr-inline">{course.code}</bdi> ·{' '}
                          {t(`admin.statuses.${course.status}`)}
                        </div>
                      </div>
                    </label>

                    {assigned ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Badge variant={isLead ? 'brand' : 'neutral'}>
                          {isLead
                            ? isAr
                              ? 'مدرب رئيسي'
                              : 'Lead Instructor'
                            : isAr
                              ? 'مدرب مشارك'
                              : 'Co-Instructor'}
                        </Badge>
                        {!isLead ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => void handleCourseAction(course.slug, 'set_lead', true)}
                          >
                            {isAr ? 'تعيين كمدرب رئيسي' : 'Make Lead'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="tertiary"
                            disabled={busy}
                            onClick={() => void handleCourseAction(course.slug, 'set_co', false)}
                          >
                            {isAr ? 'تحويل لمشارك' : 'Set Co-Instructor'}
                          </Button>
                        )}
                        <label
                          className="text-caption"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            checked={canConfirm}
                            disabled={busy || isLead}
                            onChange={(e) =>
                              void handleCourseAction(
                                course.slug,
                                'set_payment_permission',
                                e.target.checked,
                              )
                            }
                          />
                          <ShieldCheck size={14} aria-hidden="true" />
                          {isAr ? 'تأكيد الدفع' : 'Can Confirm Payments'}
                        </label>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Edit Instructor Profile */}
          <Card>
            <form onSubmit={handleSaveProfile} className="details-stack" style={{ gap: 12 }}>
              <h2 className="text-h3">{t('admin.instructors.editProfileTitle')}</h2>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                {t('admin.instructors.inviteModal.email')}:{' '}
                <strong className="ltr-inline">{instructor.email}</strong>
              </div>
              <div className="grid-2">
                <Input
                  label={t('admin.instructors.inviteModal.nameAr')}
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                />
                <Input
                  label={t('admin.instructors.inviteModal.nameEn')}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                />
              </div>
              <div className="grid-2">
                <Input
                  label={t('admin.instructors.inviteModal.titleAr')}
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                />
                <Input
                  label={t('admin.instructors.inviteModal.titleEn')}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
              </div>
              <Textarea
                label={isAr ? 'النبذة التعريفية (عربي)' : 'Biography (Arabic)'}
                value={bioAr}
                onChange={(e) => setBioAr(e.target.value)}
                rows={3}
              />
              <Textarea
                label={isAr ? 'النبذة التعريفية (إنجليزي)' : 'Biography (English)'}
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                rows={3}
              />
              <Input
                label={isAr ? 'التخصصات (مفصولة بفاصلة)' : 'Specializations (comma-separated)'}
                value={specializationsText}
                onChange={(e) => setSpecializationsText(e.target.value)}
              />
              <Input
                label={isAr ? 'رابط الصورة الشخصية' : 'Profile Image URL'}
                type="url"
                dir="ltr"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <div>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : t('admin.common.save')}
                </Button>
              </div>
            </form>
          </Card>

          {/* Operational Audit Trail */}
          <Card className="details-stack" style={{ gap: 10 }}>
            <h2 className="text-h3">{isAr ? 'سجل التدقيق والنشاط التشغيلي' : 'Operational Audit Activity'}</h2>
            {auditEvents.length === 0 ? (
              <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'لا توجد أحداث مسجلة بعد.' : 'No audit events recorded yet.'}
              </p>
            ) : (
              <ul className="benefit-list">
                {auditEvents.map((ev) => (
                  <li key={ev.id} className="benefit-list__item" style={{ justifyContent: 'space-between' }}>
                    <span className="text-small" style={{ fontWeight: 600 }}>
                      {ev.actionType}
                    </span>
                    <span className="text-caption ltr-inline" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('admin.students.accountActionsTitle')}</h2>
            <Button
              variant={instructor.accountStatus === 'active' ? 'secondary' : 'primary'}
              disabled={busy || instructor.accountStatus === 'active'}
              onClick={() => void handleSetStatus('active')}
            >
              {t('admin.instructors.actions.activate')}
            </Button>
            <Button
              variant="secondary"
              disabled={busy || instructor.accountStatus === 'suspended'}
              onClick={() => void handleSetStatus('suspended')}
            >
              {isAr ? 'تعليق الوصول' : 'Suspend Access'}
            </Button>
            <Button
              variant="secondary"
              disabled={busy || instructor.accountStatus === 'inactive'}
              onClick={() => void handleSetStatus('inactive')}
            >
              {t('admin.instructors.actions.deactivate')}
            </Button>
            <Button
              variant="destructive"
              disabled={busy || instructor.accountStatus === 'revoked'}
              onClick={() => void handleSetStatus('revoked')}
            >
              {t('admin.instructors.actions.revoke')}
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
