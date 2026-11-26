import {
  CheckCircle2,
  FolderSearch,
  Lock,
  Play,
  PlayCircle,
  Target,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { DisciplineIcon } from '../../../components/shared';
import { Alert, Badge, Button, Card, EmptyState, Modal, Textarea } from '../../../components/ui';
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function StudentExploreCourseDetailsPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const { courses, disciplines, instructors: allInstructors } = usePlatformDemo();
  const { getCourseAvailability, getLatestRequestForCourse, requestEnrollment } = useStudentDemo();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentMessage, setStudentMessage] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);

  const course = courses.find((c) => c.slug === courseId && c.status === 'published');

  if (!course) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('courseDetails.notFoundTitle')}
        description={t('courseDetails.notFoundDescription')}
        action={
          <Link to="/student/explore-courses" className="ui-btn ui-btn--primary ui-btn--md">
            {t('student.explore.title')}
          </Link>
        }
      />
    );
  }

  const discipline = disciplines.find((d) => d.slug === course.disciplineSlug);
  const instructors = allInstructors.filter((i) => course.instructorSlugs.includes(i.slug));
  const related = courses
    .filter(
      (c) =>
        c.status === 'published' &&
        c.slug !== course.slug &&
        c.disciplineSlug === course.disciplineSlug,
    )
    .slice(0, 2);
  const availability = getCourseAvailability(course.slug);
  const latestRequest = getLatestRequestForCourse(course.slug);

  const handleConfirmRequest = () => {
    const res = requestEnrollment(course.slug, studentMessage);
    setConfirmOpen(false);
    setStudentMessage('');
    if (res.ok) {
      setJustSubmitted(true);
    }
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={course.fullDescription[locale]}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.explore.title'), to: '/student/explore-courses' },
          { label: course.title[locale] },
        ]}
        action={<EnrollmentStatusBadge status={availability} />}
      />

      {justSubmitted ? (
        <Alert variant="success" title={t('student.explore.requestSuccessTitle')}>
          {t('student.explore.requestSuccessBody')}
        </Alert>
      ) : null}

      <div className="details-layout">
        <div className="details-stack">
          {/* What You Will Learn */}
          <Card>
            <h2 className="text-h3" style={{ marginBlockEnd: 12 }}>
              {t('courseDetails.whatYouLearnTitle')}
            </h2>
            <ul className="benefit-list">
              {course.whatYouWillLearn.map((item, idx) => (
                <li key={idx} className="benefit-list__item">
                  <CheckCircle2 size={17} className="benefit-list__icon" aria-hidden="true" />
                  <span>{item[locale]}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Objectives */}
          <Card>
            <h2 className="text-h3" style={{ marginBlockEnd: 12 }}>
              {t('courseDetails.objectivesTitle')}
            </h2>
            <ul className="benefit-list">
              {course.objectives.map((item, idx) => (
                <li key={idx} className="benefit-list__item">
                  <Target size={17} className="benefit-list__icon" aria-hidden="true" />
                  <span>{item[locale]}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Curriculum Preview */}
          <div className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('courseDetails.curriculumTitle')}</h2>
            {course.modules.map((mod) => {
              const publishedLessons = mod.lessons.filter((l) => l.status === 'published');
              if (publishedLessons.length === 0) return null;
              return (
              <div key={mod.id} className="curriculum-module">
                <div className="curriculum-module__head">
                  <span>{mod.title[locale]}</span>
                  <Badge variant="neutral">
                    {t('common.lessonsCount', { count: publishedLessons.length })}
                  </Badge>
                </div>
                <ul className="curriculum-lessons">
                  {publishedLessons.map((lesson) => (
                    <li key={lesson.id} className="curriculum-lesson">
                      <div className="curriculum-lesson__left">
                        {availability === 'enrolled' || lesson.isPreview ? (
                          <PlayCircle size={17} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
                        ) : (
                          <Lock size={15} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                        )}
                        <span>{lesson.title[locale]}</span>
                      </div>
                      <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        {t('common.minutesShort', { count: lesson.durationMinutes })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>

          {/* Requirements & Audience */}
          <div className="grid-2">
            <Card>
              <h2 className="text-h3" style={{ marginBlockEnd: 10 }}>
                {t('courseDetails.requirementsTitle')}
              </h2>
              <ul className="benefit-list">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <CheckCircle2 size={15} className="benefit-list__icon" aria-hidden="true" />
                    <span>{req[locale]}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="text-h3" style={{ marginBlockEnd: 10 }}>
                {t('courseDetails.audienceTitle')}
              </h2>
              <ul className="benefit-list">
                {course.targetAudience.map((aud, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <Users size={15} className="benefit-list__icon" aria-hidden="true" />
                    <span>{aud[locale]}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Enrollment Action Sidebar */}
        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 16 }}>
            <div className={`public-course-card__visual accent-surface--${course.accent}`}>
              <div className={`public-course-card__emblem accent-badge--${course.accent}`}>
                <DisciplineIcon name={discipline?.iconName ?? 'code'} size={30} />
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
              <div className="meta-kv-row">
                <span>{t('student.explore.instructorFilter')}</span>
                <span>{instructors.map((i) => i.name[locale]).join(' · ')}</span>
              </div>
              <div className="meta-kv-row">
                <span>{t('admin.enrollmentOversight.priceColumn')}</span>
                <strong>
                  {course.pricing.isFree
                    ? t('admin.paymentStatuses.not_required')
                    : `${course.pricing.priceAmount.toLocaleString()} ${course.pricing.currency}`}
                </strong>
              </div>
            </div>

            {availability === 'enrolled' ? (
              <Link
                to={`/student/courses/${course.slug}`}
                className="ui-btn ui-btn--primary ui-btn--lg"
              >
                <Play size={16} aria-hidden="true" /> {t('student.explore.actions.openCourse')}
              </Link>
            ) : availability === 'suspended' ? (
              <Alert variant="error" title={t('admin.statuses.suspended')}>
                {latestRequest?.reviewNote?.[locale] ?? t('admin.statuses.suspended')}
              </Alert>
            ) : availability === 'pending' || availability === 'awaiting_payment' ? (
              <>
                <Alert
                  variant={availability === 'awaiting_payment' ? 'info' : 'warning'}
                  title={
                    availability === 'awaiting_payment'
                      ? t('admin.statuses.awaiting_payment')
                      : t('student.explore.pendingBannerTitle')
                  }
                >
                  {availability === 'awaiting_payment'
                    ? course.pricing.paymentInstructions[locale]
                    : t('student.explore.pendingBannerBody', {
                        date: latestRequest?.requestedAt[locale] ?? '',
                      })}
                </Alert>
                <Link
                  to="/student/enrollment-requests"
                  className="ui-btn ui-btn--secondary ui-btn--md"
                >
                  {t('student.explore.actions.viewStatus')}
                </Link>
              </>
            ) : (
              <>
                {availability === 'rejected' ? (
                  <Alert variant="error" title={t('student.explore.rejectedBannerTitle')}>
                    {latestRequest?.reviewNote?.[locale] ?? t('student.explore.rejectedBannerBody')}
                  </Alert>
                ) : null}
                <Button variant="primary" size="lg" onClick={() => setConfirmOpen(true)}>
                  {t('student.explore.actions.requestEnrollment')}
                </Button>
              </>
            )}
          </Card>

          {related.length > 0 ? (
            <Card className="details-stack" style={{ gap: 10 }}>
              <h2 className="text-h3">{t('student.explore.relatedTitle')}</h2>
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/student/explore-courses/${rel.slug}`}
                  className="lesson-item"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-subtle)' }}
                >
                  <span className="text-small" style={{ fontWeight: 600 }}>
                    {rel.title[locale]}
                  </span>
                </Link>
              ))}
            </Card>
          ) : null}
        </aside>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('student.explore.confirmModal.title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              {t('student.explore.confirmModal.cancelBtn')}
            </Button>
            <Button variant="primary" onClick={handleConfirmRequest}>
              {t('student.explore.confirmModal.confirmBtn')}
            </Button>
          </>
        }
      >
        <div className="details-stack" style={{ gap: 12 }}>
          <div className="text-h3">{course.title[locale]}</div>
          <div className="meta-kv-list">
            <div className="meta-kv-row">
              <span>{t('admin.enrollmentOversight.priceColumn')}</span>
              <strong>
                {course.pricing.isFree
                  ? t('admin.paymentStatuses.not_required')
                  : `${course.pricing.priceAmount.toLocaleString()} ${course.pricing.currency}`}
              </strong>
            </div>
          </div>
          <Textarea
            label={t('instructor.selfService.proposal.enrollmentNotes')}
            rows={2}
            value={studentMessage}
            onChange={(e) => setStudentMessage(e.target.value)}
          />
          <Alert variant="info" title={t('instructor.selfService.enrollments.businessNoticeTitle')}>
            {course.pricing.paymentInstructions[locale]}
          </Alert>
        </div>
      </Modal>
    </div>
  );
}
