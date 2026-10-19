import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthShell from '../components/layout/AuthShell';
import Field from '../components/common/Field';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { validateEmail, validateRequired, runValidators } from '../utils/validators';
import useLanguage from '../hooks/useLanguage.js';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Lazy init captures RegisterPage's signal exactly once, on the render that
  // follows the redirect — never re-derives it from location on later renders.
  const [showWelcomeToast, setShowWelcomeToast] = useState(() => Boolean(location.state?.justRegistered));

  useEffect(() => {
    if (!showWelcomeToast) return;
    addToast('Account created — log in to continue.');
    setShowWelcomeToast(false);
    // Browser history state survives a hard refresh, unlike in-memory state —
    // clearing it here stops the toast reappearing if the person reloads /login.
    navigate(location.pathname, { replace: true, state: null });
  }, [showWelcomeToast, addToast, navigate, location.pathname]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators(values, {
      email: validateEmail,
      password: (v) => validateRequired(v, 'Password'),
    });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t('Welcome back')} subtitle={t('Log in to your expense manager')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('Email')} htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label={t('Password')} htmlFor="password" error={errors.password} required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </Field>

        {errors.form && <p className="text-sm text-expense">{t(errors.form)}</p>}

        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-sm text-ink hover:underline">
            {t("Forgot password?")}
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {t("Log in")}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {t("Don't have an account?")}{' '}
        <Link to="/register" className="font-medium text-ink hover:underline">
          {t("Create one")}
        </Link>
      </p>
    </AuthShell>
  );
}
