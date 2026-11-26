import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import { BrandLogo } from '../brand/BrandLogo';
import { LanguageSwitcher } from '../brand/LanguageSwitcher';
import { ThemeSwitcher } from '../brand/ThemeSwitcher';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/about', labelKey: 'nav.about', end: false },
  { to: '/disciplines', labelKey: 'nav.disciplines', end: false },
  { to: '/courses', labelKey: 'nav.courses', end: false },
  { to: '/instructors', labelKey: 'nav.instructors', end: false },
] as const;

export function PublicNavbar() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" aria-label={t('brand.name')} onClick={() => setMenuOpen(false)}>
          <BrandLogo variant="horizontal" size="md" />
        </Link>

        <nav className="site-nav" aria-label={t('a11y.primaryNav')}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Link to="/login" className="ui-btn ui-btn--secondary ui-btn--sm">
            {t('nav.login')}
          </Link>
          <Link to="/register" className="ui-btn ui-btn--primary ui-btn--sm">
            {t('nav.register')}
          </Link>
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
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `mobile-drawer__link ${isActive ? 'mobile-drawer__link--active' : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            <div className="mobile-drawer__auth">
              <Link
                to="/login"
                className="ui-btn ui-btn--secondary ui-btn--md"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="ui-btn ui-btn--primary ui-btn--md"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.register')}
              </Link>
            </div>

            <div className="mobile-drawer__controls">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
