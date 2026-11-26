import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Badge, Button, Card, Input, Textarea } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import { CourseProgressBar } from '../components/CourseProgressBar';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function StudentProfilePage() {
  const { t, locale } = useI18n();
  const { profile, updateProfile, enrolledCourses, getCourseProgress } = useStudentDemo();

  const [fullName, setFullName] = useState(profile.fullName[locale]);
  const [bio, setBio] = useState(profile.bio[locale]);
  const [saved, setSaved] = useState(false);

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    updateProfile({
      fullName: { ...profile.fullName, [locale]: fullName.trim() || profile.fullName[locale] },
      bio: { ...profile.bio, [locale]: bio.trim() || profile.bio[locale] },
    });
    setSaved(true);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.profile.title')}
        subtitle={t('student.profile.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.profile') },
        ]}
      />

      <div className="details-layout">
        <Card className="details-stack" style={{ gap: 18 }}>
          <div className="instructor-card__header">
            <div className="instructor-avatar instructor-avatar--lg accent-badge--navy" aria-hidden="true">
              {profile.initials}
            </div>
            <div>
              <Badge variant="orange">{t('common.demoBadge')}</Badge>
              <h2 className="text-h2" style={{ marginBlockStart: 6 }}>
                {profile.fullName[locale]}
              </h2>
              <p className="text-small">
                <bdi className="ltr-inline">{profile.email}</bdi> · {profile.memberSince[locale]}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="modal-form">
            <h3 className="text-h3">{t('student.profile.editTitle')}</h3>
            <Input
              label={t('student.profile.fullNameLabel')}
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setSaved(false);
              }}
            />
            <Input
              label={t('student.profile.emailLabel')}
              value={profile.email}
              disabled
              dir="ltr"
            />
            <Textarea
              label={t('student.profile.bioLabel')}
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
                setSaved(false);
              }}
            />
            <div>
              <Button type="submit" variant="primary" size="md">
                {t('student.profile.saveBtn')}
              </Button>
            </div>
            {saved ? (
              <Alert variant="success" title={t('student.profile.savedSuccess')} />
            ) : null}
          </form>
        </Card>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('student.profile.interestsTitle')}</h2>
            <div className="instructor-card__tags">
              {profile.interests.map((item, idx) => (
                <Badge key={idx} variant="teal">
                  {item[locale]}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="details-stack" style={{ gap: 14 }}>
            <h2 className="text-h3">{t('student.profile.enrolledSummary')}</h2>
            {enrolledCourses.map((rec) => {
              const course = getCourseBySlug(rec.courseSlug);
              const { percent } = getCourseProgress(rec.courseSlug);
              if (!course) return null;
              return (
                <div key={rec.courseSlug} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Link
                    to={`/student/courses/${course.slug}`}
                    className="text-small"
                    style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    {course.title[locale]}
                  </Link>
                  <CourseProgressBar percent={percent} />
                </div>
              );
            })}
          </Card>
        </aside>
      </div>
    </div>
  );
}
