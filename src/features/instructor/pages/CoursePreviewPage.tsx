import { CheckCircle2, Eye, FileText, FolderSearch, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { YouTubeVideoPreview } from '../../../components/shared/YouTubeVideoPreview';
import { Alert, Badge, Card, EmptyState } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function CoursePreviewPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const { instructors } = usePlatformDemo();
  const { getAssignedCourse } = useInstructorDemo();

  const course = getAssignedCourse(courseId);
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    course?.modules[0]?.lessons[0]?.id ?? '',
  );

  if (!course) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('instructor.courses.notAssignedTitle')}
        description={t('instructor.courses.notAssignedDesc')}
        action={
          <Link to="/instructor/courses" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.courses.backToCourses')}
          </Link>
        }
      />
    );
  }

  const allLessons = course.modules.flatMap((m) =>
    m.lessons.filter((l) => includeDrafts || l.status === 'published'),
  );
  const activeLesson = allLessons.find((l) => l.id === selectedLessonId) ?? allLessons[0];
  const courseInstructors = instructors.filter((i) => course.instructorSlugs.includes(i.slug));

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={course.fullDescription[locale]}
        breadcrumbs={[
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: course.title[locale], to: `/instructor/courses/${course.slug}` },
          { label: t('instructor.selfService.workspace.tabs.preview') },
        ]}
        action={
          <Link
            to={`/instructor/courses/${course.slug}`}
            className="ui-btn ui-btn--secondary ui-btn--sm"
          >
            {t('instructor.selfService.preview.backToWorkspace')}
          </Link>
        }
      />

      <Alert variant="info" title={t('instructor.selfService.preview.bannerTitle')}>
        {t('instructor.selfService.preview.bannerBody')}
      </Alert>

      <Card>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeDrafts}
            onChange={(e) => setIncludeDrafts(e.target.checked)}
          />
          <span className="text-small">{t('instructor.selfService.preview.includeDraftsLabel')}</span>
        </label>
      </Card>

      <div className="details-layout">
        <div className="details-stack">
          {activeLesson ? (
            <Card className="details-stack" style={{ gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 className="text-h3">{activeLesson.title[locale]}</h2>
                <LessonStatusBadge status={activeLesson.status} />
              </div>

              <YouTubeVideoPreview
                videoId={activeLesson.videoSourceId}
                title={activeLesson.title[locale]}
              />

              <p className="text-body">{activeLesson.description[locale]}</p>

              {(activeLesson.lessonResources ?? []).length > 0 ? (
                <div className="details-stack" style={{ gap: 8 }}>
                  <h3 className="text-small" style={{ fontWeight: 700 }}>
                    {t('student.classroom.resourcesTitle')}
                  </h3>
                  <ul className="benefit-list">
                    {(activeLesson.lessonResources ?? []).map((res) => (
                      <li key={res.id} className="benefit-list__item">
                        <FileText size={15} style={{ color: 'var(--brand-teal)' }} aria-hidden="true" />
                        <span>{res.title[locale]}</span>
                        <Badge variant="neutral">{res.type.toUpperCase()}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          ) : (
            <Card>
              <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                {t('instructor.selfService.preview.selectLessonPrompt')}
              </p>
            </Card>
          )}

          <div className="grid-2">
            <Card className="details-stack" style={{ gap: 10 }}>
              <h2 className="text-h3">{t('courseDetails.whatYouLearnTitle')}</h2>
              <ul className="benefit-list">
                {course.whatYouWillLearn.map((item, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <CheckCircle2 size={16} className="benefit-list__icon" aria-hidden="true" />
                    <span>{item[locale]}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="details-stack" style={{ gap: 10 }}>
              <h2 className="text-h3">{t('courseDetails.requirementsTitle')}</h2>
              <ul className="benefit-list">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <CheckCircle2 size={16} className="benefit-list__icon" aria-hidden="true" />
                    <span>{req[locale]}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={17} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
              <h2 className="text-h3">{t('courseDetails.curriculumTitle')}</h2>
            </div>

            {course.modules.map((mod) => {
              const visibleLessons = mod.lessons.filter(
                (l) => includeDrafts || l.status === 'published',
              );
              return (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="text-caption" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {mod.title[locale]}
                  </div>
                  {visibleLessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className="lesson-item"
                      style={{
                        border:
                          lesson.id === activeLesson?.id
                            ? '1px solid var(--brand-blue)'
                            : '1px solid var(--border)',
                        background:
                          lesson.id === activeLesson?.id ? 'var(--surface)' : 'var(--surface-subtle)',
                        cursor: 'pointer',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textAlign: 'start' }}>
                        <PlayCircle size={15} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} aria-hidden="true" />
                        <span className="text-small">{lesson.title[locale]}</span>
                      </span>
                      <LessonStatusBadge status={lesson.status} />
                    </button>
                  ))}
                </div>
              );
            })}
          </Card>

          <Card className="details-stack" style={{ gap: 8 }}>
            <h2 className="text-h3">
              {locale === 'ar' ? 'التسعير وتعليمات الدفع المباشر' : 'Pricing & Direct Payment'}
            </h2>
            <div className="text-h3" style={{ color: 'var(--brand-blue)' }}>
              {course.pricing.isFree
                ? locale === 'ar'
                  ? 'مجانية'
                  : 'Free'
                : `${course.pricing.priceAmount.toLocaleString()} ${course.pricing.currency}`}
            </div>
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {course.pricing.paymentInstructions[locale]}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {course.pricing.paymentMethods.map((pm) => (
                <Badge key={pm} variant="neutral">
                  {pm}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="details-stack" style={{ gap: 8 }}>
            <h2 className="text-h3">{t('instructor.courses.assignedInstructors')}</h2>
            {courseInstructors.map((inst) => (
              <div key={inst.slug} className="text-small" style={{ fontWeight: 600 }}>
                {inst.name[locale]} — <span style={{ color: 'var(--text-secondary)' }}>{inst.title[locale]}</span>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}
