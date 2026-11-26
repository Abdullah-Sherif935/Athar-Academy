import { useI18n } from '../../../app/providers/I18nProvider';
import { Card } from '../../../components/ui';
import type { PlatformCourse } from '../../../data/mock/admin';
import { useStudentDemo } from '../context/StudentDemoContext';
import { CourseProgressBar } from './CourseProgressBar';
import { LessonItem } from './LessonItem';

export function CurriculumSidebar({
  course,
  activeLessonId,
}: {
  course: PlatformCourse;
  activeLessonId?: string;
}) {
  const { t, locale } = useI18n();
  const { enrolledCourses, isLessonUnlocked, getCourseProgress } = useStudentDemo();
  const record = enrolledCourses.find((e) => e.courseSlug === course.slug);
  const completedIds = record?.completedLessonIds ?? [];
  const { completed, total, percent } = getCourseProgress(course.slug);

  return (
    <Card className="details-stack" style={{ gap: 16 }}>
      <div>
        <h2 className="text-h3" style={{ marginBlockEnd: 10 }}>
          {t('student.classroom.curriculumTitle')}
        </h2>
        <CourseProgressBar
          percent={percent}
          label={t('student.myLearning.lessonsProgress', { completed, total })}
        />
      </div>

      {course.modules.map((mod) => {
        const publishedLessons = mod.lessons.filter((l) => l.status === 'published');
        if (publishedLessons.length === 0) return null;
        return (
          <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              className="text-caption"
              style={{ fontWeight: 700, color: 'var(--text-secondary)' }}
            >
              {mod.title[locale]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {publishedLessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  courseSlug={course.slug}
                  lessonId={lesson.id}
                  title={lesson.title[locale]}
                  durationMinutes={lesson.durationMinutes}
                  isCompleted={completedIds.includes(lesson.id)}
                  isUnlocked={isLessonUnlocked(course.slug, lesson.id)}
                  isActive={lesson.id === activeLessonId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
