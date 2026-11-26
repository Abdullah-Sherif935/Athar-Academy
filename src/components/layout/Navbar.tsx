import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../app/providers/I18nProvider';
import { BrandLogo } from '../brand/BrandLogo';
import { LanguageSwitcher } from '../brand/LanguageSwitcher';
import { ThemeSwitcher } from '../brand/ThemeSwitcher';

const NAV_ITEMS = [
  { href: '#top', labelKey: 'nav.home' },
  { href: '#about', labelKey: 'nav.about' },
  { href: '#disciplines', labelKey: 'nav.disciplines' },
  { href: '#sample-courses', labelKey: 'nav.courses' },
  { href: '#foundation', labelKey: 'nav.foundation' },
] as const;

export function Navbar() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" aria-label={t('brand.name')}>
          <BrandLogo variant="horizontal" size="md" />
        </a>

        <nav className="site-nav" aria-label={t('a11y.primaryNav')}>
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="site-nav__link">
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="site-header__mobile-controls">
          <LanguageSwitcher />
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-drawer">
          <div className="container">
            <nav className="mobile-drawer__nav" aria-label={t('a11y.primaryNav')}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="mobile-drawer__link"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.labelKey)}
                </a>
              ))}
            </nav>
            <div className="mobile-drawer__controls">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
