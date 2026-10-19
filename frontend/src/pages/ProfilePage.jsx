import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Tag, ChevronRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Panel from '../components/common/Panel';
import Field from '../components/common/Field';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateEmail, validateRequired, runValidators } from '../utils/validators';
import useLanguage from '../hooks/useLanguage.js';

// PUT /users/me only accepts { name?, email? } (api-contract-v1.0.md) — no
// password-change field, so this form doesn't offer one.
export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const [values, setValues] = useState({ name: user?.name || '', email: user?.email || '' });
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
    });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await updateProfile(values);
      addToast('Profile updated.');
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
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Panel title={t('Profile')}>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Field label={t('Name')} htmlFor="name" error={errors.name} required>
            <Input id="name" value={values.name} onChange={(e) => update('name', e.target.value)} />
          </Field>
          <Field label={t('Email')} htmlFor="email" error={errors.email} required>
            <Input id="email" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} />
          </Field>
          {errors.form && <p className="text-sm text-expense">{t(errors.form)}</p>}
          <Button type="submit" loading={loading} className="self-start">
            {t("Save changes")}
          </Button>
        </form>
      </Panel>

      <Panel className="p-0">
        <Link
          to="/categories"
          className="flex items-center gap-3 rounded-t-xl px-5 py-4 text-sm font-medium text-charcoal transition-colors hover:bg-paper"
        >
          <Tag size={16} className="text-muted" />
          <span className="flex-1">{t("Manage categories")}</span>
          <ChevronRight size={16} className="text-muted" />
        </Link>
        <div className="border-t border-border" />
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-b-xl px-5 py-4 text-sm font-medium text-expense transition-colors hover:bg-paper"
        >
          <LogOut size={16} />
          {t("Log out")}
        </button>
      </Panel>
    </div>
  );
}
