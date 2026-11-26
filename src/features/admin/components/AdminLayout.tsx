import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { AdminDemoBanner } from './AdminDemoBanner';
import { AdminDemoGuard } from './AdminDemoGuard';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <AdminDemoGuard>
      <div className="student-shell">
        <a href="#admin-main-content" className="skip-link">
          {t('a11y.skipToContent')}
        </a>

        <aside className="student-sidebar">
          <AdminSidebar />
        </aside>

        {mobileOpen ? (
          <div
            className="student-drawer-backdrop"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) setMobileOpen(false);
            }}
          >
            <aside className="student-drawer-panel">
              <AdminSidebar showClose onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className="student-main-col">
          <AdminTopbar onOpenMobileNav={() => setMobileOpen(true)} />
          <AdminDemoBanner />
          <main id="admin-main-content" className="student-content">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminDemoGuard>
  );
}
