import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { LanguageSwitcher } from '../../../components/brand/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { Badge } from '../../../components/ui';
import { useStudentDemo } from '../context/StudentDemoContext';

export function StudentTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { t, locale } = useI18n();
  const { user, profile: authProfile } = useAuth();
  const { profile, notifications } = useStudentDemo();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayName = user
    ? (locale === 'ar' ? authProfile?.full_name_ar : authProfile?.full_name_en) ||
      authProfile?.full_name_en ||
      authProfile?.full_name_ar ||
      user.email ||
      profile.fullName[locale]
    : profile.fullName[locale];
  const displayInitials = user ? authProfile?.initials || profile.initials : profile.initials;

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
        <Badge variant="brand">{t('student.portalName')}</Badge>
      </div>

      <div className="student-topbar__right">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Link
          to="/student/notifications"
          className="mobile-menu-btn"
          style={{ position: 'relative', width: 40, height: 40 }}
          aria-label={t('student.nav.notifications')}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span
              style={{
                position: 'absolute',
                insetBlockStart: -4,
                insetInlineEnd: -4,
                minWidth: 18,
                height: 18,
                paddingInline: 4,
                borderRadius: '9999px',
                background: 'var(--brand-blue)',
                color: 'var(--text-on-brand)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCount}
            </span>
          ) : null}
        </Link>
        <Link to="/student/profile" className="student-avatar-pill">
          <span className="student-avatar-pill__circle" aria-hidden="true">
            {displayInitials}
          </span>
          <span className="student-avatar-pill__name">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
