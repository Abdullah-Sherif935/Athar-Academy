import { FolderSearch } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { CourseCard, SearchBar } from '../../../components/shared';
import { Badge, Button, EmptyState } from '../../../components/ui';
import type { CourseLevel } from '../../../data/mock';

const LEVEL_RANK: Record<CourseLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function CoursesPage() {
  const { t, locale } = useI18n();
  const { courses: allPlatformCourses, disciplines: allDisciplines } = usePlatformDemo();
  const publishedCourses = useMemo(
    () => allPlatformCourses.filter((c) => c.status === 'published'),
    [allPlatformCourses],
  );
  const activeDisciplines = useMemo(
    () => allDisciplines.filter((d) => d.isActive),
    [allDisciplines],
  );
  const [query, setQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState<'all' | CourseLevel>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'titleAsc' | 'levelAsc'>('featured');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = publishedCourses.filter((course) => {
      if (disciplineFilter !== 'all' && course.disciplineSlug !== disciplineFilter) return false;
      if (levelFilter !== 'all' && course.level !== levelFilter) return false;
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
      if (sortBy === 'levelAsc') return LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [disciplineFilter, levelFilter, locale, publishedCourses, query, sortBy]);

  const hasActiveFilters = query.trim() !== '' || disciplineFilter !== 'all' || levelFilter !== 'all';

  const resetAll = () => {
    setQuery('');
    setDisciplineFilter('all');
    setLevelFilter('all');
    setSortBy('featured');
  };

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <span>{t('nav.courses')}</span>
            </nav>
            <div className="section-header__meta">
              <Badge variant="brand">{t('coursesPage.eyebrow')}</Badge>
              <Badge variant="orange">{t('common.demoBadge')}</Badge>
            </div>
            <h1 className="text-display">{t('coursesPage.title')}</h1>
            <p className="hero__subtitle">{t('coursesPage.description')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-toolbar filter-toolbar--courses">
            <div className="ui-field">
              <label htmlFor="courses-search-label" className="sr-only">
                {t('coursesPage.searchPlaceholder')}
              </label>
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder={t('coursesPage.searchPlaceholder')}
              />
            </div>

            <div className="ui-field">
              <label htmlFor="courses-discipline" className="ui-field__label">
                {t('coursesPage.disciplineFilter')}
              </label>
              <select
                id="courses-discipline"
                className="filter-select"
                value={disciplineFilter}
                onChange={(event) => setDisciplineFilter(event.target.value)}
              >
                <option value="all">{t('common.allDisciplines')}</option>
                {activeDisciplines.map((discipline) => (
                  <option key={discipline.slug} value={discipline.slug}>
                    {discipline.name[locale]}
                  </option>
                ))}
              </select>
            </div>

            <div className="ui-field">
              <label htmlFor="courses-level" className="ui-field__label">
                {t('coursesPage.levelFilter')}
              </label>
              <select
                id="courses-level"
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
              <label htmlFor="courses-sort" className="ui-field__label">
                {t('common.sort.label')}
              </label>
              <select
                id="courses-sort"
                className="filter-select"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as 'featured' | 'titleAsc' | 'levelAsc')
                }
              >
                <option value="featured">{t('common.sort.featured')}</option>
                <option value="titleAsc">{t('common.sort.titleAsc')}</option>
                <option value="levelAsc">{t('common.sort.levelAsc')}</option>
              </select>
            </div>
          </div>

          <div className="results-bar">
            <span>
              {t('coursesPage.resultsCount', {
                count: filtered.length,
                total: publishedCourses.length,
              })}
            </span>
            {hasActiveFilters ? (
              <Button variant="tertiary" size="sm" onClick={resetAll}>
                {t('common.resetFilters')}
              </Button>
            ) : null}
          </div>

          {filtered.length > 0 ? (
            <div className="grid-3">
              {filtered.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
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
      </section>
    </>
  );
}
