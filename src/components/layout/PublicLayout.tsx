import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import { PublicFooter } from './PublicFooter';
import { PublicNavbar } from './PublicNavbar';

export function PublicLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="public-shell">
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <PublicNavbar />
      <main id="main-content" className="public-shell__main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
