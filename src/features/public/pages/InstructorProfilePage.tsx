import { Briefcase, ExternalLink, FolderSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { CourseCard, SectionHeading } from '../../../components/shared';
import { Badge, Card, EmptyState } from '../../../components/ui';
import { getCoursesByInstructor, getInstructorBySlug } from '../../../data/mock';

export function InstructorProfilePage() {
  const { slug = '' } = useParams();
  const { t, locale } = useI18n();
  const instructor = getInstructorBySlug(slug);

  if (!instructor) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            icon={<FolderSearch size={24} />}
            title={t('instructorProfile.notFoundTitle')}
            description={t('instructorProfile.notFoundDescription')}
            action={
              <Link to="/instructors" className="ui-btn ui-btn--primary ui-btn--md">
                {t('common.viewAllInstructors')}
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const courses = getCoursesByInstructor(instructor.slug);

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/instructors">{t('nav.instructors')}</Link>
              <span aria-hidden="true">/</span>
              <span>{instructor.name[locale]}</span>
            </nav>

            <div className="instructor-card__header" style={{ marginBlockStart: 6 }}>
              <div
                className={`instructor-avatar instructor-avatar--lg accent-badge--${instructor.accent}`}
                aria-hidden="true"
              >
                {instructor.initials}
              </div>
              <div>
                <div className="section-header__meta" style={{ marginBlockEnd: 6 }}>
                  <Badge variant="brand">{t('instructorProfile.eyebrow')}</Badge>
                  <Badge variant="orange">{t('common.demoBadge')}</Badge>
                </div>
                <h1 className="text-h1">{instructor.name[locale]}</h1>
                <p className="text-body" style={{ marginBlockStart: 4 }}>
                  {instructor.title[locale]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container details-layout">
          <div className="details-stack">
            <Card>
              <h2 className="text-h2" style={{ marginBlockEnd: 12 }}>
                {t('instructorProfile.bioTitle')}
              </h2>
              <p className="text-body">{instructor.biography[locale]}</p>
            </Card>

            <Card>
              <h2 className="text-h2" style={{ marginBlockEnd: 14 }}>
                {t('instructorProfile.experienceTitle')}
              </h2>
              <div className="details-stack" style={{ gap: 14 }}>
                {instructor.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      paddingBlockEnd: idx < instructor.experience.length - 1 ? 14 : 0,
                      borderBlockEnd:
                        idx < instructor.experience.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <Briefcase
                      size={18}
                      style={{ color: 'var(--brand-blue)', marginBlockStart: 4, flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-body" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {exp.role[locale]}
                      </div>
                      <div className="text-small" style={{ color: 'var(--text-secondary)' }}>
                        {exp.organization[locale]} · {exp.period[locale]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="details-sidebar">
            <Card>
              <h2 className="text-h3" style={{ marginBlockEnd: 12 }}>
                {t('instructorProfile.expertiseTitle')}
              </h2>
              <div className="instructor-card__tags">
                {instructor.expertise.map((item, idx) => (
                  <Badge key={idx} variant="teal">
                    {item[locale]}
                  </Badge>
                ))}
              </div>
            </Card>

            {instructor.socialLinks?.website ? (
              <Card>
                <h2 className="text-h3" style={{ marginBlockEnd: 10 }}>
                  {t('instructorProfile.socialTitle')}
                </h2>
                <a
                  href={instructor.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="card-inline-link"
                >
                  <span>{t('instructorProfile.websiteLabel')}</span>
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              </Card>
            ) : null}
          </aside>
        </div>
      </section>

      {courses.length > 0 ? (
        <section className="section surface-band">
          <div className="container">
            <SectionHeading
              eyebrow={t('nav.courses')}
              demoBadge={t('common.demoBadge')}
              title={t('instructorProfile.coursesTitle')}
            />
            <div className="grid-2">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
