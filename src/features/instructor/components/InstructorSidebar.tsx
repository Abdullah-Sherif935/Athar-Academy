import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorSidebar({
  onNavigate,
  showClose = false,
}: {
  onNavigate?: () => void;
  showClose?: boolean;
}) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { conversations, assignedEnrollmentRequests, exitDemoMode } = useInstructorDemo();
  const unreadMsgs = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const pendingEnrollments = assignedEnrollmentRequests.filter(
    (r) => r.status === 'pending' || r.status === 'awaiting_payment',
  ).length;

  const items = [
    { to: '/instructor', label: t('instructor.nav.dashboard'), Icon: LayoutDashboard, end: true },
    { to: '/instructor/courses', label: t('instructor.nav.courses'), Icon: BookOpen, end: false },
    {
      to: '/instructor/enrollments',
      label: t('instructor.nav.enrollments'),
      Icon: ClipboardCheck,
      end: false,
      badge: pendingEnrollments,
    },
    { to: '/instructor/students', label: t('instructor.nav.students'), Icon: Users, end: false },
    { to: '/instructor/analytics', label: t('instructor.nav.analytics'), Icon: BarChart3, end: false },
    { to: '/instructor/community', label: t('instructor.nav.community'), Icon: MessageSquare, end: false },
    {
      to: '/instructor/announcements',
      label: t('instructor.nav.announcements'),
      Icon: Megaphone,
      end: false,
    },
    {
      to: '/instructor/messages',
      label: t('instructor.nav.messages'),
      Icon: Mail,
      end: false,
      badge: unreadMsgs,
    },
    { to: '/instructor/profile', label: t('instructor.nav.profile'), Icon: User, end: false },
    { to: '/instructor/settings', label: t('instructor.nav.settings'), Icon: Settings, end: false },
  ];

  return (
    <>
      <div className={`student-sidebar__brand ${showClose ? 'student-sidebar__brand--with-close' : ''}`.trim()}>
        <Link to="/instructor" onClick={onNavigate} aria-label={t('instructor.portalName')}>
          <BrandLogo variant="horizontal" size="md" />
        </Link>
        {showClose ? (
          <button
            type="button"
            className="mobile-menu-btn"
            style={{ width: 36, height: 36 }}
            onClick={onNavigate}
            aria-label={t('a11y.closeMenu')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav className="student-sidebar__nav" aria-label={t('instructor.portalName')}>
        {items.map(({ to, label, Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `student-nav-link ${isActive ? 'student-nav-link--active' : ''}`
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {badge && badge > 0 ? <span className="student-nav-link__badge">{badge}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="student-sidebar__footer">
        {showClose ? (
          <div style={{ paddingInline: 8, paddingBlockEnd: 8 }}>
            <ThemeSwitcher />
          </div>
        ) : null}
        <Link to="/" className="student-nav-link" onClick={onNavigate}>
          <ExternalLink size={17} aria-hidden="true" />
          <span>{t('instructor.nav.backToSite')}</span>
        </Link>
        <button
          type="button"
          className="student-nav-link"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }}
          onClick={async () => {
            if (user) {
              await signOut();
              onNavigate?.();
              navigate('/login');
            } else {
              exitDemoMode();
              onNavigate?.();
            }
          }}
        >
          <LogOut size={17} aria-hidden="true" />
          <span>
            {user ? (locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out') : t('instructor.demoBanner.exit')}
          </span>
        </button>
      </div>
    </>
  );
}
