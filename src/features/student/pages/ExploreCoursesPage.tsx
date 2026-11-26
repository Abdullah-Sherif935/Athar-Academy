import { ArrowLeft, ArrowRight, Clock, FolderSearch, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { DisciplineIcon, SearchBar } from '../../../components/shared';
import { Badge, Button, Card, EmptyState } from '../../../components/ui';
import type { CourseLevel } from '../../../data/mock';
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

function parseWeeks(durationEn: string): number {
  const match = durationEn.match(/(\d+)/);
  return match ? Number(match[1]) : 99;
}

export function ExploreCoursesPage() {
  const { t, locale, dir } = useI18n();
  const { getCourseAvailability } = useStudentDemo();
  const { courses: allCourses, disciplines: allDisciplines, instructors: allInstructors } =
    usePlatformDemo();
  const catalogCourses = useMemo(
    () => allCourses.filter((c) => c.status !== 'archived'),
    [allCourses],
  );

  const [query, setQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState<'all' | CourseLevel>('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'titleAsc' | 'durationAsc'>('featured');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = catalogCourses.filter((course) => {
      if (disciplineFilter !== 'all' && course.disciplineSlug !== disciplineFilter) return false;
      if (levelFilter !== 'all' && course.level !== levelFilter) return false;
      if (instructorFilter !== 'all' && !course.instructorSlugs.includes(instructorFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        course.title[locale].toLowerCase().includes(q) ||
        course.shortDescription[locale].toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.title.en.toLowerCase().includes(q) ||
        course.title.ar.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'titleAsc') return a.title[locale].localeCompare(b.title[locale]);
      if (sortBy === 'durationAsc') {
        return parseWeeks(a.duration.en) - parseWeeks(b.duration.en);
      }
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [catalogCourses, disciplineFilter, instructorFilter, levelFilter, locale, query, sortBy]);

  const hasActiveFilters =
    query.trim() !== '' ||
    disciplineFilter !== 'all' ||
    levelFilter !== 'all' ||
    instructorFilter !== 'all';

  const resetAll = () => {
    setQuery('');
    setDisciplineFilter('all');
    setLevelFilter('all');
    setInstructorFilter('all');
    setSortBy('featured');
  };

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.explore.title')}
        subtitle={t('student.explore.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.explore.title') },
        ]}
        action={
          <div className="section-header__meta">
            <Badge variant="brand">
              {t('student.explore.totalAvailable', { count: catalogCourses.length })}
            </Badge>
            <Badge variant="orange">{t('common.demoBadge')}</Badge>
          </div>
        }
      />

      <div className="filter-toolbar explore-filter-grid">
        <div className="ui-field explore-filter-grid__search">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('student.explore.searchPlaceholder')}
          />
        </div>

        <div className="ui-field">
          <label htmlFor="explore-discipline" className="ui-field__label">
            {t('coursesPage.disciplineFilter')}
          </label>
          <select
            id="explore-discipline"
            className="filter-select"
            value={disciplineFilter}
            onChange={(event) => setDisciplineFilter(event.target.value)}
          >
            <option value="all">{t('common.allDisciplines')}</option>
            {allDisciplines.map((disc) => (
              <option key={disc.slug} value={disc.slug}>
                {disc.name[locale]}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label htmlFor="explore-level" className="ui-field__label">
            {t('coursesPage.levelFilter')}
          </label>
          <select
            id="explore-level"
            className="filter-select"
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value as 'all' | CourseLevel)}
          >
            <option value="all">{t('common.allLevels')}</option>
            <option value="beginner">{t('common.levels.beginner')}</option>
            <option value="intermediate">{t('common.levels.intermediate')}</option>
            <option value="advanced">{t('common.levels.advanced')}</option>
          </select>
        </div>

        <div className="ui-field">
          <label htmlFor="explore-instructor" className="ui-field__label">
            {t('student.explore.instructorFilter')}
          </label>
          <select
            id="explore-instructor"
            className="filter-select"
            value={instructorFilter}
            onChange={(event) => setInstructorFilter(event.target.value)}
          >
            <option value="all">{t('student.explore.allInstructors')}</option>
            {allInstructors.map((inst) => (
              <option key={inst.slug} value={inst.slug}>
                {inst.name[locale]}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label htmlFor="explore-sort" className="ui-field__label">
            {t('common.sort.label')}
          </label>
          <select
            id="explore-sort"
            className="filter-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as 'featured' | 'titleAsc' | 'durationAsc')
            }
          >
            <option value="featured">{t('common.sort.featured')}</option>
            <option value="titleAsc">{t('common.sort.titleAsc')}</option>
            <option value="durationAsc">{t('student.explore.sortDuration')}</option>
          </select>
        </div>
      </div>

      <div className="results-bar" style={{ marginBlockEnd: 0 }}>
        <span>
          {t('coursesPage.resultsCount', {
            count: filtered.length,
            total: catalogCourses.length,
          })}
        </span>
        {hasActiveFilters ? (
          <Button variant="tertiary" size="sm" onClick={resetAll}>
            {t('common.resetFilters')}
          </Button>
        ) : null}
      </div>

      {filtered.length > 0 ? (
        <div className="grid-2">
          {filtered.map((course) => {
            const discipline = allDisciplines.find((d) => d.slug === course.disciplineSlug);
            const instructors = course.instructorSlugs
              .map((slug) => allInstructors.find((i) => i.slug === slug))
              .filter((i): i is NonNullable<typeof i> => Boolean(i));
            const availability = getCourseAvailability(course.slug);

            return (
              <Card key={course.slug} interactive className="public-course-card">
                <div className={`public-course-card__visual accent-surface--${course.accent}`}>
                  <div className="public-course-card__visual-top">
                    <EnrollmentStatusBadge status={availability} />
                    <Badge variant="teal">{t(`common.levels.${course.level}`)}</Badge>
                  </div>
                  <div className={`public-course-card__emblem accent-badge--${course.accent}`}>
                    <DisciplineIcon name={discipline?.iconName ?? 'code'} size={28} />
                  </div>
                </div>

                <div className="public-course-card__content">
                  <div className="section-header__meta">
                    {discipline ? <Badge variant="brand">{discipline.name[locale]}</Badge> : null}
                    <Badge variant="neutral">
                      <bdi className="ltr-inline">{course.code}</bdi>
                    </Badge>
                  </div>

                  <h2 className="text-h3">
                    <Link
                      to={`/student/explore-courses/${course.slug}`}
                      className="card-title-link"
                    >
                      {course.title[locale]}
                    </Link>
                  </h2>

                  <p className="text-small">{course.shortDescription[locale]}</p>

                  <div className="public-course-card__meta">
                    <div className="public-course-card__meta-item">
                      <User size={15} aria-hidden="true" />
                      <span>{instructors.map((i) => i.name[locale]).join(' · ')}</span>
                    </div>
                    <div className="public-course-card__meta-item">
                      <Clock size={15} aria-hidden="true" />
                      <span>{course.duration[locale]}</span>
                    </div>
                  </div>
                </div>

                <div className="public-course-card__footer">
                  {availability === 'enrolled' ? (
                    <Link
                      to={`/student/courses/${course.slug}`}
                      className="ui-btn ui-btn--primary ui-btn--sm public-course-card__cta"
                    >
                      <span>{t('student.explore.actions.openCourse')}</span>
                      <Arrow size={15} aria-hidden="true" />
                    </Link>
                  ) : availability === 'pending' ? (
                    <Link
                      to="/student/enrollment-requests"
                      className="ui-btn ui-btn--secondary ui-btn--sm public-course-card__cta"
                    >
                      <span>{t('student.explore.actions.viewStatus')}</span>
                      <Arrow size={15} aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      to={`/student/explore-courses/${course.slug}`}
                      className="ui-btn ui-btn--secondary ui-btn--sm public-course-card__cta"
                    >
                      <span>
                        {availability === 'rejected'
                          ? t('student.explore.actions.requestAgain')
                          : t('student.explore.actions.viewDetails')}
                      </span>
                      <Arrow size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FolderSearch size={24} />}
          title={t('coursesPage.emptyTitle')}
          description={t('coursesPage.emptyDescription')}
          action={
            <Button variant="secondary" onClick={resetAll}>
              {t('common.resetFilters')}
            </Button>
          }
        />
      )}
    </div>
  );
}
