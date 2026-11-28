import {
  CheckCircle2,
  FileText,
  FolderSearch,
  Lock,
  PlayCircle,
  Target,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import {
  CourseCard,
  DisciplineIcon,
  InstructorCard,
  SectionHeading,
} from '../../../components/shared';
import { Alert, Badge, Card, EmptyState } from '../../../components/ui';

export function CourseDetailsPage() {
  const { slug = '' } = useParams();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { courses, disciplines, instructors: allInstructors } = usePlatformDemo();

  const course = courses.find((c) => c.slug === slug && c.status === 'published');

  if (!course) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            icon={<FolderSearch size={24} />}
            title={t('courseDetails.notFoundTitle')}
            description={t('courseDetails.notFoundDescription')}
            action={
              <Link to="/courses" className="ui-btn ui-btn--primary ui-btn--md">
                {t('common.backToCourses')}
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const discipline = disciplines.find((d) => d.slug === course.disciplineSlug);
  const instructors = course.instructorSlugs
    .map((s) => allInstructors.find((i) => i.slug === s))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));
  const relatedCourses = courses
    .filter((c) => c.slug !== course.slug && c.status === 'published')
    .slice(0, 3);

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/courses">{t('nav.courses')}</Link>
              {discipline ? (
                <>
                  <span aria-hidden="true">/</span>
                  <Link to={`/disciplines/${discipline.slug}`}>{discipline.name[locale]}</Link>
                </>
              ) : null}
            </nav>

            <div className="section-header__meta">
              {discipline ? <Badge variant="brand">{discipline.name[locale]}</Badge> : null}
              <Badge variant="teal">{t(`common.levels.${course.level}`)}</Badge>
              <Badge variant="orange">{t('common.demoBadge')}</Badge>
            </div>

            <h1 className="text-display">{course.title[locale]}</h1>
            <p className="hero__subtitle">{course.fullDescription[locale]}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container details-layout">
          {/* Main Content */}
          <div className="details-stack">
            {/* What You Will Learn */}
            <Card>
              <h2 className="text-h2" style={{ marginBlockEnd: 16 }}>
                {t('courseDetails.whatYouLearnTitle')}
              </h2>
              <ul className="benefit-list">
                {course.whatYouWillLearn.map((item, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <CheckCircle2 size={18} className="benefit-list__icon" aria-hidden="true" />
                    <span>{item[locale]}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Objectives */}
            <Card>
              <h2 className="text-h2" style={{ marginBlockEnd: 16 }}>
                {t('courseDetails.objectivesTitle')}
              </h2>
              <ul className="benefit-list">
                {course.objectives.map((item, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <Target size={18} className="benefit-list__icon" aria-hidden="true" />
                    <span>{item[locale]}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Curriculum Preview */}
            <div className="details-stack" style={{ gap: 14 }}>
              <h2 className="text-h2">{t('courseDetails.curriculumTitle')}</h2>
              {course.modules.map((mod) => {
                const visibleLessons = mod.lessons.filter((l) => l.status === 'published');
                return (
                <div key={mod.id} className="curriculum-module">
                  <div className="curriculum-module__head">
                    <span>{mod.title[locale]}</span>
                    <Badge variant="neutral">
                      {visibleLessons.length > 0
                        ? t('common.lessonsCount', { count: visibleLessons.length })
                        : locale === 'ar'
                          ? 'محتوى للمسجلين'
                          : 'Enrolled Content'}
                    </Badge>
                  </div>
                  <ul className="curriculum-lessons">
                    {visibleLessons.length > 0 ? (
                      visibleLessons.map((lesson) => (
                      <li key={lesson.id} className="curriculum-lesson">
                        <div className="curriculum-lesson__left">
                          {lesson.isPreview ? (
                            <PlayCircle size={18} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
                          ) : (
                            <Lock size={16} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                          )}
                          <span>{lesson.title[locale]}</span>
                        </div>
                        <div className="section-header__meta">
                          {lesson.isPreview ? (
                            <Badge variant="teal">{t('common.freePreview')}</Badge>
                          ) : null}
                          <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                            {t('common.minutesShort', { count: lesson.durationMinutes })}
                          </span>
                        </div>
                      </li>
                      ))
                    ) : (
                      <li className="curriculum-lesson">
                        <div className="curriculum-lesson__left">
                          <Lock size={15} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                          <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                            {locale === 'ar'
                              ? 'تُفتح دروس هذه الوحدة بعد اعتماد الالتحاق وتأكيد الدفع المباشر.'
                              : 'Lessons in this module unlock after enrollment approval and direct payment confirmation.'}
                          </span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                );
              })}
            </div>

            {/* Requirements & Target Audience */}
            <div className="grid-2">
              <Card>
                <h2 className="text-h3" style={{ marginBlockEnd: 12 }}>
                  {t('courseDetails.requirementsTitle')}
                </h2>
                <ul className="benefit-list">
                  {course.requirements.map((req, idx) => (
                    <li key={idx} className="benefit-list__item">
                      <CheckCircle2 size={16} className="benefit-list__icon" aria-hidden="true" />
                      <span>{req[locale]}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <h2 className="text-h3" style={{ marginBlockEnd: 12 }}>
                  {t('courseDetails.audienceTitle')}
                </h2>
                <ul className="benefit-list">
                  {course.targetAudience.map((aud, idx) => (
                    <li key={idx} className="benefit-list__item">
                      <Users size={16} className="benefit-list__icon" aria-hidden="true" />
                      <span>{aud[locale]}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Resources Preview */}
            <Card>
              <h2 className="text-h2" style={{ marginBlockEnd: 14 }}>
                {t('courseDetails.resourcesTitle')}
              </h2>
              <ul className="benefit-list">
                {course.resources.map((res) => (
                  <li key={res.id} className="benefit-list__item" style={{ alignItems: 'center' }}>
                    <FileText size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ flex: 1 }}>{res.title[locale]}</span>
                    <Badge variant="neutral">{t(`common.resourceTypes.${res.type}`)}</Badge>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Instructors */}
            <div className="details-stack" style={{ gap: 14 }}>
              <h2 className="text-h2">{t('courseDetails.instructorsTitle')}</h2>
              <div className="grid-2">
                {instructors.map((inst) => (
                  <InstructorCard key={inst.slug} instructor={inst} />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="details-sidebar">
            <Card className="details-stack" style={{ gap: 16 }}>
              <div className={`public-course-card__visual accent-surface--${course.accent}`}>
                <div className={`public-course-card__emblem accent-badge--${course.accent}`}>
                  <DisciplineIcon name={discipline?.iconName ?? 'code'} size={32} />
                </div>
              </div>

              <div className="meta-kv-list">
                <div className="meta-kv-row">
                  <span>{t('courseDetails.courseCode')}</span>
                  <span>
                    <bdi className="ltr-inline">{course.code}</bdi>
                  </span>
                </div>
                <div className="meta-kv-row">
                  <span>{t('courseDetails.level')}</span>
                  <span>{t(`common.levels.${course.level}`)}</span>
                </div>
                <div className="meta-kv-row">
                  <span>{t('courseDetails.duration')}</span>
                  <span>{course.duration[locale]}</span>
                </div>
                {discipline ? (
                  <div className="meta-kv-row">
                    <span>{t('courseDetails.discipline')}</span>
                    <span>{discipline.name[locale]}</span>
                  </div>
                ) : null}
                <div className="meta-kv-row">
                  <span>{locale === 'ar' ? 'الرسوم' : 'Price'}</span>
                  <strong>
                    {course.pricing.isFree
                      ? t('admin.paymentStatuses.not_required')
                      : `${course.pricing.priceAmount.toLocaleString()} ${course.pricing.currency}`}
                  </strong>
                </div>
                <div className="meta-kv-row">
                  <span>{locale === 'ar' ? 'حالة التسجيل' : 'Enrollment'}</span>
                  <Badge variant={course.pricing.enrollmentOpen ? 'success' : 'neutral'}>
                    {course.pricing.enrollmentOpen
                      ? locale === 'ar'
                        ? 'التسجيل مفتوح'
                        : 'Enrollment Open'
                      : locale === 'ar'
                        ? 'التسجيل مغلق'
                        : 'Enrollment Closed'}
                  </Badge>
                </div>
              </div>

              {course.pricing.enrollmentOpen ? (
                <Link
                  to={user ? `/student/explore-courses/${course.slug}` : '/login'}
                  className="ui-btn ui-btn--primary ui-btn--lg"
                  style={{ textAlign: 'center' }}
                >
                  {user
                    ? locale === 'ar'
                      ? 'طلب الالتحاق بالدورة'
                      : 'Request Enrollment'
                    : locale === 'ar'
                      ? 'سجّل الدخول لطلب الالتحاق'
                      : 'Sign In to Request Enrollment'}
                </Link>
              ) : (
                <Alert variant="warning" title={locale === 'ar' ? 'التسجيل مغلق حاليًا' : 'Enrollment Currently Closed'} />
              )}

              <Alert
                variant="info"
                title={locale === 'ar' ? 'الدفع المباشر مع المدرب' : 'Direct-to-Instructor Payment'}
              >
                {course.pricing.paymentInstructions[locale]}
              </Alert>
            </Card>
          </aside>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 ? (
        <section className="section surface-band">
          <div className="container">
            <SectionHeading
              eyebrow={t('nav.courses')}
              demoBadge={t('common.demoBadge')}
              title={t('courseDetails.relatedTitle')}
            />
            <div className="grid-3">
              {relatedCourses.map((rel) => (
                <CourseCard key={rel.slug} course={rel} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
