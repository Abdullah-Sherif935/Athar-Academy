import { CheckCircle2, KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Alert, Button, Card, Input } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { markInstructorOnboardingComplete } from '../../../services/instructorOnboardingService';

export function SetPasswordPage() {
  const { locale } = useI18n();
  const { user, isLoading, refreshAuth, getHomeRoute } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isAr = locale === 'ar';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(
        isAr
          ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'
          : 'Password must be at least 8 characters long.',
      );
      return;
    }
    if (password !== confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setSubmitting(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setSubmitting(false);
      setError(updateErr.message);
      return;
    }

    await markInstructorOnboardingComplete();
    await refreshAuth();
    setSubmitting(false);
    setDone(true);

    setTimeout(() => {
      navigate(getHomeRoute(), { replace: true });
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <Card className="auth-card" style={{ maxWidth: 460 }}>
          <div className="auth-card__brand">
            <Link to="/" aria-label="ATHAR ACADEMY">
              <BrandLogo variant="horizontal" size="md" />
            </Link>
            <div
              className="feature-card__icon feature-card__icon--teal"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            >
              <KeyRound size={22} />
            </div>
            <h1 className="text-h2">
              {isAr ? 'إعداد كلمة المرور لحسابك' : 'Set Up Your Account Password'}
            </h1>
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {isAr
                ? 'أكمل تفعيل حسابك في أكاديمية أثر بتعيين كلمة مرور قوية.'
                : 'Complete your ATHAR ACADEMY onboarding by setting a strong password.'}
            </p>
          </div>

          {isLoading ? (
            <p className="text-body" style={{ textAlign: 'center' }}>
              {isAr ? 'جارٍ التحقق من رابط الدعوة...' : 'Verifying your setup link...'}
            </p>
          ) : !user ? (
            <div className="details-stack" style={{ gap: 12 }}>
              <Alert
                variant="warning"
                title={isAr ? 'رابط الإعداد غير نشط أو منتهي الصلاحية' : 'Setup Link Inactive or Expired'}
              >
                {isAr
                  ? 'يرجى فتح رابط الدعوة المرسل من المشرف العام أو طلب إعادة تعيين كلمة المرور.'
                  : 'Please open the invitation link sent by the Super Admin or request a password reset.'}
              </Alert>
              <Link to="/login" className="ui-btn ui-btn--primary ui-btn--md">
                {isAr ? 'الانتقال إلى تسجيل الدخول' : 'Go to Login'}
              </Link>
            </div>
          ) : done ? (
            <Alert
              variant="success"
              title={isAr ? 'تم تفعيل حسابك بنجاح!' : 'Account Activated Successfully!'}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} aria-hidden="true" />
                {isAr ? 'جارٍ تحويلك إلى بوابتك...' : 'Redirecting you to your portal...'}
              </span>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="details-stack" style={{ gap: 14 }}>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                {isAr ? 'الحساب:' : 'Account:'}{' '}
                <strong className="ltr-inline">{user.email}</strong>
              </div>
              <Input
                label={isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <Input
                label={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {error ? <Alert variant="error" title={error} /> : null}
              <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                {submitting
                  ? isAr
                    ? 'جارٍ الحفظ...'
                    : 'Saving...'
                  : isAr
                    ? 'تفعيل الحساب والدخول'
                    : 'Activate Account & Sign In'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
