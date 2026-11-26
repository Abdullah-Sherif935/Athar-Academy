import { FolderSearch } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Button, Card, EmptyState, Input } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminInstructorDetailsPage() {
  const { instructorId = '' } = useParams();
  const { t, locale } = useI18n();
  const {
    instructors,
    courses,
    updateInstructor,
    setInstructorStatus,
    setCourseInstructors,
  } = usePlatformDemo();

  const instructor = instructors.find((i) => i.slug === instructorId);
  const [nameAr, setNameAr] = useState(instructor?.name.ar ?? '');
  const [nameEn, setNameEn] = useState(instructor?.name.en ?? '');
  const [email, setEmail] = useState(instructor?.email ?? '');
  const [saved, setSaved] = useState(false);

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

  const toggleCourseAssignment = (courseSlug: string) => {
    const target = courses.find((c) => c.slug === courseSlug);
    if (!target) return;
    const isAssigned = target.instructorSlugs.includes(instructor.slug);
    const nextSlugs = isAssigned
      ? target.instructorSlugs.filter((s) => s !== instructor.slug)
      : [...target.instructorSlugs, instructor.slug];
    setCourseInstructors(courseSlug, nextSlugs);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstructor(instructor.slug, {
      name: { ar: nameAr.trim() || instructor.name.ar, en: nameEn.trim() || instructor.name.en },
      email: email.trim() || instructor.email,
    });
    setSaved(true);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={instructor.name[locale]}
        subtitle={instructor.title[locale]}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.instructors'), to: '/admin/instructors' },
          { label: instructor.name[locale] },
        ]}
        action={<AdminStatusBadge status={instructor.status} />}
      />

      {saved ? (
        <Alert variant="success" title={t('common.demoBadge')}>
          {t('admin.common.savedDemo')}
        </Alert>
      ) : null}

      <div className="details-layout">
        <div className="details-stack">
          <Card className="details-stack" style={{ gap: 14 }}>
            <div>
              <h2 className="text-h3">{t('admin.instructors.assignedCoursesTitle')}</h2>
              <p className="text-small" style={{ color: 'var(--text-secondary)', marginBlockStart: 4 }}>
                {t('admin.instructors.assignedCoursesHint')}
              </p>
            </div>

            <div className="admin-checkbox-grid">
              {courses.map((course) => {
                const checked = course.instructorSlugs.includes(instructor.slug);
                return (
                  <label key={course.slug} className="admin-checkbox-card">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCourseAssignment(course.slug)}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="text-small" style={{ fontWeight: 700 }}>
                        {course.title[locale]}
                      </div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        <bdi className="ltr-inline">{course.code}</bdi> · {t(`admin.statuses.${course.status}`)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card>
            <form onSubmit={handleSaveProfile} className="details-stack" style={{ gap: 12 }}>
              <h2 className="text-h3">{t('admin.instructors.editProfileTitle')}</h2>
              <div className="grid-2">
                <Input
                  label={t('admin.instructors.inviteModal.nameAr')}
                  value={nameAr}
                  onChange={(e) => {
                    setNameAr(e.target.value);
                    setSaved(false);
                  }}
                />
                <Input
                  label={t('admin.instructors.inviteModal.nameEn')}
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    setSaved(false);
                  }}
                />
              </div>
              <Input
                label={t('admin.instructors.inviteModal.email')}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
              <div>
                <Button type="submit" variant="primary">
                  {t('admin.common.save')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('admin.students.accountActionsTitle')}</h2>
            <Button
              variant={instructor.status === 'active' ? 'secondary' : 'primary'}
              disabled={instructor.status === 'active'}
              onClick={() => setInstructorStatus(instructor.slug, 'active')}
            >
              {t('admin.instructors.actions.activate')}
            </Button>
            <Button
              variant="secondary"
              disabled={instructor.status === 'inactive'}
              onClick={() => setInstructorStatus(instructor.slug, 'inactive')}
            >
              {t('admin.instructors.actions.deactivate')}
            </Button>
            <Button
              variant="destructive"
              disabled={instructor.status === 'revoked'}
              onClick={() => setInstructorStatus(instructor.slug, 'revoked')}
            >
              {t('admin.instructors.actions.revoke')}
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
