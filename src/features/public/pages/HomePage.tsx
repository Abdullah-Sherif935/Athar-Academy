import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Globe,
  Layers,
  MessageSquare,
  Quote,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import {
  CourseCard,
  DisciplineCard,
  InstructorCard,
  SectionHeading,
} from '../../../components/shared';
import { Badge, Card } from '../../../components/ui';
import { BRAND_CONFIG } from '../../../config/brand';
import {
  MOCK_COURSES,
  MOCK_DISCIPLINES,
  MOCK_FAQS,
  MOCK_INSTRUCTORS,
  MOCK_TESTIMONIALS,
} from '../../../data/mock';
import { ar } from '../../../i18n/dictionaries/ar';
import { en } from '../../../i18n/dictionaries/en';

export function HomePage() {
  const { locale, t } = useI18n();
  const [openFaqId, setOpenFaqId] = useState<string | null>(MOCK_FAQS[0]?.id ?? null);

  const featuredDisciplines = MOCK_DISCIPLINES.filter((d) => d.featured);
  const featuredCourses = MOCK_COURSES.filter((c) => c.featured);
  const featuredInstructors = MOCK_INSTRUCTORS.filter((i) => i.featured);
  const benefitsDict = locale === 'ar' ? ar.home.benefits : en.home.benefits;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <Badge variant="brand">{t('home.heroBadge')}</Badge>
            <div className="tagline-label">{BRAND_CONFIG.tagline[locale]}</div>
            <h1 className="text-display">{t('home.heroTitle')}</h1>
            <p className="hero__subtitle">{t('home.heroSubtitle')}</p>

            <div className="hero__actions">
              <Link to="/courses" className="ui-btn ui-btn--primary ui-btn--lg">
                {t('home.primaryCta')}
              </Link>
              <Link to="/disciplines" className="ui-btn ui-btn--secondary ui-btn--lg">
                {t('home.secondaryCta')}
              </Link>
            </div>

            <ul className="hero__pillars">
              <li className="hero__pillar">
                <CheckCircle2 size={18} className="hero__pillar-icon" aria-hidden="true" />
                <span>{t('home.pillars.multidisciplinary')}</span>
              </li>
              <li className="hero__pillar">
                <CheckCircle2 size={18} className="hero__pillar-icon" aria-hidden="true" />
                <span>{t('home.pillars.bilingual')}</span>
              </li>
              <li className="hero__pillar">
                <CheckCircle2 size={18} className="hero__pillar-icon" aria-hidden="true" />
                <span>{t('home.pillars.community')}</span>
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

      {/* Featured Disciplines */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.featuredDisciplines.eyebrow')}
            demoBadge={t('common.demoBadge')}
            title={t('home.featuredDisciplines.title')}
            description={t('home.featuredDisciplines.description')}
            action={
              <Link to="/disciplines" className="ui-btn ui-btn--secondary ui-btn--md">
                {t('common.viewAllDisciplines')}
              </Link>
            }
          />
          <div className="grid-4">
            {featuredDisciplines.map((discipline) => (
              <DisciplineCard key={discipline.slug} discipline={discipline} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section surface-band">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.featuredCourses.eyebrow')}
            eyebrowVariant="teal"
            demoBadge={t('common.demoBadge')}
            title={t('home.featuredCourses.title')}
            description={t('home.featuredCourses.description')}
            action={
              <Link to="/courses" className="ui-btn ui-btn--primary ui-btn--md">
                {t('common.viewAllCourses')}
              </Link>
            }
          />
          <div className="grid-2">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose ATHAR ACADEMY */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.whyChoose.eyebrow')}
            eyebrowVariant="info"
            title={t('home.whyChoose.title')}
            description={t('home.whyChoose.description')}
          />
          <div className="grid-4">
            <Card className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <BookOpen size={22} />
              </div>
              <h3 className="text-h3">{t('home.whyChoose.items.structured.title')}</h3>
              <p className="text-small">{t('home.whyChoose.items.structured.body')}</p>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-h3">{t('home.whyChoose.items.approved.title')}</h3>
              <p className="text-small">{t('home.whyChoose.items.approved.body')}</p>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--orange" aria-hidden="true">
                <Globe size={22} />
              </div>
              <h3 className="text-h3">{t('home.whyChoose.items.bilingual.title')}</h3>
              <p className="text-small">{t('home.whyChoose.items.bilingual.body')}</p>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-h3">{t('home.whyChoose.items.community.title')}</h3>
              <p className="text-small">{t('home.whyChoose.items.community.body')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works / Learning Journey */}
      <section className="section surface-band">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.howItWorks.eyebrow')}
            eyebrowVariant="teal"
            title={t('home.howItWorks.title')}
            description={t('home.howItWorks.description')}
          />
          <div className="grid-4">
            {(['one', 'two', 'three', 'four'] as const).map((step) => (
              <Card key={step} className="feature-card">
                <h3 className="text-h3">{t(`home.howItWorks.steps.${step}.title`)}</h3>
                <p className="text-small">{t(`home.howItWorks.steps.${step}.body`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Instructors */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.featuredInstructors.eyebrow')}
            demoBadge={t('common.demoBadge')}
            title={t('home.featuredInstructors.title')}
            description={t('home.featuredInstructors.description')}
            action={
              <Link to="/instructors" className="ui-btn ui-btn--secondary ui-btn--md">
                {t('common.viewAllInstructors')}
              </Link>
            }
          />
          <div className="grid-4">
            {featuredInstructors.map((instructor) => (
              <InstructorCard key={instructor.slug} instructor={instructor} />
            ))}
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="section surface-band">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.benefits.eyebrow')}
            eyebrowVariant="brand"
            title={t('home.benefits.title')}
          />
          <div className="grid-2">
            <Card className="feature-card">
              <div className="feature-card__icon" aria-hidden="true">
                <Compass size={22} />
              </div>
              <h3 className="text-h3">{t('home.benefits.learnersTitle')}</h3>
              <ul className="benefit-list">
                {benefitsDict.learnersList.map((item, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <CheckCircle2 size={18} className="benefit-list__icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="feature-card">
              <div className="feature-card__icon feature-card__icon--teal" aria-hidden="true">
                <Users size={22} />
              </div>
              <h3 className="text-h3">{t('home.benefits.instructorsTitle')}</h3>
              <ul className="benefit-list">
                {benefitsDict.instructorsList.map((item, idx) => (
                  <li key={idx} className="benefit-list__item">
                    <CheckCircle2 size={18} className="benefit-list__icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Testimonials */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.testimonials.eyebrow')}
            demoBadge={t('common.demoBadge')}
            title={t('home.testimonials.title')}
            description={t('home.testimonials.description')}
          />
          <div className="grid-3">
            {MOCK_TESTIMONIALS.map((item) => (
              <Card key={item.id} className="feature-card">
                <Quote size={22} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
                <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                  {item.quote[locale]}
                </p>
                <div style={{ marginBlockStart: 'auto', paddingBlockStart: 12 }}>
                  <div className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.authorName[locale]}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                    {item.role[locale]}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section surface-band">
        <div className="container">
          <SectionHeading
            eyebrow={t('home.faq.eyebrow')}
            eyebrowVariant="info"
            title={t('home.faq.title')}
            description={t('home.faq.description')}
          />
          <div className="faq-list">
            {MOCK_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="faq-item">
                  <button
                    type="button"
                    className="faq-item__trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  >
                    <span>{faq.question[locale]}</span>
                    {isOpen ? (
                      <ChevronUp size={18} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={18} aria-hidden="true" />
                    )}
                  </button>
                  {isOpen ? <div className="faq-item__body">{faq.answer[locale]}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <div className="tagline-label" style={{ color: 'var(--brand-teal)', marginBlockEnd: 6 }}>
                <Layers size={14} style={{ display: 'inline', verticalAlign: 'middle' }} aria-hidden="true" />{' '}
                {BRAND_CONFIG.tagline[locale]}
              </div>
              <h2 className="text-h1">{t('home.ctaBanner.title')}</h2>
              <p className="text-body" style={{ marginBlockStart: 8 }}>
                {t('home.ctaBanner.description')}
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link to="/courses" className="ui-btn ui-btn--primary ui-btn--lg">
                {t('home.ctaBanner.primary')}
              </Link>
              <Link to="/register" className="ui-btn ui-btn--secondary ui-btn--lg">
                {t('home.ctaBanner.secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
