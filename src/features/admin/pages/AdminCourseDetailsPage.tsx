import { FolderSearch } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Input, Select, Textarea } from '../../../components/ui';
import type { AdminCourseStatus } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminCourseDetailsPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const {
    courses,
    disciplines,
    instructors,
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

      {saved ? (
        <Alert variant="success" title={t('common.demoBadge')}>
          {t('admin.common.savedDemo')}
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
            <h2 className="text-h3">{t('admin.courses.curriculumOverviewTitle')}</h2>
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
                    <li key={lesson.id} className="curriculum-lesson">
                      <span>{lesson.title[locale]}</span>
                      <AdminStatusBadge status={lesson.status} />
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
