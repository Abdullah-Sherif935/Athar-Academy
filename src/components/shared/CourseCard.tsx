import { ArrowLeft, ArrowRight, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../app/providers/PlatformDemoContext';
import type { PlatformCourse } from '../../data/mock/admin';
import type { Course } from '../../data/mock';
import { Badge, Card } from '../ui';
import { DisciplineIcon } from './DisciplineIcon';

export function CourseCard({ course }: { course: Course | PlatformCourse }) {
  const { locale, dir, t } = useI18n();
  const { disciplines, instructors: allInstructors } = usePlatformDemo();
  const discipline = disciplines.find((d) => d.slug === course.disciplineSlug);
  const instructors = course.instructorSlugs
    .map((slug) => allInstructors.find((i) => i.slug === slug))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <Card interactive className="public-course-card">
      <div className={`public-course-card__visual accent-surface--${course.accent}`}>
        <div className="public-course-card__visual-top">
          <Badge variant="neutral">
            <bdi className="ltr-inline">{course.code}</bdi>
          </Badge>
          <Badge variant="teal">{t(`common.levels.${course.level}`)}</Badge>
        </div>
        <div className={`public-course-card__emblem accent-badge--${course.accent}`}>
          <DisciplineIcon name={discipline?.iconName ?? 'code'} size={30} />
        </div>
      </div>

      <div className="public-course-card__content">
        <div className="section-header__meta">
          {discipline ? (
            <Badge variant="brand">{discipline.name[locale]}</Badge>
          ) : null}
          {course.priceLabel ? (
            <Badge variant="orange">{course.priceLabel[locale]}</Badge>
          ) : null}
        </div>

        <h3 className="text-h3">
          <Link to={`/courses/${course.slug}`} className="card-title-link">
            {course.title[locale]}
          </Link>
        </h3>

        <p className="text-small">{course.shortDescription[locale]}</p>

        <div className="public-course-card__meta">
          <div className="public-course-card__meta-item">
            <User size={15} aria-hidden="true" />
            <span>
              {instructors.map((inst) => inst.name[locale]).join(' · ')}
            </span>
          </div>
          <div className="public-course-card__meta-item">
            <Clock size={15} aria-hidden="true" />
            <span>{course.duration[locale]}</span>
          </div>
        </div>
      </div>

      <div className="public-course-card__footer">
        <Link to={`/courses/${course.slug}`} className="ui-btn ui-btn--secondary ui-btn--sm public-course-card__cta">
          <span>{t('common.viewDetails')}</span>
          {dir === 'rtl' ? (
            <ArrowLeft size={15} aria-hidden="true" />
          ) : (
            <ArrowRight size={15} aria-hidden="true" />
          )}
        </Link>
      </div>
    </Card>
  );
}
