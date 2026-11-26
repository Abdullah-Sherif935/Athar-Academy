import { FolderSearch, Plus, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { SearchBar } from '../../../components/shared';
import { Alert, Button, Card, EmptyState } from '../../../components/ui';
import { MOCK_DISCIPLINES } from '../../../data/mock';
import type { PublishStatus } from '../../../data/mock/instructor';
import { AdminStatusBadge } from '../../admin/components/AdminStatusBadge';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AssignedCourseCard } from '../components/AssignedCourseCard';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorCoursesPage() {
  const { t, locale } = useI18n();
  const { assignedCourses, isInstructorDisabled, myProposals } = useInstructorDemo();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  const assignedDisciplineSlugs = useMemo(
    () => Array.from(new Set(assignedCourses.map((c) => c.disciplineSlug))),
    [assignedCourses],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignedCourses.filter((course) => {
      if (statusFilter !== 'all' && course.status !== statusFilter) return false;
      if (disciplineFilter !== 'all' && course.disciplineSlug !== disciplineFilter) return false;
      if (!q) return true;
      return (
        course.title[locale].toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.title.en.toLowerCase().includes(q) ||
        course.title.ar.toLowerCase().includes(q)
      );
    });
  }, [assignedCourses, disciplineFilter, locale, query, statusFilter]);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.courses.title')}
        subtitle={t('instructor.courses.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.courses') },
        ]}
        action={
          !isInstructorDisabled ? (
            <Link to="/instructor/courses/new" className="ui-btn ui-btn--primary ui-btn--sm">
              <Plus size={15} aria-hidden="true" /> {t('instructor.selfService.proposeCourseBtn')}
            </Link>
          ) : undefined
        }
      />

      {isInstructorDisabled ? (
        <Alert variant="error" title={t('instructor.selfService.revokedTitle')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={16} aria-hidden="true" />
            {t('instructor.selfService.revokedBody')}
          </span>
        </Alert>
      ) : null}

      {myProposals.length > 0 ? (
        <Card className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('instructor.selfService.proposalsSectionTitle')}</h2>
          <div className="details-stack" style={{ gap: 10 }}>
            {myProposals.map((prop) => (
              <div
                key={prop.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div className="text-small" style={{ fontWeight: 700 }}>
                      {prop.title[locale]}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                      {prop.shortDescription[locale]}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <AdminStatusBadge status={prop.status} />
                    {(prop.status === 'rejected' || prop.status === 'draft') ? (
                      <Link
                        to={`/instructor/courses/new?proposalId=${prop.id}`}
                        className="ui-btn ui-btn--secondary ui-btn--sm"
                      >
                        {t('instructor.selfService.reviseResubmitBtn')}
                      </Link>
                    ) : null}
                    {prop.status === 'approved' && prop.approvedCourseSlug ? (
                      <Link
                        to={`/instructor/courses/${prop.approvedCourseSlug}`}
                        className="ui-btn ui-btn--primary ui-btn--sm"
                      >
                        {t('instructor.selfService.openApprovedCourse')}
                      </Link>
                    ) : null}
                  </div>
                </div>
                {prop.status === 'rejected' && prop.rejectionReason ? (
                  <Alert variant="error" title={t('admin.statuses.rejected')}>
                    {prop.rejectionReason[locale]}
                  </Alert>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="filter-toolbar filter-toolbar--discipline">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t('instructor.courses.searchPlaceholder')}
        />
        <div className="ui-field">
          <label htmlFor="inst-status-filter" className="ui-field__label">
            {t('instructor.courses.statusFilter')}
          </label>
          <select
            id="inst-status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | PublishStatus)}
          >
            <option value="all">{t('instructor.courses.allStatuses')}</option>
            <option value="published">{t('instructor.status.published')}</option>
            <option value="draft">{t('instructor.status.draft')}</option>
          </select>
        </div>
        <div className="ui-field">
          <label htmlFor="inst-disc-filter" className="ui-field__label">
            {t('coursesPage.disciplineFilter')}
          </label>
          <select
            id="inst-disc-filter"
            className="filter-select"
            value={disciplineFilter}
            onChange={(event) => setDisciplineFilter(event.target.value)}
          >
            <option value="all">{t('common.allDisciplines')}</option>
            {MOCK_DISCIPLINES.filter((d) => assignedDisciplineSlugs.includes(d.slug)).map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name[locale]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid-2">
          {filtered.map((course) => (
            <AssignedCourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderSearch size={24} />}
          title={t('coursesPage.emptyTitle')}
          description={t('coursesPage.emptyDescription')}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
                setDisciplineFilter('all');
              }}
            >
              {t('common.resetFilters')}
            </Button>
          }
        />
      )}
    </div>
  );
}
