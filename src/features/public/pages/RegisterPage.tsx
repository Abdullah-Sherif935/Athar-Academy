import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Alert, Button, Card, Input } from '../../../components/ui';

interface RegisterErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  form?: string;
}

export function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: RegisterErrors = {};

    if (fullName.trim().length < 3) {
      nextErrors.fullName = t('auth.validation.nameRequired');
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t('auth.validation.emailInvalid');
    }
    if (password.length < 8) {
      nextErrors.password = t('auth.validation.passwordShort');
    }
    if (confirmPassword !== password || !confirmPassword) {
      nextErrors.confirmPassword = t('auth.validation.passwordMismatch');
    }
    if (!acceptedTerms) {
      nextErrors.terms = t('auth.validation.termsRequired');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const res = await signUp(fullName, email, password);
    setSubmitting(false);

    if (!res.ok) {
      setErrors({ form: res.error ?? 'Registration failed.' });
      return;
    }

    if (res.needsEmailVerification) {
      setSuccessMsg(t('auth.register.successBody'));
    } else {
      navigate('/student', { replace: true });
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <Card className="auth-card">
          <div className="auth-card__brand">
            <BrandLogo variant="icon" size="lg" />
            <div>
              <h1 className="text-h2">{t('auth.register.title')}</h1>
              <p className="text-small" style={{ marginBlockStart: 6 }}>
                {t('auth.register.subtitle')}
              </p>
            </div>
          </div>

          <form className="modal-form" onSubmit={handleSubmit} noValidate>
            <Input
              label={t('auth.register.fullNameLabel')}
              placeholder={t('auth.register.fullNamePlaceholder')}
              type="text"
              autoComplete="name"
              value={fullName}
              error={errors.fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
            />

            <Input
              label={t('auth.register.emailLabel')}
              placeholder={t('auth.register.emailPlaceholder')}
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
                label={t('auth.register.passwordLabel')}
                placeholder={t('auth.register.passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

            <Input
              label={t('auth.register.confirmPasswordLabel')}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
            />

            <div className="ui-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                />
                <span>{t('auth.register.termsLabel')}</span>
              </label>
              {errors.terms ? (
                <span role="alert" className="ui-field__error">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.terms}</span>
                </span>
              ) : null}
            </div>

            {errors.form ? <Alert variant="error" title={errors.form} /> : null}
            {successMsg ? (
              <Alert variant="success" title={t('auth.register.successTitle')}>
                {successMsg}
              </Alert>
            ) : null}

            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? '...' : t('auth.register.submitButton')}
            </Button>
          </form>

          <p className="auth-footer-text">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login">{t('auth.register.loginLink')}</Link>
          </p>
        </Card>
      </div>
    </section>
  );
}
