import {
  BarChart3,
  Bell,
  BookOpen,
  CheckSquare,
  ClipboardCheck,
  Compass,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Settings,
  Star,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';

export function AdminSidebar({
  onNavigate,
  showClose = false,
}: {
  onNavigate?: () => void;
  showClose?: boolean;
}) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { enrollmentRequests, courses, courseProposals, reviews, communityPosts, exitAdminDemo } =
    usePlatformDemo();

  const pendingEnrollments = enrollmentRequests.filter((r) => r.status === 'pending').length;
  const pendingCourses = courses.filter((c) => c.pendingApproval).length;
  const pendingProposals = courseProposals.filter((p) => p.status === 'pending_approval').length;
  const pendingLessons = courses.reduce(
    (sum, c) =>
      sum +
      c.modules.reduce(
        (mSum, m) =>
          mSum +
          m.lessons.filter(
            (l) =>
              l.status === 'pending_approval' ||
              l.pendingRevision?.status === 'pending_approval',
          ).length,
        0,
      ),
    0,
  );
  const pendingApprovals = pendingCourses + pendingProposals + pendingLessons;
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
  const reportedPosts = communityPosts.filter((p) => p.isReported && !p.isHidden).length;

  const items = [
    { to: '/admin', label: t('admin.nav.overview'), Icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: t('admin.nav.students'), Icon: GraduationCap, end: false },
    { to: '/admin/instructors', label: t('admin.nav.instructors'), Icon: Users, end: false },
    { to: '/admin/courses', label: t('admin.nav.courses'), Icon: BookOpen, end: false },
    { to: '/admin/disciplines', label: t('admin.nav.disciplines'), Icon: Compass, end: false },
    {
      to: '/admin/enrollments',
      label: t('admin.nav.enrollments'),
      Icon: ClipboardCheck,
      end: false,
      badge: pendingEnrollments,
    },
    {
      to: '/admin/approvals',
      label: t('admin.nav.approvals'),
      Icon: CheckSquare,
      end: false,
      badge: pendingApprovals,
    },
    {
      to: '/admin/reviews',
      label: t('admin.nav.reviews'),
      Icon: Star,
      end: false,
      badge: pendingReviews,
    },
    {
      to: '/admin/community',
      label: t('admin.nav.community'),
      Icon: MessageSquareWarning,
      end: false,
      badge: reportedPosts,
    },
    { to: '/admin/analytics', label: t('admin.nav.analytics'), Icon: BarChart3, end: false },
    { to: '/admin/notifications', label: t('admin.nav.notifications'), Icon: Bell, end: false },
    { to: '/admin/settings', label: t('admin.nav.settings'), Icon: Settings, end: false },
  ];

  return (
    <>
      <div className={`student-sidebar__brand ${showClose ? 'student-sidebar__brand--with-close' : ''}`.trim()}>
        <Link to="/admin" onClick={onNavigate} aria-label={t('admin.portalName')}>
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

      <nav className="student-sidebar__nav" aria-label={t('admin.portalName')}>
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
          <span>{t('admin.nav.backToSite')}</span>
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
              exitAdminDemo();
              onNavigate?.();
            }
          }}
        >
          <LogOut size={17} aria-hidden="true" />
          <span>
            {user ? (locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out') : t('admin.demoBanner.exit')}
          </span>
        </button>
      </div>
    </>
  );
}
