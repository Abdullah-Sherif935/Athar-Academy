import { Check, Copy, Plus, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Textarea,
} from '../../../components/ui';
import {
  adminUpdateRealInstructor,
  fetchRealInstructors,
  invokeAdminCreateInstructor,
  type CreateRealInstructorResult,
  type RealAccountStatus,
  type RealInstructorRecord,
} from '../../../services/instructorOnboardingService';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminInstructorsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const isAr = locale === 'ar';

  const [instructors, setInstructors] = useState<RealInstructorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RealAccountStatus>('all');
  const [inviteOpen, setInviteOpen] = useState(false);

  // Add Instructor form fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [specializationsText, setSpecializationsText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [accountStatus, setAccountStatus] = useState<'active' | 'inactive' | 'suspended'>('active');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<CreateRealInstructorResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { instructors: rows, error } = await fetchRealInstructors();
    if (error) {
      setLoadError(error);
    } else {
      setInstructors(rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      void loadData();
    } else {
      setLoading(false);
    }
  }, [loadData, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return instructors.filter((inst) => {
      if (statusFilter !== 'all' && inst.accountStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        inst.fullName.ar.toLowerCase().includes(q) ||
        inst.fullName.en.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q) ||
        inst.title.ar.toLowerCase().includes(q) ||
        inst.title.en.toLowerCase().includes(q)
      );
    });
  }, [instructors, query, statusFilter]);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setEmail('');
    setTitleAr('');
    setTitleEn('');
    setBioAr('');
    setBioEn('');
    setSpecializationsText('');
    setAvatarUrl('');
    setAccountStatus('active');
    setFormError(null);
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if ((!nameAr.trim() && !nameEn.trim()) || !email.trim()) {
      setFormError(
        isAr
          ? 'يرجى إدخال الاسم والبريد الإلكتروني الصحيح.'
          : 'Please enter the instructor name and a valid email address.',
      );
      return;
    }

    setSubmitting(true);
    const specializations = specializationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await invokeAdminCreateInstructor({
      fullNameAr: nameAr.trim() || nameEn.trim(),
      fullNameEn: nameEn.trim() || nameAr.trim(),
      email: email.trim(),
      titleAr: titleAr.trim() || undefined,
      titleEn: titleEn.trim() || undefined,
      bioAr: bioAr.trim() || undefined,
      bioEn: bioEn.trim() || undefined,
      specializations,
      avatarUrl: avatarUrl.trim() || undefined,
      accountStatus,
    });

    setSubmitting(false);

    if (!res.ok) {
      if (res.errorCode === 'EMAIL_ALREADY_EXISTS') {
        setFormError(
          isAr
            ? 'هذا البريد الإلكتروني مسجّل بالفعل في المنصة.'
            : 'An account with this email address already exists.',
        );
      } else {
        setFormError(res.errorMessage || (isAr ? 'تعذر إنشاء حساب المدرب.' : 'Failed to create instructor.'));
      }
      return;
    }

    setCreatedResult(res);
    setCopiedLink(false);
    resetForm();
    setInviteOpen(false);
    await loadData();
  };

  const handleStatusChange = async (userId: string, nextStatus: RealAccountStatus) => {
    setActionBusyId(userId);
    const { error } = await adminUpdateRealInstructor(userId, { accountStatus: nextStatus });
    if (error) {
      setLoadError(error.message);
    } else {
      await loadData();
    }
    setActionBusyId(null);
  };

  const handleCopySetupLink = async () => {
    if (!createdResult?.setupLink) return;
    try {
      await navigator.clipboard.writeText(createdResult.setupLink);
      setCopiedLink(true);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.instructors.title')}
        subtitle={t('admin.instructors.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.instructors') },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={15} aria-hidden="true" /> {isAr ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setInviteOpen(true);
              }}
            >
              <Plus size={16} aria-hidden="true" /> {t('admin.instructors.inviteBtn')}
            </Button>
          </div>
        }
      />

      {loadError ? (
        <Alert variant="error" title={isAr ? 'حدث خطأ أثناء تحميل المدربين' : 'Error Loading Instructors'}>
          {loadError}
        </Alert>
      ) : null}

      {createdResult?.ok ? (
        <Alert
          variant="success"
          title={
            isAr
              ? `تم إنشاء حساب المدرب بنجاح (${createdResult.email})`
              : `Instructor Account Created (${createdResult.email})`
          }
        >
          <div className="details-stack" style={{ gap: 10, marginBlockStart: 6 }}>
            <p className="text-small">
              {createdResult.deliveryMethod === 'email_invite'
                ? isAr
                  ? 'تم إرسال دعوة رسمية عبر البريد الإلكتروني. يمكنك أيضاً نسخ رابط الإعداد الآمن أدناه وإرساله للمدرب مباشرة:'
                  : 'An official invitation email was dispatched. You can also copy the secure one-time setup link below to share directly:'
                : isAr
                  ? 'تم إنشاء حساب المدرب في نظام المصادقة. انسخ رابط الإعداد الآمن أدناه وأرسله للمدرب لتعيين كلمة المرور والدخول:'
                  : 'The instructor Auth account was created. Copy the secure one-time setup link below and share it with the instructor to set their password:'}
            </p>
            {createdResult.setupLink ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Input
                  aria-label={isAr ? 'رابط إعداد الحساب' : 'Account Setup Link'}
                  value={createdResult.setupLink}
                  readOnly
                  dir="ltr"
                  style={{ flex: '1 1 280px' }}
                />
                <Button variant="secondary" size="sm" onClick={() => void handleCopySetupLink()}>
                  {copiedLink ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{' '}
                  {copiedLink
                    ? isAr
                      ? 'تم النسخ'
                      : 'Copied'
                    : isAr
                      ? 'نسخ رابط الإعداد'
                      : 'Copy Setup Link'}
                </Button>
              </div>
            ) : null}
          </div>
        </Alert>
      ) : null}

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
          <div style={{ flex: '0 1 190px' }}>
            <Select
              aria-label={t('admin.instructors.columns.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | RealAccountStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="active">{t('admin.statuses.active')}</option>
              <option value="inactive">{t('admin.statuses.inactive')}</option>
              <option value="suspended">{t('admin.statuses.suspended')}</option>
              <option value="revoked">{t('admin.statuses.revoked')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <p className="text-body" style={{ textAlign: 'center', paddingBlock: 24 }}>
            {isAr ? 'جارٍ تحميل قائمة المدربين من قاعدة البيانات...' : 'Loading real instructors from Supabase...'}
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title={
            instructors.length === 0
              ? isAr
                ? 'لا يوجد مدربون مسجّلون بعد'
                : 'No Instructors Onboarded Yet'
              : t('admin.common.noResults')
          }
          description={
            instructors.length === 0
              ? isAr
                ? 'ابدأ بإضافة أول مدرب حقيقي لمنصة أكاديمية أثر من زر "إضافة مدرب".'
                : 'Start by creating your first real instructor account using the Add Instructor button.'
              : t('admin.instructors.subtitle')
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.instructors.columns.instructor')}</th>
                <th>{t('admin.instructors.columns.email')}</th>
                <th>{t('admin.instructors.columns.assignedCourses')}</th>
                <th>{isAr ? 'حالة الدعوة' : 'Invitation'}</th>
                <th>{t('admin.instructors.columns.status')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => (
                <tr key={inst.userId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="student-avatar-pill__circle" aria-hidden="true">
                        {inst.initials}
                      </span>
                      <div>
                        <Link
                          to={`/admin/instructors/${inst.slug}`}
                          className="card-title-link"
                          style={{ fontWeight: 700 }}
                        >
                          {inst.fullName[locale]}
                        </Link>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                          {inst.title[locale]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <bdi className="ltr-inline">{inst.email}</bdi>
                  </td>
                  <td>
                    <Badge variant="brand">{inst.assignments.length}</Badge>
                  </td>
                  <td>
                    <Badge variant={inst.invitationStatus === 'active' ? 'success' : 'warning'}>
                      {inst.invitationStatus === 'active'
                        ? isAr
                          ? 'مُفعّل'
                          : 'Active'
                        : isAr
                          ? 'بانتظار الإعداد'
                          : 'Pending Setup'}
                    </Badge>
                  </td>
                  <td>
                    <AdminStatusBadge status={inst.accountStatus} />
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <Link
                        to={`/admin/instructors/${inst.slug}`}
                        className="ui-btn ui-btn--secondary ui-btn--sm"
                      >
                        {t('admin.common.viewDetails')}
                      </Link>
                      {inst.accountStatus !== 'active' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={actionBusyId === inst.userId}
                          onClick={() => void handleStatusChange(inst.userId, 'active')}
                        >
                          {t('admin.instructors.actions.activate')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="tertiary"
                          disabled={actionBusyId === inst.userId}
                          onClick={() => void handleStatusChange(inst.userId, 'suspended')}
                        >
                          {isAr ? 'تعليق' : 'Suspend'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={inviteOpen}
        onClose={() => !submitting && setInviteOpen(false)}
        title={t('admin.instructors.inviteModal.title')}
        footer={
          <>
            <Button variant="secondary" disabled={submitting} onClick={() => setInviteOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" disabled={submitting} onClick={handleCreateInstructor}>
              {submitting
                ? isAr
                  ? 'جارٍ إنشاء الحساب...'
                  : 'Creating Account...'
                : t('admin.instructors.inviteModal.submit')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateInstructor} className="details-stack" style={{ gap: 12 }}>
          {formError ? <Alert variant="error" title={formError} /> : null}
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
          <Input
            label={t('admin.instructors.inviteModal.email')}
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
            label={isAr ? 'نبذة تعريفية (عربي)' : 'Biography (Arabic)'}
            value={bioAr}
            onChange={(e) => setBioAr(e.target.value)}
            rows={2}
          />
          <Textarea
            label={isAr ? 'نبذة تعريفية (إنجليزي)' : 'Biography (English)'}
            value={bioEn}
            onChange={(e) => setBioEn(e.target.value)}
            rows={2}
          />
          <Input
            label={isAr ? 'التخصصات (مفصولة بفاصلة)' : 'Specializations (comma-separated)'}
            placeholder={isAr ? 'هندسة البرمجيات, React, TypeScript' : 'Software Engineering, React, TypeScript'}
            value={specializationsText}
            onChange={(e) => setSpecializationsText(e.target.value)}
          />
          <div className="grid-2">
            <Input
              label={isAr ? 'رابط الصورة الشخصية (اختياري)' : 'Profile Image URL (Optional)'}
              type="url"
              dir="ltr"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <Select
              label={t('admin.instructors.columns.status')}
              value={accountStatus}
              onChange={(e) =>
                setAccountStatus(e.target.value as 'active' | 'inactive' | 'suspended')
              }
            >
              <option value="active">{t('admin.statuses.active')}</option>
              <option value="inactive">{t('admin.statuses.inactive')}</option>
              <option value="suspended">{t('admin.statuses.suspended')}</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
