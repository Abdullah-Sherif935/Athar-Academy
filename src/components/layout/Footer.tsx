import { useI18n } from '../../app/providers/I18nProvider';
import { BRAND_CONFIG } from '../../config/brand';
import { BrandLogo } from '../brand/BrandLogo';

const FOOTER_LINKS = [
  { href: '#top', labelKey: 'nav.home' },
  { href: '#about', labelKey: 'nav.about' },
  { href: '#disciplines', labelKey: 'nav.disciplines' },
  { href: '#sample-courses', labelKey: 'nav.courses' },
  { href: '#foundation', labelKey: 'nav.foundation' },
] as const;

export function Footer() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
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
            <p className="site-footer__muted" style={{ maxWidth: '46ch' }}>
              {t('footer.description')}
            </p>
          </div>

          <div>
            <div className="site-footer__title">{t('footer.linksTitle')}</div>
            <ul className="site-footer__links">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="site-footer__link">
                    {t(item.labelKey)}
                  </a>
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
