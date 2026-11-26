import { BookOpen, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { DisciplineIcon } from '../../../components/shared';
import { Badge, Card } from '../../../components/ui';
import { getDisciplineBySlug, getInstructorBySlug } from '../../../data/mock';
import type { PlatformCourse } from '../../../data/mock/admin';
import { useInstructorDemo } from '../context/InstructorDemoContext';
import { LessonStatusBadge } from './LessonStatusBadge';

export function AssignedCourseCard({ course }: { course: PlatformCourse }) {
  const { t, locale } = useI18n();
  const { students } = useInstructorDemo();

  const discipline = getDisciplineBySlug(course.disciplineSlug);
  const enrolledCount = students.filter((s) =>
    s.enrollments.some((e) => e.courseSlug === course.slug),
  ).length;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const publishedCount = allLessons.filter((l) => l.status === 'published').length;
  const instructorNames = course.instructorSlugs
    .map((slug) => getInstructorBySlug(slug)?.name[locale] ?? slug)
    .join(' · ');

  return (
    <Card interactive className="public-course-card">
      <div className={`public-course-card__visual accent-surface--${course.accent}`}>
        <div className="public-course-card__visual-top">
          <LessonStatusBadge status={course.status} />
          <Badge variant="neutral">
            <bdi className="ltr-inline">{course.code}</bdi>
          </Badge>
        </div>
        <div className={`public-course-card__emblem accent-badge--${course.accent}`}>
          <DisciplineIcon name={discipline?.iconName ?? 'code'} size={28} />
        </div>
      </div>

      <div className="public-course-card__content">
        {discipline ? <Badge variant="brand">{discipline.name[locale]}</Badge> : null}
        <h2 className="text-h3">
          <Link to={`/instructor/courses/${course.slug}`} className="card-title-link">
            {course.title[locale]}
          </Link>
        </h2>
        <p className="text-caption">{instructorNames}</p>

        <div className="public-course-card__meta">
          <div className="public-course-card__meta-item">
            <Users size={14} aria-hidden="true" />
            <span>{t('instructor.courses.studentsCount', { count: enrolledCount })}</span>
          </div>
          <div className="public-course-card__meta-item">
            <BookOpen size={14} aria-hidden="true" />
            <span>
              {t('instructor.courses.lessonsSummary', {
                published: publishedCount,
                total: allLessons.length,
              })}
            </span>
          </div>
          <div className="public-course-card__meta-item">
            <Clock size={14} aria-hidden="true" />
            <span>
              {t('instructor.courses.lastUpdated')} {course.lastUpdated[locale]}
            </span>
          </div>
        </div>
      </div>

      <div className="public-course-card__footer" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link
          to={`/instructor/courses/${course.slug}`}
          className="ui-btn ui-btn--primary ui-btn--sm"
          style={{ flex: 1 }}
        >
          {t('instructor.courses.manageBtn')}
        </Link>
        <Link
          to={`/instructor/courses/${course.slug}/lessons`}
          className="ui-btn ui-btn--secondary ui-btn--sm"
        >
          {t('instructor.courses.lessonsBtn')}
        </Link>
      </div>
    </Card>
  );
}
