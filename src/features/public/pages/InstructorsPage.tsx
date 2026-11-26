import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { InstructorCard } from '../../../components/shared';
import { Badge } from '../../../components/ui';
import { MOCK_INSTRUCTORS } from '../../../data/mock';

export function InstructorsPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <span>{t('nav.instructors')}</span>
            </nav>
            <div className="section-header__meta">
              <Badge variant="brand">{t('instructorsPage.eyebrow')}</Badge>
              <Badge variant="orange">{t('common.demoBadge')}</Badge>
            </div>
            <h1 className="text-display">{t('instructorsPage.title')}</h1>
            <p className="hero__subtitle">{t('instructorsPage.description')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2">
            {MOCK_INSTRUCTORS.map((instructor) => (
              <InstructorCard key={instructor.slug} instructor={instructor} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
