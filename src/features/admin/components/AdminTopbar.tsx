import { Bell, Menu, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { LanguageSwitcher } from '../../../components/brand/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { Badge } from '../../../components/ui';

export function AdminTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { t, locale } = useI18n();
  const { user, profile } = useAuth();
  const { enrollmentRequests, courses } = usePlatformDemo();

  const displayName = user
    ? (locale === 'ar' ? profile?.full_name_ar : profile?.full_name_en) ||
      profile?.full_name_en ||
      profile?.full_name_ar ||
      user.email ||
      t('admin.portalName')
    : t('admin.guard.demoUserName');
  const displayInitials = user ? profile?.initials || 'SA' : 'SA';

  const pendingTotal =
    enrollmentRequests.filter((r) => r.status === 'pending').length +
    courses.filter((c) => c.pendingApproval).length +
    courses.reduce(
      (sum, c) =>
        sum +
        c.modules.reduce(
          (mSum, m) => mSum + m.lessons.filter((l) => l.status === 'pending_approval').length,
          0,
        ),
      0,
    );

  return (
    <header className="student-topbar">
      <div className="student-topbar__left">
        <button
          type="button"
          className="mobile-menu-btn student-mobile-trigger"
          onClick={onOpenMobileNav}
          aria-label={t('a11y.openMenu')}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <Badge variant="brand">
          <Shield size={13} aria-hidden="true" /> {t('admin.portalName')}
        </Badge>
      </div>

      <div className="student-topbar__right">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Link
          to="/admin/approvals"
          className="mobile-menu-btn"
          style={{ position: 'relative', width: 40, height: 40 }}
          aria-label={t('admin.nav.approvals')}
        >
          <Bell size={18} aria-hidden="true" />
          {pendingTotal > 0 ? (
            <span
              style={{
                position: 'absolute',
                insetBlockStart: -4,
                insetInlineEnd: -4,
                minWidth: 18,
                height: 18,
                paddingInline: 4,
                borderRadius: '9999px',
                background: 'var(--brand-orange)',
                color: 'var(--text-on-brand)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pendingTotal}
            </span>
          ) : null}
        </Link>
        <Link to="/admin/settings" className="student-avatar-pill">
          <span className="student-avatar-pill__circle" aria-hidden="true">
            {displayInitials}
          </span>
          <span className="student-avatar-pill__name">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
