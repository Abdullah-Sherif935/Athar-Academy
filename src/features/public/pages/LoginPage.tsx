import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHomeRouteForRole, useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Alert, Button, Card, Input } from '../../../components/ui';

export function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { signIn, resetPassword, user, primaryRole, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && primaryRole) {
      navigate(getHomeRouteForRole(primaryRole), { replace: true });
    }
  }, [isLoading, navigate, primaryRole, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t('auth.validation.emailInvalid');
    }
    if (!password) {
      nextErrors.password = t('auth.validation.passwordRequired');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const res = await signIn(email, password);
    setSubmitting(false);

    if (!res.ok) {
      setErrors({ form: res.error ?? 'Authentication failed.' });
      return;
    }

    navigate(getHomeRouteForRole(res.role ?? 'student'), { replace: true });
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: t('auth.validation.emailInvalid') });
      return;
    }
    setSubmitting(true);
    const res = await resetPassword(email);
    setSubmitting(false);
    if (!res.ok) {
      setErrors({ form: res.error });
    } else {
      setResetMessage(t('auth.login.forgotDemoMessage'));
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <Card className="auth-card">
          <div className="auth-card__brand">
            <BrandLogo variant="icon" size="lg" />
            <div>
              <h1 className="text-h2">{t('auth.login.title')}</h1>
              <p className="text-small" style={{ marginBlockStart: 6 }}>
                {t('auth.login.subtitle')}
              </p>
            </div>
          </div>

          <form className="modal-form" onSubmit={handleSubmit} noValidate>
            <Input
              label={t('auth.login.emailLabel')}
              placeholder={t('auth.login.emailPlaceholder')}
              type="email"
              dir="auto"
              autoComplete="email"
              value={email}
              error={errors.email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />

            <div className="password-wrap">
              <Input
                label={t('auth.login.passwordLabel')}
                placeholder={t('auth.login.passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                error={errors.password}
                style={{ paddingInlineEnd: 48 }}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('a11y.hidePassword') : t('a11y.showPassword')}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>

            <div className="auth-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>{t('auth.login.rememberMe')}</span>
              </label>

              <button
                type="button"
                className="ui-btn ui-btn--tertiary ui-btn--sm"
                style={{ minHeight: 32, paddingInline: 8 }}
                disabled={submitting}
                onClick={handleResetPassword}
              >
                {t('auth.login.forgotPassword')}
              </button>
            </div>

            {errors.form ? <Alert variant="error" title={errors.form} /> : null}
            {resetMessage ? (
              <Alert variant="info" title={t('auth.login.forgotPassword')}>
                {resetMessage}
              </Alert>
            ) : null}

            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? '...' : t('auth.login.submitButton')}
            </Button>
          </form>

          <p className="auth-footer-text">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register">{t('auth.login.registerLink')}</Link>
          </p>

          {import.meta.env.DEV ? (
            <div style={{ paddingBlockStart: 12, borderBlockStart: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/student" className="ui-btn ui-btn--secondary ui-btn--sm" style={{ width: '100%' }}>
                {t('student.nav.enterPortalDemo')}
              </Link>
              <Link to="/instructor" className="ui-btn ui-btn--secondary ui-btn--sm" style={{ width: '100%' }}>
                {t('instructor.nav.enterPortalDemo')}
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
