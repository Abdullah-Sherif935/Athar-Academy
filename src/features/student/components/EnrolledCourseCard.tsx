import { Clock, Play, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { DisciplineIcon } from '../../../components/shared';
import { Badge, Card } from '../../../components/ui';
import type { EnrolledCourseRecord } from '../../../data/mock/student';
import { useStudentDemo } from '../context/StudentDemoContext';
import { CourseProgressBar } from './CourseProgressBar';

export function EnrolledCourseCard({ record }: { record: EnrolledCourseRecord }) {
  const { t, locale } = useI18n();
  const { courses, disciplines, instructors: allInstructors } = usePlatformDemo();
  const { getCourseProgress } = useStudentDemo();
  const course = courses.find((c) => c.slug === record.courseSlug);

  if (!course) return null;

  const discipline = disciplines.find((d) => d.slug === course.disciplineSlug);
  const instructors = allInstructors.filter((i) => course.instructorSlugs.includes(i.slug));
  const { completed, total, percent } = getCourseProgress(course.slug);
  const isCompleted = total > 0 && completed >= total;

  return (
    <Card interactive className="public-course-card">
      <div className={`public-course-card__visual accent-surface--${course.accent}`}>
        <div className="public-course-card__visual-top">
          {discipline ? <Badge variant="brand">{discipline.name[locale]}</Badge> : null}
          <Badge variant={isCompleted ? 'success' : 'teal'}>
            {isCompleted ? t('student.myLearning.filterCompleted') : `${percent}%`}
          </Badge>
        </div>
        <div className={`public-course-card__emblem accent-badge--${course.accent}`}>
          <DisciplineIcon name={discipline?.iconName ?? 'code'} size={28} />
        </div>
      </div>

      <div className="public-course-card__content">
        <h3 className="text-h3">
          <Link to={`/student/courses/${course.slug}`} className="card-title-link">
            {course.title[locale]}
          </Link>
        </h3>

        <div className="public-course-card__meta">
          <div className="public-course-card__meta-item">
            <User size={15} aria-hidden="true" />
            <span>{instructors.map((i) => i.name[locale]).join(' · ')}</span>
          </div>
          <div className="public-course-card__meta-item">
            <Clock size={15} aria-hidden="true" />
            <span>
              {t('student.myLearning.lastAccessed')} {record.lastAccessedLabel[locale]}
            </span>
          </div>
        </div>

        <CourseProgressBar
          percent={percent}
          label={t('student.myLearning.lessonsProgress', { completed, total })}
        />
      </div>

      <div
        className="public-course-card__footer"
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <Link
          to={`/student/courses/${course.slug}/lessons/${record.lastLessonId}`}
          className="ui-btn ui-btn--primary ui-btn--sm"
          style={{ flex: 1 }}
        >
          <Play size={14} aria-hidden="true" />
          <span>{t('student.myLearning.continueBtn')}</span>
        </Link>
        <Link
          to={`/student/courses/${course.slug}`}
          className="ui-btn ui-btn--secondary ui-btn--sm"
        >
          {t('student.myLearning.overviewBtn')}
        </Link>
      </div>
    </Card>
  );
}
