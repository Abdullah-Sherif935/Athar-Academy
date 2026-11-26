import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Button, Card, EmptyState, Input, Modal, Select, Textarea } from '../../../components/ui';
import type { AdminCourseStatus } from '../../../data/mock/admin';
import type { CourseLevel } from '../../../data/mock/types';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminCoursesPage() {
  const { t, locale } = useI18n();
  const { courses, disciplines, instructors, createCourse, updateCourse } = usePlatformDemo();

  const [query, setQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminCourseStatus>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const [code, setCode] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [shortDescAr, setShortDescAr] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [disciplineSlug, setDisciplineSlug] = useState(disciplines[0]?.slug ?? 'software-technology');
  const [level, setLevel] = useState<CourseLevel>('beginner');
  const [durationAr, setDurationAr] = useState('4 أسابيع');
  const [durationEn, setDurationEn] = useState('4 Weeks');
  const [status, setStatus] = useState<AdminCourseStatus>('published');
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(['dr-tariq-al-mansour']);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (disciplineFilter !== 'all' && c.disciplineSlug !== disciplineFilter) return false;
      if (instructorFilter !== 'all' && !c.instructorSlugs.includes(instructorFilter)) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.title.ar.toLowerCase().includes(q) ||
        c.title.en.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [courses, disciplineFilter, instructorFilter, query, statusFilter]);

  const toggleInstructor = (slug: string) => {
    setSelectedInstructors((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !titleEn.trim()) return;
    createCourse({
      code: code || `NEW-${courses.length + 101}`,
      titleAr,
      titleEn,
      shortDescAr: shortDescAr || titleAr,
      shortDescEn: shortDescEn || titleEn,
      disciplineSlug,
      instructorSlugs: selectedInstructors,
      level,
      durationAr,
      durationEn,
      status,
    });
    setCode('');
    setTitleAr('');
    setTitleEn('');
    setShortDescAr('');
    setShortDescEn('');
    setCreateOpen(false);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.courses.title')}
        subtitle={t('admin.courses.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.courses') },
        ]}
        action={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} aria-hidden="true" /> {t('admin.courses.createBtn')}
          </Button>
        }
      />

      <Card>
        <div className="admin-filter-bar">
          <div style={{ flex: '1 1 220px' }}>
            <Input
              aria-label={t('admin.common.searchPlaceholder')}
              placeholder={t('admin.common.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 1 180px' }}>
            <Select
              aria-label={t('admin.courses.columns.discipline')}
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
            >
              <option value="all">{t('admin.common.allDisciplines')}</option>
              {disciplines.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name[locale]}
                </option>
              ))}
            </Select>
          </div>
          <div style={{ flex: '0 1 180px' }}>
            <Select
              aria-label={t('admin.courses.columns.instructors')}
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
            >
              <option value="all">{t('admin.common.allInstructors')}</option>
              {instructors.map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name[locale]}
                </option>
              ))}
            </Select>
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <Select
              aria-label={t('admin.courses.columns.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | AdminCourseStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="published">{t('admin.statuses.published')}</option>
              <option value="draft">{t('admin.statuses.draft')}</option>
              <option value="archived">{t('admin.statuses.archived')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title={t('admin.common.noResults')}
          description={t('admin.courses.subtitle')}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.courses.columns.course')}</th>
                <th>{t('admin.courses.columns.discipline')}</th>
                <th>{t('admin.courses.columns.instructors')}</th>
                <th>{t('admin.courses.columns.lessons')}</th>
                <th>{t('admin.courses.columns.status')}</th>
                <th>{t('admin.courses.columns.updated')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => {
                const disc = disciplines.find((d) => d.slug === course.disciplineSlug);
                const courseInsts = instructors.filter((i) => course.instructorSlugs.includes(i.slug));
                const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                return (
                  <tr key={course.slug}>
                    <td>
                      <Link
                        to={`/admin/courses/${course.slug}`}
                        className="card-title-link"
                        style={{ fontWeight: 700 }}
                      >
                        {course.title[locale]}
                      </Link>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        <bdi className="ltr-inline">{course.code}</bdi>
                      </div>
                    </td>
                    <td>{disc ? <Badge variant="brand">{disc.name[locale]}</Badge> : '—'}</td>
                    <td>{courseInsts.map((i) => i.name[locale]).join(' · ') || '—'}</td>
                    <td>{lessonCount}</td>
                    <td>
                      <AdminStatusBadge status={course.status} />
                    </td>
                    <td>{course.lastUpdated[locale]}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/admin/courses/${course.slug}`}
                          className="ui-btn ui-btn--secondary ui-btn--sm"
                        >
                          {t('admin.common.viewDetails')}
                        </Link>
                        {course.status !== 'published' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              updateCourse(course.slug, { status: 'published', pendingApproval: false })
                            }
                          >
                            {t('admin.courses.actions.publish')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => updateCourse(course.slug, { status: 'draft' })}
                          >
                            {t('admin.courses.actions.unpublish')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.courses.createModal.title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              {t('admin.courses.createModal.submit')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="details-stack" style={{ gap: 12 }}>
          <div className="grid-2">
            <Input
              label={t('admin.courses.createModal.code')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="AI-201"
            />
            <Select
              label={t('admin.courses.createModal.status')}
              value={status}
              onChange={(e) => setStatus(e.target.value as AdminCourseStatus)}
            >
              <option value="published">{t('admin.statuses.published')}</option>
              <option value="draft">{t('admin.statuses.draft')}</option>
            </Select>
          </div>
          <div className="grid-2">
            <Input
              label={t('admin.courses.createModal.titleAr')}
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              required
            />
            <Input
              label={t('admin.courses.createModal.titleEn')}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </div>
          <div className="grid-2">
            <Textarea
              label={t('admin.courses.createModal.descAr')}
              rows={2}
              value={shortDescAr}
              onChange={(e) => setShortDescAr(e.target.value)}
            />
            <Textarea
              label={t('admin.courses.createModal.descEn')}
              rows={2}
              value={shortDescEn}
              onChange={(e) => setShortDescEn(e.target.value)}
            />
          </div>
          <div className="grid-2">
            <Select
              label={t('admin.courses.createModal.discipline')}
              value={disciplineSlug}
              onChange={(e) => setDisciplineSlug(e.target.value)}
            >
              {disciplines.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name[locale]}
                </option>
              ))}
            </Select>
            <Select
              label={t('admin.courses.createModal.level')}
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
            >
              <option value="beginner">{t('common.levels.beginner')}</option>
              <option value="intermediate">{t('common.levels.intermediate')}</option>
              <option value="advanced">{t('common.levels.advanced')}</option>
            </Select>
          </div>
          <div className="grid-2">
            <Input
              label={t('admin.courses.createModal.durationAr')}
              value={durationAr}
              onChange={(e) => setDurationAr(e.target.value)}
            />
            <Input
              label={t('admin.courses.createModal.durationEn')}
              value={durationEn}
              onChange={(e) => setDurationEn(e.target.value)}
            />
          </div>
          <div>
            <div className="text-small" style={{ fontWeight: 600, marginBlockEnd: 6 }}>
              {t('admin.courses.createModal.instructors')}
            </div>
            <div className="admin-checkbox-grid">
              {instructors.map((inst) => (
                <label key={inst.slug} className="admin-checkbox-card">
                  <input
                    type="checkbox"
                    checked={selectedInstructors.includes(inst.slug)}
                    onChange={() => toggleInstructor(inst.slug)}
                  />
                  <span className="text-small">{inst.name[locale]}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
