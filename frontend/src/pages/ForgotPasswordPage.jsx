import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell';
import Field from '../components/common/Field';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import * as authApi from '../services/authApi';
import { validateEmail, runValidators } from '../utils/validators';
import useLanguage from '../hooks/useLanguage.js';

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators({ email }, { email: validateEmail });
    if (fieldErrors.email) {
      setError(fieldErrors.email);
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Server always returns the same success message whether or not the
      // email is registered (BR-10) — this screen never learns which.
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title={t('Check your email')}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-ink">
            <MailCheck size={22} />
          </div>
          <p className="text-sm text-charcoal">
            {language === 'vi' ? <>Nếu email <span className="font-medium">{email}</span> đã đăng ký, liên kết đặt lại mật khẩu đang được gửi.</> : <>If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.</>}
          </p>
          <Link to="/login" className="mt-2 text-sm font-medium text-ink hover:underline">
            {t("Back to log in")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('Forgot password')} subtitle={t("We'll send you a link to reset it")}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('Email')} htmlFor="email" error={error} required>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          {t("Send reset link")}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        <Link to="/login" className="font-medium text-ink hover:underline">
          {t("Back to log in")}
        </Link>
      </p>
    </AuthShell>
  );
}
