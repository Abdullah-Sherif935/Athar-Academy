import { Megaphone, Save } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Badge, Button, Card, Input, Textarea } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function AnnouncementsPage() {
  const { t, locale } = useI18n();
  const { assignedCourses, announcements, createAnnouncement, publishAnnouncement } =
    useInstructorDemo();

  const [courseSlug, setCourseSlug] = useState(assignedCourses[0]?.slug ?? '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const selectedCourse = assignedCourses.find((c) => c.slug === courseSlug);

  const handleSave = (status: 'draft' | 'published') => {
    if (!courseSlug || !title.trim() || !body.trim()) return;
    createAnnouncement(courseSlug, title, body, status);
    setTitle('');
    setBody('');
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.announcements.title')}
        subtitle={t('instructor.announcements.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.announcements') },
        ]}
      />

      <div className="details-layout">
        <Card className="details-stack" style={{ gap: 14 }}>
          <h2 className="text-h3">{t('instructor.announcements.composerTitle')}</h2>
          <div className="ui-field">
            <label htmlFor="ann-course-select" className="ui-field__label">
              {t('instructor.announcements.selectCourse')}
            </label>
            <select
              id="ann-course-select"
              className="filter-select"
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
            >
              {assignedCourses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title[locale]}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t('instructor.announcements.titleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label={t('instructor.announcements.bodyLabel')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <Alert variant="info" title={t('common.demoBadge')}>
            {t('instructor.announcements.demoNote')}
          </Alert>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="md"
              disabled={!title.trim() || !body.trim()}
              onClick={() => handleSave('draft')}
            >
              <Save size={15} aria-hidden="true" /> {t('instructor.announcements.saveDraftBtn')}
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!title.trim() || !body.trim()}
              onClick={() => handleSave('published')}
            >
              <Megaphone size={15} aria-hidden="true" /> {t('instructor.announcements.publishBtn')}
            </Button>
          </div>
        </Card>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 10 }}>
            <h2 className="text-h3">{t('instructor.announcements.previewTitle')}</h2>
            {selectedCourse ? <Badge variant="brand">{selectedCourse.title[locale]}</Badge> : null}
            <div className="text-body" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {title || t('instructor.community.annTitlePlaceholder')}
            </div>
            <p className="text-small">{body || t('instructor.community.annBodyPlaceholder')}</p>
          </Card>
        </aside>
      </div>

      {/* History */}
      <Card className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h3">{t('instructor.announcements.historyTitle')}</h2>
        {announcements.map((ann) => {
          const c = assignedCourses.find((item) => item.slug === ann.courseSlug);
          return (
            <div
              key={ann.id}
              style={{
                padding: 14,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
                <div className="section-header__meta">
                  <LessonStatusBadge status={ann.status} />
                  {c ? <Badge variant="brand">{c.title[locale]}</Badge> : null}
                </div>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {ann.createdAt[locale]}
                </span>
              </div>
              <div className="text-body" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {ann.title[locale]}
              </div>
              <p className="text-small">{ann.body[locale]}</p>
              {ann.status === 'draft' ? (
                <div>
                  <Button variant="primary" size="sm" onClick={() => publishAnnouncement(ann.id)}>
                    {t('instructor.announcements.publishNow')}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
