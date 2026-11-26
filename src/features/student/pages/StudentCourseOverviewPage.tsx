import { FileText, FolderSearch, MessageSquare, Play } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Card, EmptyState } from '../../../components/ui';
import { CourseProgressBar } from '../components/CourseProgressBar';
import { LessonItem } from '../components/LessonItem';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function StudentCourseOverviewPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const { courses, instructors: allInstructors } = usePlatformDemo();
  const { enrolledCourses, getCourseProgress, isLessonUnlocked } = useStudentDemo();

  const course = courses.find((c) => c.slug === courseId);
  const record = enrolledCourses.find((e) => e.courseSlug === courseId);

  if (!course || !record) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('student.courseOverview.notEnrolledTitle')}
        description={t('student.courseOverview.notEnrolledDesc')}
        action={
          <Link to="/student/my-learning" className="ui-btn ui-btn--primary ui-btn--md">
            {t('student.nav.myLearning')}
          </Link>
        }
      />
    );
  }

  const instructors = allInstructors.filter((i) => course.instructorSlugs.includes(i.slug));
  const { completed, total, percent } = getCourseProgress(course.slug);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={course.fullDescription[locale]}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.myLearning'), to: '/student/my-learning' },
          { label: course.title[locale] },
        ]}
        action={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to={`/student/community/${course.slug}`}
              className="ui-btn ui-btn--secondary ui-btn--md"
            >
              <MessageSquare size={16} aria-hidden="true" /> {t('student.courseOverview.communityBtn')}
            </Link>
            <Link
              to={`/student/courses/${course.slug}/lessons/${record.lastLessonId}`}
              className="ui-btn ui-btn--primary ui-btn--md"
            >
              <Play size={16} aria-hidden="true" /> {t('student.courseOverview.startNextBtn')}
            </Link>
          </div>
        }
      />

      <Card>
        <div className="details-stack" style={{ gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h2 className="text-h3">{t('student.courseOverview.overallProgress')}</h2>
              <p className="text-small" style={{ marginBlockStart: 4 }}>
                {instructors.map((i) => i.name[locale]).join(' · ')}
              </p>
            </div>
            <Badge variant="teal">
              {t('student.myLearning.lessonsProgress', { completed, total })}
            </Badge>
          </div>
          <CourseProgressBar percent={percent} label={t('student.courseOverview.overallProgress')} />
          <Alert variant="info" title={t('common.demoBadge')}>
            {t('student.courseOverview.sequentialNote')}
          </Alert>
        </div>
      </Card>

      <div className="details-layout">
        <div className="details-stack" style={{ gap: 16 }}>
          <h2 className="text-h2">{t('student.courseOverview.modulesTitle')}</h2>
          {course.modules.map((mod) => {
            const publishedLessons = mod.lessons.filter((l) => l.status === 'published');
            if (publishedLessons.length === 0) return null;
            return (
            <Card key={mod.id} className="details-stack" style={{ gap: 10 }}>
              <h3 className="text-h3">{mod.title[locale]}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {publishedLessons.map((lesson) => {
                  const isCompleted = record.completedLessonIds.includes(lesson.id);
                  const isUnlocked = isLessonUnlocked(course.slug, lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <LessonItem
                          courseSlug={course.slug}
                          lessonId={lesson.id}
                          title={lesson.title[locale]}
                          durationMinutes={lesson.durationMinutes}
                          isCompleted={isCompleted}
                          isUnlocked={isUnlocked}
                        />
                      </div>
                      <Badge
                        variant={isCompleted ? 'success' : isUnlocked ? 'brand' : 'neutral'}
                      >
                        {isCompleted
                          ? t('student.courseOverview.statusCompleted')
                          : isUnlocked
                            ? t('student.courseOverview.statusCurrent')
                            : t('student.courseOverview.statusLocked')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
            );
          })}
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('student.courseOverview.resourcesTitle')}</h2>
            <ul className="benefit-list">
              {course.resources.map((res) => (
                <li key={res.id} className="benefit-list__item" style={{ alignItems: 'center' }}>
                  <FileText size={16} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} aria-hidden="true" />
                  <span style={{ flex: 1 }}>{res.title[locale]}</span>
                  <Badge variant="neutral">{t(`common.resourceTypes.${res.type}`)}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
