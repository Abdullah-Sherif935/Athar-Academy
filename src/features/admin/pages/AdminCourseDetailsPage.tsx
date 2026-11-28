import { Archive, CheckCircle2, Download, EyeOff, FileText, FolderSearch, Globe, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Input, Select, Textarea } from '../../../components/ui';
import type { AdminCourseStatus } from '../../../data/mock/admin';
import { adminApproveSubmittedCourse } from '../../../services/courseWorkflowService';
import { dbUpdateCourse, getSignedResourceUrl } from '../../../services/lmsService';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminCourseDetailsPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const {
    courses,
    disciplines,
    instructors,
    getCourseDbId,
    refreshLiveCatalog,
    updateCourse,
    setCourseInstructors,
    setCourseLeadAndManagers,
    setCourseSuspended,
  } = usePlatformDemo();

  const course = courses.find((c) => c.slug === courseId);
  const [titleAr, setTitleAr] = useState(course?.title.ar ?? '');
  const [titleEn, setTitleEn] = useState(course?.title.en ?? '');
  const [descAr, setDescAr] = useState(course?.shortDescription.ar ?? '');
  const [descEn, setDescEn] = useState(course?.shortDescription.en ?? '');
  const [disciplineSlug, setDisciplineSlug] = useState(course?.disciplineSlug ?? '');
  const [status, setStatus] = useState<AdminCourseStatus>(course?.status ?? 'draft');
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionBanner, setActionBanner] = useState<{ variant: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!course) return;
    setTitleAr(course.title.ar);
    setTitleEn(course.title.en);
    setDescAr(course.shortDescription.ar);
    setDescEn(course.shortDescription.en);
    setDisciplineSlug(course.disciplineSlug);
    setStatus(course.status);
  }, [
    course?.slug,
    course?.status,
    course?.title.ar,
    course?.title.en,
    course?.shortDescription.ar,
    course?.shortDescription.en,
    course?.disciplineSlug,
    course,
  ]);

  if (!course) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('admin.courses.notFound')}
        description={t('admin.courses.subtitle')}
        action={
          <Link to="/admin/courses" className="ui-btn ui-btn--primary ui-btn--md">
            {t('admin.nav.courses')}
          </Link>
        }
      />
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourse(course.slug, {
      title: { ar: titleAr.trim() || course.title.ar, en: titleEn.trim() || course.title.en },
      shortDescription: {
        ar: descAr.trim() || course.shortDescription.ar,
        en: descEn.trim() || course.shortDescription.en,
      },
      disciplineSlug,
      status,
      pendingApproval: status === 'published' ? false : course.pendingApproval,
    });
    setSaved(true);
  };

  const toggleInstructor = (instSlug: string) => {
    const exists = course.instructorSlugs.includes(instSlug);
    const next = exists
      ? course.instructorSlugs.filter((s) => s !== instSlug)
      : [...course.instructorSlugs, instSlug];
    setCourseInstructors(course.slug, next);
  };

  const handleExplicitPublish = async () => {
    const dbId = getCourseDbId(course.slug);
    setPublishing(true);
    setActionBanner(null);
    if (dbId) {
      const { error } = await adminApproveSubmittedCourse(dbId, true);
      if (error) {
        setPublishing(false);
        setActionBanner({ variant: 'error', text: error });
        return;
      }
      await refreshLiveCatalog();
    } else {
      updateCourse(course.slug, { status: 'published', pendingApproval: false });
    }
    setStatus('published');
    setPublishing(false);
    setActionBanner({
      variant: 'success',
      text:
        locale === 'ar'
          ? 'تم نشر الدورة ودروسها بنجاح في الكتالوج العام.'
          : 'Course and its lessons have been published to the public catalog.',
    });
  };

  const handleStatusTransition = async (nextStatus: 'draft' | 'archived') => {
    const dbId = getCourseDbId(course.slug);
    setPublishing(true);
    setActionBanner(null);
    if (dbId) {
      const { error } = await dbUpdateCourse(dbId, { status: nextStatus });
      if (error) {
        setPublishing(false);
        setActionBanner({ variant: 'error', text: error.message });
        return;
      }
      await refreshLiveCatalog();
    } else {
      updateCourse(course.slug, { status: nextStatus });
    }
    setStatus(nextStatus);
    setPublishing(false);
    setActionBanner({
      variant: 'success',
      text:
        nextStatus === 'archived'
          ? locale === 'ar'
            ? 'تمت أرشفة الدورة وإخفاؤها من الكتالوج العام.'
            : 'Course archived and removed from the public catalog.'
          : locale === 'ar'
            ? 'تم إلغاء نشر الدورة ونقلها إلى المسودة.'
            : 'Course unpublished and moved back to draft.',
    });
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={course.shortDescription[locale]}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.courses'), to: '/admin/courses' },
          { label: course.title[locale] },
        ]}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {course.suspended ? (
              <Badge variant="error">{t('admin.approvals.suspendedBadge')}</Badge>
            ) : null}
            <AdminStatusBadge status={course.status} />
            {course.status !== 'published' ? (
              <Button
                size="sm"
                variant="primary"
                disabled={publishing || course.suspended}
                onClick={() => void handleExplicitPublish()}
              >
                <Globe size={14} aria-hidden="true" />{' '}
                {locale === 'ar' ? 'نشر الدورة في الكتالوج العام' : 'Publish Course'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled={publishing}
                onClick={() => void handleStatusTransition('draft')}
              >
                <EyeOff size={14} aria-hidden="true" />{' '}
                {locale === 'ar' ? 'إلغاء النشر (مسودة)' : 'Unpublish'}
              </Button>
            )}
            {course.status !== 'archived' ? (
              <Button
                size="sm"
                variant="tertiary"
                disabled={publishing}
                onClick={() => void handleStatusTransition('archived')}
              >
                <Archive size={14} aria-hidden="true" />{' '}
                {locale === 'ar' ? 'أرشفة' : 'Archive'}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant={course.suspended ? 'primary' : 'destructive'}
              onClick={() => setCourseSuspended(course.slug, !course.suspended)}
            >
              {course.suspended
                ? t('admin.approvals.unsuspendCourse')
                : t('admin.approvals.suspendCourse')}
            </Button>
          </div>
        }
      />

      {actionBanner ? (
        <Alert
          variant={actionBanner.variant}
          title={
            actionBanner.variant === 'success'
              ? locale === 'ar'
                ? 'تم تحديث حالة النشر'
                : 'Publishing Status Updated'
              : locale === 'ar'
                ? 'تعذر تحديث حالة الدورة'
                : 'Status Update Failed'
          }
        >
          {actionBanner.text}
        </Alert>
      ) : null}

      {saved ? (
        <Alert variant="success" title={t('admin.common.save')}>
          {locale === 'ar'
            ? 'تم حفظ تعديلات الدورة في قاعدة البيانات.'
            : 'Course changes saved to database.'}
        </Alert>
      ) : null}

      <div className="details-layout">
        <div className="details-stack">
          <Card>
            <form onSubmit={handleSave} className="details-stack" style={{ gap: 12 }}>
              <h2 className="text-h3">{t('admin.courses.editDetailsTitle')}</h2>
              <div className="grid-2">
                <Input
                  label={t('admin.courses.createModal.titleAr')}
                  value={titleAr}
                  onChange={(e) => {
                    setTitleAr(e.target.value);
                    setSaved(false);
                  }}
                />
                <Input
                  label={t('admin.courses.createModal.titleEn')}
                  value={titleEn}
                  onChange={(e) => {
                    setTitleEn(e.target.value);
                    setSaved(false);
                  }}
                />
              </div>
              <div className="grid-2">
                <Textarea
                  label={t('admin.courses.createModal.descAr')}
                  rows={2}
                  value={descAr}
                  onChange={(e) => {
                    setDescAr(e.target.value);
                    setSaved(false);
                  }}
                />
                <Textarea
                  label={t('admin.courses.createModal.descEn')}
                  rows={2}
                  value={descEn}
                  onChange={(e) => {
                    setDescEn(e.target.value);
                    setSaved(false);
                  }}
                />
              </div>
              <div className="grid-2">
                <Select
                  label={t('admin.courses.createModal.discipline')}
                  value={disciplineSlug}
                  onChange={(e) => {
                    setDisciplineSlug(e.target.value);
                    setSaved(false);
                  }}
                >
                  {disciplines.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name[locale]}
                    </option>
                  ))}
                </Select>
                <Select
                  label={t('admin.courses.columns.status')}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as AdminCourseStatus);
                    setSaved(false);
                  }}
                >
                  <option value="published">{t('admin.statuses.published')}</option>
                  <option value="draft">{t('admin.statuses.draft')}</option>
                  <option value="archived">{t('admin.statuses.archived')}</option>
                </Select>
              </div>
              <div>
                <Button type="submit" variant="primary">
                  {t('admin.common.save')}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="details-stack" style={{ gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <h2 className="text-h3">
                {locale === 'ar' ? 'التسعير وتعليمات الدفع المباشر' : 'Pricing & Direct Payment Review'}
              </h2>
              <Badge variant={course.pricing.enrollmentOpen ? 'success' : 'neutral'}>
                {course.pricing.enrollmentOpen
                  ? locale === 'ar'
                    ? 'التسجيل مفتوح'
                    : 'Enrollment Open'
                  : locale === 'ar'
                    ? 'التسجيل مغلق'
                    : 'Enrollment Closed'}
              </Badge>
            </div>
            <div className="meta-kv-list">
              <div className="meta-kv-row">
                <span>{locale === 'ar' ? 'السعر' : 'Price'}</span>
                <strong>
                  {course.pricing.isFree
                    ? t('admin.paymentStatuses.not_required')
                    : `${course.pricing.priceAmount.toLocaleString()} ${course.pricing.currency}`}
                </strong>
              </div>
              <div className="meta-kv-row">
                <span>{locale === 'ar' ? 'طرق الدفع المباشر' : 'Direct Payment Methods'}</span>
                <span>
                  {course.pricing.paymentMethods
                    .map((pm) => t(`admin.paymentMethods.${pm}`))
                    .join(' · ')}
                </span>
              </div>
              <div className="meta-kv-row">
                <span>{locale === 'ar' ? 'تعليمات الدفع' : 'Payment Instructions'}</span>
                <span>{course.pricing.paymentInstructions[locale]}</span>
              </div>
            </div>
          </Card>

          <Card className="details-stack" style={{ gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <h2 className="text-h3">{t('admin.courses.curriculumOverviewTitle')}</h2>
              <Badge variant="brand">
                <CheckCircle2 size={13} aria-hidden="true" />{' '}
                {course.modules.length} {locale === 'ar' ? 'وحدات' : 'modules'}
              </Badge>
            </div>
            {course.modules.map((mod) => (
              <div key={mod.id} className="curriculum-module">
                <div className="curriculum-module__head">
                  <span>{mod.title[locale]}</span>
                  <Badge variant="neutral">
                    {t('common.lessonsCount', { count: mod.lessons.length })}
                  </Badge>
                </div>
                <ul className="curriculum-lessons">
                  {mod.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="curriculum-lesson"
                      style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{lesson.title[locale]}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Badge variant="neutral">{lesson.lessonType ?? 'video'}</Badge>
                          <AdminStatusBadge status={lesson.status} />
                        </div>
                      </div>
                      {lesson.videoSourceId || lesson.videoUrl ? (
                        <div className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <Video size={13} aria-hidden="true" />
                          <span>
                            {lesson.videoProvider}:{' '}
                            <bdi className="ltr-inline">{lesson.videoUrl || lesson.videoSourceId}</bdi>
                          </span>
                        </div>
                      ) : null}
                      {(lesson.lessonResources ?? []).length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(lesson.lessonResources ?? []).map((res) => (
                            <Button
                              key={res.id}
                              size="sm"
                              variant="tertiary"
                              onClick={async () => {
                                const target = res.fileNameOrUrl?.trim();
                                if (target?.startsWith('http://') || target?.startsWith('https://')) {
                                  window.open(target, '_blank', 'noopener,noreferrer');
                                  return;
                                }
                                if (target?.includes('/')) {
                                  const { url } = await getSignedResourceUrl(target, 300);
                                  if (url) window.open(url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            >
                              <FileText size={13} aria-hidden="true" /> {res.title[locale]}{' '}
                              <Download size={12} aria-hidden="true" />
                            </Button>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('admin.courses.assignInstructorsTitle')}</h2>
            <div className="details-stack" style={{ gap: 8 }}>
              {instructors.map((inst) => (
                <label key={inst.slug} className="admin-checkbox-card">
                  <input
                    type="checkbox"
                    checked={course.instructorSlugs.includes(inst.slug)}
                    onChange={() => toggleInstructor(inst.slug)}
                  />
                  <div>
                    <div className="text-small" style={{ fontWeight: 700 }}>
                      {inst.name[locale]}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                      {inst.title[locale]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('admin.enrollmentOversight.leadAndManagersTitle')}</h2>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              {t('admin.enrollmentOversight.managersHint')}
            </p>
            <Select
              label={t('admin.enrollmentOversight.leadSelectLabel')}
              value={course.leadInstructorSlug ?? course.instructorSlugs[0] ?? ''}
              onChange={(e) =>
                setCourseLeadAndManagers(
                  course.slug,
                  e.target.value,
                  course.enrollmentManagerSlugs ?? [],
                )
              }
            >
              {instructors
                .filter((i) => course.instructorSlugs.includes(i.slug))
                .map((inst) => (
                  <option key={inst.slug} value={inst.slug}>
                    {inst.name[locale]}
                  </option>
                ))}
            </Select>
            <div className="text-small" style={{ fontWeight: 600 }}>
              {t('admin.enrollmentOversight.managersLabel')}
            </div>
            {instructors
              .filter(
                (i) =>
                  course.instructorSlugs.includes(i.slug) &&
                  i.slug !== (course.leadInstructorSlug ?? course.instructorSlugs[0]),
              )
              .map((inst) => {
                const managers = course.enrollmentManagerSlugs ?? [];
                const isMgr = managers.includes(inst.slug);
                return (
                  <label key={inst.slug} className="admin-checkbox-card">
                    <input
                      type="checkbox"
                      checked={isMgr}
                      onChange={() => {
                        const next = isMgr
                          ? managers.filter((s) => s !== inst.slug)
                          : [...managers, inst.slug];
                        setCourseLeadAndManagers(
                          course.slug,
                          course.leadInstructorSlug ?? course.instructorSlugs[0] ?? '',
                          next,
                        );
                      }}
                    />
                    <span className="text-small">{inst.name[locale]}</span>
                  </label>
                );
              })}
          </Card>
        </aside>
      </div>
    </div>
  );
}
