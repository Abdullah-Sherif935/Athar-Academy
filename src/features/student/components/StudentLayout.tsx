import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { DemoModeBanner } from './DemoModeBanner';
import { StudentDemoGuard } from './StudentDemoGuard';
import { StudentSidebar } from './StudentSidebar';
import { StudentTopbar } from './StudentTopbar';

export function StudentLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <StudentDemoGuard>
      <div className="student-shell">
        <a href="#student-main-content" className="skip-link">
          {t('a11y.skipToContent')}
        </a>

        <aside className="student-sidebar">
          <StudentSidebar />
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
              <StudentSidebar showClose onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className="student-main-col">
          <StudentTopbar onOpenMobileNav={() => setMobileOpen(true)} />
          <DemoModeBanner />
          <main id="student-main-content" className="student-content">
            <Outlet />
          </main>
        </div>
      </div>
    </StudentDemoGuard>
  );
}
