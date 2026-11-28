import { Briefcase, ShieldAlert } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { LanguageSwitcher } from '../../../components/brand/LanguageSwitcher';
import { ThemeSwitcher } from '../../../components/brand/ThemeSwitcher';
import { Badge, Button, Card } from '../../../components/ui';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function InstructorDemoGuard({ children }: { children: React.ReactNode }) {
  const { isDemoActive, enterDemoMode, profile } = useInstructorDemo();
  const { user, profile: authProfile, isLoading, hasRole, getHomeRoute, signOut } = useAuth();
  const { t, locale } = useI18n();

  if (isLoading) {
    return (
      <div className="container" style={{ paddingBlock: 64, textAlign: 'center' }}>
        <p className="text-body">Loading...</p>
      </div>
    );
  }

  if (user) {
    if (authProfile && authProfile.account_status !== 'active') {
      const isAr = locale === 'ar';
      return (
        <div className="container" style={{ paddingBlock: 64, maxWidth: 520 }}>
          <Card className="auth-card">
            <div className="auth-card__brand">
              <ShieldAlert size={36} style={{ color: 'var(--error)' }} aria-hidden="true" />
              <h1 className="text-h2">
                {isAr ? 'تم تعليق وصول حساب المدرب' : 'Instructor Account Suspended'}
              </h1>
              <p className="text-body">
                {isAr
                  ? 'حسابك غير نشط حالياً. يرجى التواصل مع إدارة أكاديمية أثر.'
                  : 'Your instructor access is currently inactive or suspended. Please contact ATHAR ACADEMY administration.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={() => void signOut()}>
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (hasRole('instructor')) {
      return <>{children}</>;
    }
    return (
      <div className="container" style={{ paddingBlock: 64, maxWidth: 520 }}>
        <Card className="auth-card">
          <div className="auth-card__brand">
            <ShieldAlert size={36} style={{ color: 'var(--error)' }} aria-hidden="true" />
            <h1 className="text-h2">Access Denied</h1>
            <p className="text-body">Your account does not have Instructor portal access.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={getHomeRoute()} className="ui-btn ui-btn--primary ui-btn--md">
              Go to My Portal
            </Link>
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!import.meta.env.DEV) {
    return <Navigate to="/login" replace />;
  }

  if (isDemoActive) {
    return <>{children}</>;
  }

  return (
    <div className="public-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" aria-label={t('brand.name')}>
            <BrandLogo variant="horizontal" size="md" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main id="main-content" className="auth-page" style={{ flex: 1 }}>
        <div className="container">
          <Card className="auth-card" style={{ maxWidth: 540 }}>
            <div className="auth-card__brand">
              <div className="feature-card__icon feature-card__icon--teal" style={{ width: 56, height: 56 }} aria-hidden="true">
                <Briefcase size={28} />
              </div>
              <Badge variant="warning">{t('instructor.guard.badge')}</Badge>
              <h1 className="text-h2">{t('instructor.guard.title')}</h1>
              <p className="text-body">{t('instructor.guard.description')}</p>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div className="student-avatar-pill__circle" style={{ width: 40, height: 40 }}>
                {profile.initials}
              </div>
              <div style={{ textAlign: 'start' }}>
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {t('instructor.guard.demoUserLabel')}
                </div>
                <div className="text-small" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {profile.fullName[locale]}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/login" className="ui-btn ui-btn--primary ui-btn--lg">
                  {t('auth.login.submitButton')}
                </Link>
                <Button variant="secondary" size="md" onClick={enterDemoMode}>
                  {t('instructor.guard.enterButton')}
                </Button>
                  <Link to="/" className="ui-btn ui-btn--tertiary ui-btn--md">
                    {t('instructor.guard.backPublic')}
                  </Link>
                </div>
              </Card>
            </div>
          </main>
        </div>
        );
}
