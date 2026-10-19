import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Field from '../common/Field';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import * as budgetApi from '../../services/budgetApi';
import { validateAmount, runValidators } from '../../utils/validators';
import { currentMonthKey } from '../../utils/format';
import useLanguage from '../../hooks/useLanguage.js';
import { translateCategoryName } from '../../utils/translations.js';

const EMPTY_FORM = { month: currentMonthKey(), categoryId: '', limitAmount: '' };

// UI Assumption #5 (ui-design-baseline-v1.0.md): month and category are the
// budget's identity and can't change after creation (api-contract-v1.0.md PUT
// only accepts limitAmount) — both fields are disabled while editing.
export default function BudgetFormModal({ open, editing, categories, onClose, onSaved }) {
  const { t, language } = useLanguage();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(
      editing
        ? { month: editing.month, categoryId: editing.categoryId || '', limitAmount: String(editing.limitAmount) }
        : EMPTY_FORM
    );
  }, [open, editing]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators(values, { limitAmount: validateAmount });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await budgetApi.updateBudget(editing.id, { limitAmount: Number(values.limitAmount) });
        onSaved('Budget updated.');
      } else {
        await budgetApi.createBudget({
          month: values.month,
          categoryId: values.categoryId || null,
          limitAmount: Number(values.limitAmount),
        });
        onSaved('Budget added.');
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t(editing ? 'Edit budget' : 'Add budget')} width="max-w-sm">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('Month')} htmlFor="month">
          <Input
            id="month"
            type="month"
            value={values.month}
            onChange={(e) => update('month', e.target.value)}
            disabled={Boolean(editing)}
          />
        </Field>
        <Field label={t('Category')} htmlFor="categoryId" hint={t('Leave as Overall for a whole-month budget')}>
          <Select
            id="categoryId"
            value={values.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            disabled={Boolean(editing)}
          >
            <option value="">{t('Overall (all categories)')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {translateCategoryName(c.name, language)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('Limit (VND)')} htmlFor="limitAmount" error={errors.limitAmount} required>
          <Input
            id="limitAmount"
            type="number"
            min="0"
            step="1000"
            value={values.limitAmount}
            onChange={(e) => update('limitAmount', e.target.value)}
            autoFocus
          />
        </Field>

        {errors.form && <p className="text-sm text-expense">{t(errors.form)}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit" loading={loading}>
            {t("Save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
