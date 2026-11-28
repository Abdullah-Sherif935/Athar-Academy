import { CheckCircle2, FolderSearch } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import {
  CourseCard,
  DisciplineIcon,
  InstructorCard,
  SearchBar,
  SectionHeading,
} from '../../../components/shared';
import { Button, Card, EmptyState } from '../../../components/ui';
import type { CourseLevel } from '../../../data/mock';

const LEVEL_RANK: Record<CourseLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function DisciplineDetailsPage() {
  const { slug = '' } = useParams();
  const { t, locale } = useI18n();
  const { disciplines, courses: platformCourses, instructors: allInstructors } = usePlatformDemo();
  const discipline = disciplines.find((d) => d.slug === slug);

  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | CourseLevel>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'titleAsc' | 'levelAsc'>('featured');

  const allCourses = useMemo(
    () =>
      discipline
        ? platformCourses.filter(
            (c) => c.disciplineSlug === discipline.slug && c.status === 'published',
          )
        : [],
    [discipline, platformCourses],
  );

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allCourses.filter((course) => {
      if (levelFilter !== 'all' && course.level !== levelFilter) return false;
      if (!q) return true;
      return (
        course.title[locale].toLowerCase().includes(q) ||
        course.shortDescription[locale].toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'titleAsc') return a.title[locale].localeCompare(b.title[locale]);
      if (sortBy === 'levelAsc') return LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [allCourses, levelFilter, query, sortBy, locale]);

  if (!discipline) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            icon={<FolderSearch size={24} />}
            title={t('disciplineDetails.notFoundTitle')}
            description={t('disciplineDetails.notFoundDescription')}
            action={
              <Link to="/disciplines" className="ui-btn ui-btn--primary ui-btn--md">
                {t('common.backToDisciplines')}
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const assignedInstSlugs = new Set(allCourses.flatMap((c) => c.instructorSlugs));
  const instructors = allInstructors.filter(
    (i) => assignedInstSlugs.has(i.slug) || i.disciplineSlugs.includes(discipline.slug),
  );

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/disciplines">{t('nav.disciplines')}</Link>
              <span aria-hidden="true">/</span>
              <span>{discipline.name[locale]}</span>
            </nav>

            <div className="section-header__meta">
              <div className={`discipline-card__icon accent-badge--${discipline.accent}`}>
                <DisciplineIcon name={discipline.iconName} size={24} />
              </div>
            </div>

            <h1 className="text-display">{discipline.name[locale]}</h1>
            <p className="hero__subtitle">{discipline.overview[locale]}</p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="section" style={{ paddingBlockEnd: 24 }}>
        <div className="container">
          <Card>
            <h2 className="text-h3" style={{ marginBlockEnd: 14 }}>
              {t('disciplineDetails.highlightsTitle')}
            </h2>
            <ul className="benefit-list">
              {discipline.highlights.map((item, idx) => (
                <li key={idx} className="benefit-list__item">
                  <CheckCircle2 size={18} className="benefit-list__icon" aria-hidden="true" />
                  <span>{item[locale]}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Related Courses */}
      <section className="section" style={{ paddingBlockStart: 16 }}>
        <div className="container">
          <SectionHeading
            eyebrow={t('nav.courses')}
            demoBadge={t('common.demoBadge')}
            title={t('disciplineDetails.coursesTitle')}
          />

          <div className="filter-toolbar filter-toolbar--discipline">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('coursesPage.searchPlaceholder')}
            />
            <div className="ui-field">
              <label htmlFor="disc-level-filter" className="ui-field__label">
                {t('coursesPage.levelFilter')}
              </label>
              <select
                id="disc-level-filter"
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
              <label htmlFor="disc-sort" className="ui-field__label">
                {t('common.sort.label')}
              </label>
              <select
                id="disc-sort"
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

          {filteredCourses.length > 0 ? (
            <div className="grid-2">
              {filteredCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderSearch size={24} />}
              title={t('disciplineDetails.noCoursesTitle')}
              description={t('disciplineDetails.noCoursesDescription')}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setLevelFilter('all');
                  }}
                >
                  {t('common.resetFilters')}
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* Related Instructors */}
      {instructors.length > 0 ? (
        <section className="section surface-band">
          <div className="container">
            <SectionHeading
              eyebrow={t('nav.instructors')}
              demoBadge={t('common.demoBadge')}
              title={t('disciplineDetails.instructorsTitle')}
            />
            <div className="grid-3">
              {instructors.map((instructor) => (
                <InstructorCard key={instructor.slug} instructor={instructor} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
