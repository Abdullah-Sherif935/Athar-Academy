import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  FolderSearch,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Badge, Button, Card, EmptyState, Textarea } from '../../../components/ui';
import { CurriculumSidebar } from '../components/CurriculumSidebar';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { VideoPlaceholder } from '../components/VideoPlaceholder';
import { useStudentDemo } from '../context/StudentDemoContext';

export function LessonClassroomPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { t, locale, dir } = useI18n();
  const { courses } = usePlatformDemo();
  const {
    enrolledCourses,
    isLessonUnlocked,
    toggleLessonComplete,
    lessonNotes,
    saveLessonNote,
  } = useStudentDemo();

  const course = courses.find((c) => c.slug === courseId);
  const record = enrolledCourses.find((e) => e.courseSlug === courseId);
  const noteKey = `${courseId}:${lessonId}`;
  const [draftNote, setDraftNote] = useState(lessonNotes[noteKey] ?? '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [resourceAlert, setResourceAlert] = useState(false);

  useEffect(() => {
    setDraftNote(lessonNotes[noteKey] ?? '');
    setNoteSaved(false);
    setResourceAlert(false);
  }, [noteKey, lessonNotes]);

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

  const allLessons = course.modules.flatMap((mod) =>
    mod.lessons.filter((l) => l.status === 'published'),
  );
  const currentLesson = allLessons.find((l) => l.id === lessonId) ?? allLessons[0];
  const flatIds = allLessons.map((l) => l.id);
  const currentIdx = currentLesson ? flatIds.indexOf(currentLesson.id) : -1;
  const prevId = currentIdx > 0 ? flatIds[currentIdx - 1] : null;
  const nextId = currentIdx >= 0 && currentIdx < flatIds.length - 1 ? flatIds[currentIdx + 1] : null;

  if (!currentLesson) return null;

  const isCompleted = record.completedLessonIds.includes(currentLesson.id);
  const unlocked = isLessonUnlocked(course.slug, currentLesson.id);
  const nextUnlocked = nextId ? isLessonUnlocked(course.slug, nextId) : false;

  const PrevArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const NextArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={currentLesson.title[locale]}
        breadcrumbs={[
          { label: t('student.nav.myLearning'), to: '/student/my-learning' },
          { label: course.title[locale], to: `/student/courses/${course.slug}` },
          { label: currentLesson.title[locale] },
        ]}
      />

      <div className="classroom-layout">
        <div className="details-stack">
          {!unlocked ? (
            <Alert variant="warning" title={t('student.classroom.lockedBannerTitle')}>
              {t('student.classroom.lockedBannerBody')}
            </Alert>
          ) : (
            <VideoPlaceholder
              lessonTitle={currentLesson.title[locale]}
              videoSourceId={currentLesson.videoSourceId}
            />
          )}

          {/* Action Bar */}
          <Card>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <Button
                variant={isCompleted ? 'secondary' : 'primary'}
                size="md"
                disabled={!unlocked}
                onClick={() => toggleLessonComplete(course.slug, currentLesson.id)}
              >
                <CheckCircle2 size={16} aria-hidden="true" />{' '}
                {isCompleted ? t('student.classroom.completedBtn') : t('student.classroom.markComplete')}
              </Button>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!prevId}
                  onClick={() => prevId && navigate(`/student/courses/${course.slug}/lessons/${prevId}`)}
                >
                  <PrevArrow size={15} aria-hidden="true" /> {t('student.classroom.prevLesson')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!nextId || !nextUnlocked}
                  onClick={() => nextId && navigate(`/student/courses/${course.slug}/lessons/${nextId}`)}
                >
                  {t('student.classroom.nextLesson')} <NextArrow size={15} aria-hidden="true" />
                </Button>
              </div>
            </div>

            <p className="text-caption" style={{ marginBlockStart: 12 }}>
              {t('student.classroom.demoProgressNote')}
            </p>
          </Card>

          {/* Resources */}
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('student.classroom.resourcesTitle')}</h2>
            <ul className="benefit-list">
              {(currentLesson.lessonResources ?? []).map((res) => (
                <li
                  key={res.id}
                  className="benefit-list__item"
                  style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} style={{ color: 'var(--brand-teal)' }} aria-hidden="true" />
                    <span>{res.title[locale]}</span>
                    <Badge variant="teal">{res.type.toUpperCase()}</Badge>
                  </div>
                  <Button variant="tertiary" size="sm" onClick={() => setResourceAlert(true)}>
                    <Download size={14} aria-hidden="true" /> {t('student.classroom.downloadDemo')}
                  </Button>
                </li>
              ))}
              {course.resources.map((res) => (
                <li
                  key={res.id}
                  className="benefit-list__item"
                  style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
                    <span>{res.title[locale]}</span>
                    <Badge variant="neutral">{t(`common.resourceTypes.${res.type}`)}</Badge>
                  </div>
                  <Button variant="tertiary" size="sm" onClick={() => setResourceAlert(true)}>
                    <Download size={14} aria-hidden="true" /> {t('student.classroom.downloadDemo')}
                  </Button>
                </li>
              ))}
            </ul>
            {resourceAlert ? (
              <Alert variant="info" title={t('common.demoBadge')}>
                {t('student.classroom.downloadDemoAlert')}
              </Alert>
            ) : null}
          </Card>

          {/* Lesson Notes */}
          <Card className="details-stack" style={{ gap: 12 }}>
            <Textarea
              label={t('student.classroom.notesTitle')}
              placeholder={t('student.classroom.notesPlaceholder')}
              value={draftNote}
              onChange={(event) => {
                setDraftNote(event.target.value);
                setNoteSaved(false);
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  saveLessonNote(course.slug, currentLesson.id, draftNote);
                  setNoteSaved(true);
                }}
              >
                {t('student.classroom.saveNote')}
              </Button>
              {noteSaved ? <Badge variant="success">{t('student.classroom.noteSaved')}</Badge> : null}
            </div>
          </Card>
        </div>

        {/* Curriculum Sidebar */}
        <aside className="details-sidebar">
          <CurriculumSidebar course={course} activeLessonId={currentLesson.id} />
        </aside>
      </div>
    </div>
  );
}
