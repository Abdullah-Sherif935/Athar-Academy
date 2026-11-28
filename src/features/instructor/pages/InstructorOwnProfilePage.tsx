import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Badge, Button, Card, Input, Textarea } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorOwnProfilePage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { profile, updateProfile } = useInstructorDemo();

  const [fullName, setFullName] = useState(profile.fullName[locale]);
  const [title, setTitle] = useState(profile.title[locale]);
  const [bio, setBio] = useState(profile.biography[locale]);
  const [website, setWebsite] = useState(profile.website ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(profile.fullName[locale]);
    setTitle(profile.title[locale]);
    setBio(profile.biography[locale]);
    setWebsite(profile.website ?? '');
  }, [locale, profile]);

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    updateProfile({
      fullName: { ...profile.fullName, [locale]: fullName.trim() || profile.fullName[locale] },
      title: { ...profile.title, [locale]: title.trim() || profile.title[locale] },
      biography: { ...profile.biography, [locale]: bio.trim() || profile.biography[locale] },
      website: website.trim() || undefined,
    });
    setSaved(true);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.profile.title')}
        subtitle={t('instructor.profile.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.profile') },
        ]}
      />

      <div className="details-layout">
        <Card className="details-stack" style={{ gap: 18 }}>
          <div className="instructor-card__header">
            <div className="instructor-avatar instructor-avatar--lg accent-badge--navy" aria-hidden="true">
              {profile.initials}
            </div>
            <div>
              {!user ? <Badge variant="orange">{t('common.demoBadge')}</Badge> : null}
              <h2 className="text-h2" style={{ marginBlockStart: 6 }}>
                {profile.fullName[locale]}
              </h2>
              <p className="text-small">{profile.title[locale]}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="modal-form">
            <Input
              label={t('instructor.profile.fullNameLabel')}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
            />
            <Input
              label={t('instructor.profile.titleLabel')}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
              }}
            />
            <Textarea
              label={t('instructor.profile.bioLabel')}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setSaved(false);
              }}
            />
            <Input
              label={t('instructor.profile.websiteLabel')}
              value={website}
              dir="ltr"
              onChange={(e) => {
                setWebsite(e.target.value);
                setSaved(false);
              }}
            />
            <div>
              <Button type="submit" variant="primary" size="md">
                {t('instructor.profile.saveBtn')}
              </Button>
            </div>
            {saved ? <Alert variant="success" title={t('instructor.profile.savedSuccess')} /> : null}
          </form>
        </Card>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 12 }}>
            <h2 className="text-h3">{t('instructorProfile.expertiseTitle')}</h2>
            <div className="instructor-card__tags">
              {profile.expertise.map((item, idx) => (
                <Badge key={idx} variant="teal">
                  {item[locale]}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="details-stack" style={{ gap: 10 }}>
            <h2 className="text-h3">{t('instructor.profile.educationTitle')}</h2>
            {profile.education.map((edu, idx) => (
              <div key={idx}>
                <div className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {edu.degree[locale]}
                </div>
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {edu.institution[locale]} · {edu.year}
                </div>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}
