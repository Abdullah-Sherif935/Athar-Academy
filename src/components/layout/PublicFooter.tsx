import { Link } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import { BRAND_CONFIG } from '../../config/brand';
import { BrandLogo } from '../brand/BrandLogo';

const EXPLORE_LINKS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/disciplines', labelKey: 'nav.disciplines' },
  { to: '/courses', labelKey: 'nav.courses' },
  { to: '/instructors', labelKey: 'nav.instructors' },
] as const;

const ACCOUNT_LINKS = [
  { to: '/about', labelKey: 'nav.about' },
  { to: '/login', labelKey: 'nav.login' },
  { to: '/register', labelKey: 'nav.register' },
] as const;

export function PublicFooter() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid site-footer__grid--4">
          <div className="site-footer__brand">
            <div className="site-footer__brand-row">
              <BrandLogo variant="icon" surface="dark" size="md" />
              <div>
                <div className="site-footer__title" style={{ marginBlockEnd: 2 }}>
                  {BRAND_CONFIG.name[locale]}
                </div>
                <div className="site-footer__muted">{BRAND_CONFIG.tagline[locale]}</div>
              </div>
            </div>
            <p className="site-footer__muted" style={{ maxWidth: '42ch' }}>
              {t('footer.description')}
            </p>
          </div>

          <div>
            <div className="site-footer__title">{t('footer.exploreTitle')}</div>
            <ul className="site-footer__links">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="site-footer__link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="site-footer__title">{t('footer.accountTitle')}</div>
            <ul className="site-footer__links">
              {ACCOUNT_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="site-footer__link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="site-footer__title">{t('footer.contactTitle')}</div>
            <p className="site-footer__muted" style={{ marginBlockEnd: 8 }}>
              <bdi className="ltr-inline">{BRAND_CONFIG.supportEmail}</bdi>
            </p>
            <p className="site-footer__muted">{t('footer.phaseNote')}</p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span className="site-footer__muted">{t('footer.copyright', { year })}</span>
          <span className="site-footer__muted">{BRAND_CONFIG.tagline[locale]}</span>
        </div>
      </div>
    </footer>
  );
}
