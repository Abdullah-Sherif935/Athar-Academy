import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { InstructorDemoBanner } from './InstructorDemoBanner';
import { InstructorDemoGuard } from './InstructorDemoGuard';
import { InstructorSidebar } from './InstructorSidebar';
import { InstructorTopbar } from './InstructorTopbar';

export function InstructorLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <InstructorDemoGuard>
      <div className="student-shell">
        <a href="#instructor-main-content" className="skip-link">
          {t('a11y.skipToContent')}
        </a>

        <aside className="student-sidebar">
          <InstructorSidebar />
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
              <InstructorSidebar showClose onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className="student-main-col">
          <InstructorTopbar onOpenMobileNav={() => setMobileOpen(true)} />
          <InstructorDemoBanner />
          <main id="instructor-main-content" className="student-content">
            <Outlet />
          </main>
        </div>
      </div>
    </InstructorDemoGuard>
  );
}
