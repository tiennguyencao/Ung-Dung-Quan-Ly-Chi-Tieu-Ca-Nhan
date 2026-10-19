import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/layout/AuthShell';
import Field from '../components/common/Field';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import * as authApi from '../services/authApi';
import { validateEmail, validatePassword, validateConfirmPassword, validateRequired, runValidators } from '../utils/validators';
import useLanguage from '../hooks/useLanguage.js';

export default function RegisterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators(values, {
      name: (v) => validateRequired(v, 'Name'),
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (v, all) => validateConfirmPassword(v, all.password),
    });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      // Registration does not log the user in (api-contract-v1.0.md) — redirect
      // to /login rather than storing a token that was never issued.
      await authApi.register(values);
      navigate('/login', { replace: true, state: { justRegistered: true } });
    } catch (err) {
      if (err.errors?.length) {
        const mapped = {};
        err.errors.forEach((fe) => {
          mapped[fe.field] = fe.message;
        });
        setErrors(mapped);
      } else {
        setErrors({ form: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t('Create your account')} subtitle={t('Start tracking your spending in minutes')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('Name')} htmlFor="name" error={errors.name} required>
          <Input id="name" autoComplete="name" value={values.name} onChange={(e) => update('name', e.target.value)} />
        </Field>
        <Field label={t('Email')} htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label={t('Password')} htmlFor="password" error={errors.password} required hint={t('At least 8 characters')}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </Field>
        <Field label={t('Confirm password')} htmlFor="confirmPassword" error={errors.confirmPassword} required>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
          />
        </Field>

        {errors.form && <p className="text-sm text-expense">{t(errors.form)}</p>}

        <Button type="submit" loading={loading} className="w-full">
          {t("Create account")}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {t('Already have an account?')}{' '}
        <Link to="/login" className="font-medium text-ink hover:underline">
          {t("Log in")}
        </Link>
      </p>
    </AuthShell>
  );
}
