import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell';
import Field from '../components/common/Field';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import * as authApi from '../services/authApi';
import { validatePassword, validateConfirmPassword, runValidators } from '../utils/validators';
import useLanguage from '../hooks/useLanguage.js';

// UI Assumption #4 (ui-design-baseline-v1.0.md): the prototype didn't build this
// screen because it can't be demonstrated without a real emailed token — now
// that there's a real backend, this is that straightforward form, matching
// POST /api/auth/reset-password exactly.
export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [values, setValues] = useState({ newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators(values, {
      newPassword: validatePassword,
      confirmNewPassword: (v, all) => validateConfirmPassword(v, all.newPassword),
    });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword({ token, ...values });
      setDone(true);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title={t('Reset link invalid')}>
        <p className="text-center text-sm text-muted">
          {t("This reset link is missing its token. Request a new one from the forgot password page.")}
        </p>
        <Link to="/forgot-password" className="mt-4 block text-center text-sm font-medium text-ink hover:underline">
          {t("Request a new link")}
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title={t('Password updated')}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-ink">
            <CheckCircle2 size={22} />
          </div>
          <p className="text-sm text-charcoal">{t('Your password has been updated. Please log in.')}</p>
          <Button onClick={() => navigate('/login', { replace: true })} className="mt-2">
            {t("Go to log in")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('Set a new password')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('New password')} htmlFor="newPassword" error={errors.newPassword} required hint={t('At least 8 characters')}>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(e) => update('newPassword', e.target.value)}
          />
        </Field>
        <Field label={t('Confirm new password')} htmlFor="confirmNewPassword" error={errors.confirmNewPassword} required>
          <Input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmNewPassword}
            onChange={(e) => update('confirmNewPassword', e.target.value)}
          />
        </Field>
        {errors.form && <p className="text-sm text-expense">{t(errors.form)}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {t("Update password")}
        </Button>
      </form>
    </AuthShell>
  );
}
