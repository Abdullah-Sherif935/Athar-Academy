import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  Compass,
  FolderOpen,
  Languages,
  Layers,
  Palette,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useI18n } from '../../app/providers/I18nProvider';
import { BRAND_CONFIG } from '../../config/brand';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Textarea,
} from '../../components/ui';

const SAMPLE_COURSES = [
  { key: 'one', progress: 45 },
  { key: 'two', progress: 70 },
  { key: 'three', progress: 25 },
] as const;

export function LandingPage() {
  const { t, locale } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [sampleEmail, setSampleEmail] = useState('');
  const [sampleNote, setSampleNote] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSampleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!sampleEmail.trim() || !sampleEmail.includes('@')) {
      setEmailError(t('foundation.sampleValidationError'));
      setSubmitSuccess(false);
      return;
    }
    setEmailError(undefined);
    setSubmitSuccess(true);
  };

  return (
    <main id="main-content">
      {/* Hero Section */}
      <section id="top" className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <Badge variant="brand">{t('hero.badge')}</Badge>
            <div className="tagline-label">{BRAND_CONFIG.tagline[locale]}</div>
            <h1 className="text-display">{t('hero.title')}</h1>
            <p className="hero__subtitle">{t('hero.subtitle')}</p>

            <div className="hero__actions">
              <a href="#disciplines" className="ui-btn ui-btn--primary ui-btn--lg">
                {t('hero.primaryCta')}
              </a>
              <a href="#foundation" className="ui-btn ui-btn--secondary ui-btn--lg">
                {t('hero.secondaryCta')}
              </a>
            </div>

            <ul className="hero__pillars">
              <li className="hero__pillar">
                <CheckCircle2 size={18} className="hero__pillar-icon" aria-hidden="true" />
                <span>{t('hero.pillars.bilingual')}</span>
              </li>
              <li className="hero__pillar">
                <CheckCircle2 size={18} className="hero__pillar-icon" aria-hidden="true" />
                <span>{t('hero.pillars.community')}</span>
              </li>
              <li className="hero__pillar">
                <CheckCircle2 size={18} className="hero__pillar-icon" aria-hidden="true" />
                <span>{t('hero.pillars.guided')}</span>
              </li>
            </ul>
          </div>

          <div className="hero__visual-card">
            <div className="hero__icon-frame">
              <img src={BRAND_CONFIG.assets.appIcon} alt={BRAND_CONFIG.alt[locale]} />
            </div>
            <div>
              <div className="text-h3" style={{ color: 'var(--text-primary)' }}>
                {BRAND_CONFIG.name[locale]}
              </div>
              <p className="text-small" style={{ marginBlockStart: 6 }}>
                {BRAND_CONFIG.promise[locale]}
              </p>
            </div>
            <Badge variant="teal">{BRAND_CONFIG.tagline[locale]}</Badge>
          </div>
        </div>
      </section>

      {/* Multidisciplinary Intro */}
      <section id="about" className="section">
        <div className="container">
          <div className="section-header">
            <Badge variant="info">{t('intro.eyebrow')}</Badge>
            <h2 className="text-h1">{t('intro.title')}</h2>
            <p className="text-body">{t('intro.description')}</p>
          </div>

          <div className="grid-3">
            <Card className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <Layers size={22} />
              </div>
              <h3 className="text-h3">{t('intro.cards.multidisciplinary.title')}</h3>
              <p className="text-small">{t('intro.cards.multidisciplinary.body')}</p>
            </Card>

            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
                <Users size={22} />
              </div>
              <h3 className="text-h3">{t('intro.cards.instructorLed.title')}</h3>
              <p className="text-small">{t('intro.cards.instructorLed.body')}</p>
            </Card>

            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--orange" aria-hidden="true">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-h3">{t('intro.cards.accessible.title')}</h3>
              <p className="text-small">{t('intro.cards.accessible.body')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Disciplines */}
      <section id="disciplines" className="section" style={{ paddingBlockStart: 12 }}>
        <div className="container">
          <div className="section-header">
            <div className="section-header__meta">
              <Badge variant="neutral">{t('disciplines.eyebrow')}</Badge>
              <Badge variant="orange">{t('disciplines.sampleBadge')}</Badge>
            </div>
            <h2 className="text-h1">{t('disciplines.title')}</h2>
            <p className="text-body">{t('disciplines.description')}</p>
          </div>

          <div className="grid-4">
            <Card interactive className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <Code2 size={22} />
              </div>
              <h3 className="text-h3">{t('disciplines.items.tech.title')}</h3>
              <p className="text-small">{t('disciplines.items.tech.description')}</p>
            </Card>

            <Card interactive className="feature-card">
              <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
                <Briefcase size={22} />
              </div>
              <h3 className="text-h3">{t('disciplines.items.business.title')}</h3>
              <p className="text-small">{t('disciplines.items.business.description')}</p>
            </Card>

            <Card interactive className="feature-card">
              <div className="feature-card__icon feature-card__icon--orange" aria-hidden="true">
                <Palette size={22} />
              </div>
              <h3 className="text-h3">{t('disciplines.items.design.title')}</h3>
              <p className="text-small">{t('disciplines.items.design.description')}</p>
            </Card>

            <Card interactive className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <Languages size={22} />
              </div>
              <h3 className="text-h3">{t('disciplines.items.languages.title')}</h3>
              <p className="text-small">{t('disciplines.items.languages.description')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Featured Courses */}
      <section id="sample-courses" className="section" style={{ paddingBlockStart: 12 }}>
        <div className="container">
          <div className="section-header">
            <div className="section-header__meta">
              <Badge variant="brand">{t('courses.eyebrow')}</Badge>
              <Badge variant="warning">{t('courses.sampleBadge')}</Badge>
            </div>
            <h2 className="text-h1">{t('courses.title')}</h2>
            <p className="text-body">{t('courses.description')}</p>
          </div>

          <div className="grid-3">
            {SAMPLE_COURSES.map(({ key, progress }) => (
              <Card key={key} interactive className="course-card">
                <div className="course-card__thumb" aria-hidden="true">
                  <BookOpen size={36} />
                </div>
                <div className="section-header__meta">
                  <Badge variant="neutral">{t(`courses.items.${key}.category`)}</Badge>
                  <Badge variant="teal">{t('courses.statusLabel')}</Badge>
                </div>
                <h3 className="text-h3">{t(`courses.items.${key}.title`)}</h3>
                <p className="text-small">{t(`courses.items.${key}.summary`)}</p>

                <div className="course-card__progress">
                  <div className="course-card__progress-row">
                    <span>{t('courses.progressLabel')}</span>
                    <span className="ltr-inline">{progress}%</span>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t('courses.progressLabel')}
                  >
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Phase 01 UI Foundation Preview */}
      <section id="foundation" className="section" style={{ paddingBlockStart: 12 }}>
        <div className="container">
          <div className="section-header">
            <Badge variant="teal">{t('foundation.eyebrow')}</Badge>
            <h2 className="text-h1">{t('foundation.title')}</h2>
            <p className="text-body">{t('foundation.description')}</p>
          </div>

          <div className="grid-2">
            <div className="foundation-stack">
              <Alert variant="info" title={t('foundation.alertInfoTitle')}>
                {t('foundation.alertInfoBody')}
              </Alert>
              <Alert variant="success" title={t('foundation.alertSuccessTitle')}>
                {t('foundation.alertSuccessBody')}
              </Alert>

              <Card>
                <div className="foundation-stack">
                  <div className="text-small" style={{ fontWeight: 600 }}>
                    {t('foundation.skeletonLabel')}
                  </div>
                  <Skeleton width="60%" height="18px" />
                  <Skeleton width="100%" height="14px" />
                  <Skeleton width="82%" height="14px" />
                </div>
              </Card>
            </div>

            <div className="foundation-stack">
              <EmptyState
                icon={<FolderOpen size={22} />}
                title={t('foundation.emptyTitle')}
                description={t('foundation.emptyDescription')}
                action={
                  <Button variant="primary" onClick={() => setModalOpen(true)}>
                    <Compass size={16} aria-hidden="true" /> {t('foundation.modalTrigger')}
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('foundation.modalTitle')}
        description={t('foundation.modalDescription')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t('foundation.sampleCancel')}
            </Button>
            <Button variant="primary" type="submit" form="sample-foundation-form">
              {t('foundation.sampleSubmit')}
            </Button>
          </>
        }
      >
        <form id="sample-foundation-form" className="modal-form" onSubmit={handleSampleSubmit} noValidate>
          <Input
            label={t('foundation.sampleInputLabel')}
            placeholder={t('foundation.sampleInputPlaceholder')}
            helperText={t('foundation.sampleInputHelper')}
            error={emailError}
            type="email"
            dir="auto"
            value={sampleEmail}
            onChange={(event) => {
              setSampleEmail(event.target.value);
              if (emailError) setEmailError(undefined);
            }}
          />
          <Textarea
            label={t('foundation.sampleTextareaLabel')}
            placeholder={t('foundation.sampleTextareaPlaceholder')}
            dir="auto"
            value={sampleNote}
            onChange={(event) => setSampleNote(event.target.value)}
          />
          {submitSuccess ? (
            <Alert variant="success" title={t('foundation.sampleValidationSuccess')} />
          ) : null}
        </form>
      </Modal>
    </main>
  );
}
