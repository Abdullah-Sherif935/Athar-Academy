import {
  BookOpen,
  Edit3,
  Eye,
  FileText,
  FolderSearch,
  ListChecks,
  MessageSquare,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { DisciplineIcon } from '../../../components/shared';
import { Alert, Badge, Button, Card, EmptyState } from '../../../components/ui';
import { instructorSubmitCourseForReview } from '../../../services/courseWorkflowService';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { useInstructorDemo } from '../context/InstructorDemoContext';

type WorkspaceTab = 'overview' | 'info' | 'curriculum' | 'resources' | 'submission';

export function InstructorCourseManagementPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const { disciplines, instructors, getCourseDbId, refreshLiveCatalog } = usePlatformDemo();
  const {
    getAssignedCourse,
    isInstructorDisabled,
    students,
    submitCourseForReview,
  } = useInstructorDemo();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [submittedMsg, setSubmittedMsg] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isInstructorDisabled) {
    return (
      <Alert variant="error" title={t('instructor.selfService.revokedTitle')}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={16} aria-hidden="true" />
          {t('instructor.selfService.revokedBody')}
        </span>
      </Alert>
    );
  }

  const course = getAssignedCourse(courseId);

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

  const discipline = disciplines.find((d) => d.slug === course.disciplineSlug);
  const enrolledStudents = students.filter((s) =>
    s.enrollments.some((e) => e.courseSlug === course.slug),
  );

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const publishedLessons = allLessons.filter((l) => l.status === 'published').length;
  const draftLessons = allLessons.filter((l) => l.status === 'draft').length;
  const pendingLessons = allLessons.filter(
    (l) => l.status === 'pending_approval' || l.pendingRevision?.status === 'pending_approval',
  ).length;
  const allLessonResources = course.modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      (l.lessonResources ?? []).map((r) => ({ ...r, lessonTitle: l.title[locale], lessonId: l.id })),
    ),
  );

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={course.title[locale]}
        subtitle={course.shortDescription[locale]}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: course.title[locale] },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              to={`/instructor/courses/${course.slug}/curriculum`}
              className="ui-btn ui-btn--primary ui-btn--sm"
            >
              <ListChecks size={15} aria-hidden="true" />{' '}
              {t('instructor.selfService.workspace.openCurriculumBuilder')}
            </Link>
            <Link
              to={`/instructor/courses/${course.slug}/preview`}
              className="ui-btn ui-btn--secondary ui-btn--sm"
            >
              <Eye size={15} aria-hidden="true" />{' '}
              {t('instructor.selfService.workspace.openCoursePreview')}
            </Link>
            <Link
              to={`/instructor/courses/${course.slug}/edit`}
              className="ui-btn ui-btn--secondary ui-btn--sm"
            >
              <Edit3 size={15} aria-hidden="true" /> {t('instructor.courses.editBtn')}
            </Link>
            <Link
              to={`/instructor/community/${course.slug}`}
              className="ui-btn ui-btn--secondary ui-btn--sm"
            >
              <MessageSquare size={15} aria-hidden="true" /> {t('instructor.courses.communityBtn')}
            </Link>
          </div>
        }
      />

      {course.suspended ? (
        <Alert variant="error" title={t('instructor.selfService.suspendedTitle')}>
          {t('instructor.selfService.suspendedBody')}
        </Alert>
      ) : null}

      {/* KPI Strip */}
      <div className="admin-stats-grid">
        <Card className="student-stat-card">
          <span className="student-stat-card__label">
            {t('instructor.selfService.workspace.modulesCount')}
          </span>
          <div className="student-stat-card__value">{course.modules.length}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">
            {t('instructor.selfService.workspace.lessonsCount')}
          </span>
          <div className="student-stat-card__value">{allLessons.length}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">
            {t('instructor.selfService.workspace.publishedLessons')}
          </span>
          <div className="student-stat-card__value">{publishedLessons}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">
            {t('instructor.selfService.workspace.draftLessons')}
          </span>
          <div className="student-stat-card__value">{draftLessons}</div>
        </Card>
        <Card className="student-stat-card">
          <span className="student-stat-card__label">
            {t('instructor.selfService.workspace.pendingApprovals')}
          </span>
          <div className="student-stat-card__value">{pendingLessons}</div>
        </Card>
      </div>

      {/* Workspace Section Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="tablist">
        {(
          [
            ['overview', t('instructor.selfService.workspace.tabs.overview')],
            ['info', t('instructor.selfService.workspace.tabs.info')],
            ['curriculum', t('instructor.selfService.workspace.tabs.curriculum')],
            ['resources', t('instructor.selfService.workspace.tabs.resources')],
            ['submission', t('instructor.selfService.workspace.tabs.submission')],
          ] as Array<[WorkspaceTab, string]>
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={activeTab === key ? 'primary' : 'secondary'}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </Button>
        ))}
        <Link
          to={`/instructor/courses/${course.slug}/preview`}
          className="ui-btn ui-btn--tertiary ui-btn--sm"
        >
          <Eye size={14} aria-hidden="true" /> {t('instructor.selfService.workspace.tabs.preview')}
        </Link>
      </div>

      <div className="details-layout">
        <div className="details-stack">
          {(activeTab === 'overview' || activeTab === 'curriculum') ? (
            <Card className="details-stack" style={{ gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 className="text-h3">{t('courseDetails.curriculumTitle')}</h2>
                <Link
                  to={`/instructor/courses/${course.slug}/curriculum`}
                  className="ui-btn ui-btn--primary ui-btn--sm"
                >
                  <BookOpen size={14} aria-hidden="true" />{' '}
                  {t('instructor.selfService.workspace.openCurriculumBuilder')}
                </Link>
              </div>
              {course.modules.map((mod) => (
                <div key={mod.id} className="curriculum-module">
                  <div className="curriculum-module__head">
                    <span>{mod.title[locale]}</span>
                    <Badge variant="neutral">
                      {t('common.lessonsCount', { count: mod.lessons.length })}
                    </Badge>
                  </div>
                  <ul className="curriculum-lessons">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id} className="curriculum-lesson">
                        <Link
                          to={`/instructor/courses/${course.slug}/lessons/${lesson.id}`}
                          className="card-title-link"
                          style={{ fontWeight: 500 }}
                        >
                          {lesson.title[locale]}
                        </Link>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          {lesson.pendingRevision ? (
                            <Badge variant="brand">
                              {lesson.pendingRevision.status === 'pending_approval'
                                ? t('instructor.selfService.curriculum.pendingRevisionBadge')
                                : t('instructor.selfService.curriculum.draftRevisionBadge')}
                            </Badge>
                          ) : null}
                          <LessonStatusBadge status={lesson.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card>
          ) : null}

          {activeTab === 'info' ? (
            <Card className="details-stack" style={{ gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 className="text-h3">{t('instructor.selfService.workspace.tabs.info')}</h2>
                <Link
                  to={`/instructor/courses/${course.slug}/edit`}
                  className="ui-btn ui-btn--primary ui-btn--sm"
                >
                  <Edit3 size={14} aria-hidden="true" /> {t('instructor.courses.editBtn')}
                </Link>
              </div>
              <p className="text-body">{course.fullDescription[locale]}</p>
              <Alert variant="info" title={t('instructor.courses.assignedInstructors')}>
                {t('instructor.selfService.workspace.adminControlledNote')}
              </Alert>
            </Card>
          ) : null}

          {(activeTab === 'overview' || activeTab === 'resources') ? (
            <Card className="details-stack" style={{ gap: 12 }}>
              <h2 className="text-h3">{t('student.courseOverview.resourcesTitle')}</h2>
              <ul className="benefit-list">
                {allLessonResources.map((res) => (
                  <li key={res.id} className="benefit-list__item" style={{ alignItems: 'center' }}>
                    <FileText size={16} style={{ color: 'var(--brand-teal)' }} aria-hidden="true" />
                    <span style={{ flex: 1 }}>
                      {res.title[locale]} — <small>{res.lessonTitle}</small>
                    </span>
                    <Badge variant="teal">{res.type.toUpperCase()}</Badge>
                  </li>
                ))}
                {course.resources.map((res) => (
                  <li key={res.id} className="benefit-list__item" style={{ alignItems: 'center' }}>
                    <FileText size={16} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
                    <span style={{ flex: 1 }}>{res.title[locale]}</span>
                    <Badge variant="neutral">{t(`common.resourceTypes.${res.type}`)}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {activeTab === 'submission' ? (
            <Card className="details-stack" style={{ gap: 14 }}>
              <h2 className="text-h3">{t('instructor.selfService.workspace.tabs.submission')}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <LessonStatusBadge status={course.status} />
                {course.pendingApproval ? (
                  <Badge variant="warning">{t('admin.statuses.pending_approval')}</Badge>
                ) : null}
                {course.suspended ? (
                  <Badge variant="error">{t('admin.approvals.suspendedBadge')}</Badge>
                ) : null}
              </div>
              {course.pendingApproval ? (
                <Alert variant="info" title={t('admin.statuses.pending_approval')}>
                  {t('instructor.selfService.workspace.submittedForReviewNote')}
                </Alert>
              ) : null}
              {submittedMsg ? (
                <Alert variant="success" title={t('admin.statuses.pending_approval')}>
                  {t('instructor.selfService.workspace.submittedForReviewNote')}
                </Alert>
              ) : null}
              {submitError ? <Alert variant="error" title={submitError} /> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  to={`/instructor/courses/${course.slug}/preview`}
                  className="ui-btn ui-btn--secondary ui-btn--md"
                >
                  <Eye size={15} aria-hidden="true" />{' '}
                  {t('instructor.selfService.workspace.openCoursePreview')}
                </Link>
                <Button
                  variant="primary"
                  disabled={
                    submitBusy || Boolean(course.suspended) || Boolean(course.pendingApproval)
                  }
                  onClick={async () => {
                    setSubmitError(null);
                    const courseDbId = getCourseDbId(course.slug);
                    if (courseDbId) {
                      setSubmitBusy(true);
                      const { error: subErr } = await instructorSubmitCourseForReview(courseDbId);
                      setSubmitBusy(false);
                      if (subErr) {
                        setSubmitError(subErr);
                        return;
                      }
                      await refreshLiveCatalog();
                    }
                    submitCourseForReview(course.slug);
                    setSubmittedMsg(true);
                  }}
                >
                  <Send size={15} aria-hidden="true" />{' '}
                  {submitBusy
                    ? locale === 'ar'
                      ? 'جارٍ الإرسال...'
                      : 'Submitting...'
                    : t('instructor.selfService.workspace.submitForReviewBtn')}
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 14 }}>
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

            <div className="meta-kv-list">
              <div className="meta-kv-row">
                <span>{t('courseDetails.level')}</span>
                <span>{t(`common.levels.${course.level}`)}</span>
              </div>
              <div className="meta-kv-row">
                <span>{t('courseDetails.duration')}</span>
                <span>{course.duration[locale]}</span>
              </div>
              <div className="meta-kv-row">
                <span>{t('instructor.selfService.workspace.lastUpdated')}</span>
                <span>{course.lastUpdated[locale]}</span>
              </div>
              <div className="meta-kv-row">
                <span>{t('instructor.analytics.enrolledLabel')}</span>
                <span>{enrolledStudents.length}</span>
              </div>
            </div>
          </Card>

          <Card className="details-stack" style={{ gap: 10 }}>
            <h2 className="text-h3">{t('instructor.courses.assignedInstructors')}</h2>
            {course.instructorSlugs.map((slug) => (
              <div
                key={slug}
                className="text-small"
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
              >
                <span>{instructors.find((i) => i.slug === slug)?.name[locale] ?? slug}</span>
                {course.leadInstructorSlug === slug ? <Badge variant="brand">Lead</Badge> : null}
              </div>
            ))}
            <p className="text-caption">{t('instructor.editCourse.assignedNote')}</p>
          </Card>

          <Card className="details-stack" style={{ gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-h3">{t('instructor.nav.students')}</h2>
              <Badge variant="brand">
                <Users size={12} aria-hidden="true" /> {enrolledStudents.length}
              </Badge>
            </div>
            {enrolledStudents.map((stu) => (
              <Link
                key={stu.id}
                to={`/instructor/students/${stu.id}`}
                className="lesson-item"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-subtle)' }}
              >
                <span className="text-small" style={{ fontWeight: 600 }}>
                  {stu.fullName[locale]}
                </span>
                <Badge variant="teal">
                  {stu.enrollments.find((e) => e.courseSlug === course.slug)?.percent ?? 0}%
                </Badge>
              </Link>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}
