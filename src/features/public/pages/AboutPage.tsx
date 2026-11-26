import { BookOpen, Compass, Eye, HeartHandshake, Layers, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { SectionHeading } from '../../../components/shared';
import { Badge, Card } from '../../../components/ui';
import { BRAND_CONFIG } from '../../../config/brand';

export function AboutPage() {
  const { t, locale } = useI18n();

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <span>{t('nav.about')}</span>
            </nav>
            <Badge variant="brand">{t('about.eyebrow')}</Badge>
            <h1 className="text-display">{t('about.title')}</h1>
            <p className="hero__subtitle">{t('about.lead')}</p>
            <div className="tagline-label">{BRAND_CONFIG.tagline[locale]}</div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section">
        <div className="container grid-2">
          <Card className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              <Eye size={22} />
            </div>
            <h2 className="text-h2">{t('about.visionTitle')}</h2>
            <p className="text-body">{t('about.visionBody')}</p>
          </Card>

          <Card className="feature-card">
            <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
              <Target size={22} />
            </div>
            <h2 className="text-h2">{t('about.missionTitle')}</h2>
            <p className="text-body">{t('about.missionBody')}</p>
          </Card>
        </div>
      </section>

      {/* Philosophy & Why It Exists */}
      <section className="section surface-band">
        <div className="container grid-2">
          <div className="details-stack">
            <h2 className="text-h1">{t('about.philosophyTitle')}</h2>
            <p className="text-body">{t('about.philosophyBody')}</p>
          </div>
          <div className="details-stack">
            <h2 className="text-h1">{t('about.whyExistsTitle')}</h2>
            <p className="text-body">{t('about.whyExistsBody')}</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.valuesTitle')} />
          <div className="grid-4">
            <Card className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <Compass size={22} />
              </div>
              <h3 className="text-h3">{t('about.values.clarity.title')}</h3>
              <p className="text-small">{t('about.values.clarity.body')}</p>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
                <Layers size={22} />
              </div>
              <h3 className="text-h3">{t('about.values.impact.title')}</h3>
              <p className="text-small">{t('about.values.impact.body')}</p>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--orange" aria-hidden="true">
                <HeartHandshake size={22} />
              </div>
              <h3 className="text-h3">{t('about.values.inclusivity.title')}</h3>
              <p className="text-small">{t('about.values.inclusivity.body')}</p>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-h3">{t('about.values.integrity.title')}</h3>
              <p className="text-small">{t('about.values.integrity.body')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section surface-band">
        <div className="container">
          <SectionHeading eyebrowVariant="teal" eyebrow={t('about.eyebrow')} title={t('about.methodologyTitle')} />
          <div className="grid-3">
            {(['structured', 'resources', 'community'] as const).map((key) => (
              <Card key={key} className="feature-card">
                <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-h3">{t(`about.methodologySteps.${key}.title`)}</h3>
                <p className="text-small">{t(`about.methodologySteps.${key}.body`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
