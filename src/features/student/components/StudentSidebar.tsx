import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  Compass,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Settings,
  User,
  X,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { useStudentDemo } from '../context/StudentDemoContext';

interface StudentSidebarProps {
  onNavigate?: () => void;
  showClose?: boolean;
}

export function StudentSidebar({ onNavigate, showClose = false }: StudentSidebarProps) {
  const { t } = useI18n();
  const { notifications, conversations, enrollmentRequests, exitDemoMode } = useStudentDemo();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadMsgs = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const pendingReqs = enrollmentRequests.filter((r) => r.status === 'pending').length;

  const items = [
    { to: '/student', label: t('student.nav.dashboard'), Icon: LayoutDashboard, end: true },
    { to: '/student/my-learning', label: t('student.nav.myLearning'), Icon: BookOpen, end: false },
    {
      to: '/student/explore-courses',
      label: t('student.nav.exploreCourses'),
      Icon: Compass,
      end: false,
    },
    {
      to: '/student/enrollment-requests',
      label: t('student.nav.enrollmentRequests'),
      Icon: ClipboardList,
      end: false,
      badge: pendingReqs,
    },
    { to: '/student/progress', label: t('student.nav.progress'), Icon: BarChart3, end: false },
    { to: '/student/certificates', label: t('student.nav.certificates'), Icon: Award, end: false },
    { to: '/student/community', label: t('student.nav.community'), Icon: MessageSquare, end: false },
    {
      to: '/student/messages',
      label: t('student.nav.messages'),
      Icon: Mail,
      end: false,
      badge: unreadMsgs,
    },
    {
      to: '/student/notifications',
      label: t('student.nav.notifications'),
      Icon: Bell,
      end: false,
      badge: unreadNotifs,
    },
    { to: '/student/profile', label: t('student.nav.profile'), Icon: User, end: false },
    { to: '/student/settings', label: t('student.nav.settings'), Icon: Settings, end: false },
  ];

  return (
    <>
      <div className="student-sidebar__brand">
        <Link to="/student" onClick={onNavigate} aria-label={t('student.portalName')}>
          <BrandLogo variant="horizontal" size="sm" />
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

      <nav className="student-sidebar__nav" aria-label={t('student.portalName')}>
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
            {badge && badge > 0 ? (
              <span className="student-nav-link__badge">{badge}</span>
            ) : null}
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
          <span>{t('student.nav.backToSite')}</span>
        </Link>
        <button
          type="button"
          className="student-nav-link"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }}
          onClick={() => {
            exitDemoMode();
            onNavigate?.();
          }}
        >
          <LogOut size={17} aria-hidden="true" />
          <span>{t('student.demoBanner.exit')}</span>
        </button>
      </div>
    </>
  );
}
