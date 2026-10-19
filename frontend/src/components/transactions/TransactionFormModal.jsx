import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../common/Modal';
import Field from '../common/Field';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import SegmentedControl from '../common/SegmentedControl';
import CategoryPicker from './CategoryPicker';
import * as transactionApi from '../../services/transactionApi';
import * as categoryApi from '../../services/categoryApi';
import { todayIso, yesterdayIso } from '../../utils/format';
import { validateRequired, validateAmount, validateNote, runValidators } from '../../utils/validators';
import useLanguage from '../../hooks/useLanguage.js';

const EMPTY_FORM = { type: 'expense', categoryId: '', amount: '', date: todayIso(), note: '' };
const TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense', activeClassName: 'border-expense bg-expense text-white' },
  { value: 'income', label: 'Income', activeClassName: 'border-ink bg-ink text-white' },
];

// Add + Edit share this one component (`editing` prop present or null) — same
// fields, same rules, POST vs PUT — per ui-design-baseline-v1.0.md §3.
export default function TransactionFormModal({ open, editing, onClose, onSaved }) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    if (open) categoryApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setValues({
        type: editing.type,
        categoryId: editing.categoryId,
        amount: String(editing.amount),
        date: editing.date.slice(0, 10),
        note: editing.note || '',
      });
      setNoteOpen(Boolean(editing.note));
    } else {
      setValues(EMPTY_FORM);
      setNoteOpen(false);
    }
  }, [open, editing]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators(values, {
      categoryId: (v) => validateRequired(v, 'Category'),
      amount: validateAmount,
      date: (v) => validateRequired(v, 'Date'),
      note: validateNote,
    });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const payload = { ...values, amount: Number(values.amount) };
      if (editing) {
        await transactionApi.updateTransaction(editing.id, payload);
        onSaved('Transaction updated.');
      } else {
        await transactionApi.createTransaction(payload);
        onSaved('Transaction added.');
      }
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

  const isToday = values.date === todayIso();
  const isYesterday = values.date === yesterdayIso();

  return (
    <Modal open={open} onClose={onClose} title={t(editing ? 'Edit transaction' : 'Add transaction')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <SegmentedControl value={values.type} onChange={(v) => update('type', v)} options={TYPE_OPTIONS} />

        <Field label={t('Amount (VND)')} htmlFor="amount" error={errors.amount} required>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            placeholder="0"
            value={values.amount}
            onChange={(e) => update('amount', e.target.value)}
            className="!py-3 !text-2xl !font-semibold"
            autoFocus
          />
        </Field>

        <Field label={t('Category')} error={errors.categoryId} required>
          <CategoryPicker
            categories={categories}
            value={values.categoryId}
            onChange={(id) => update('categoryId', id)}
          />
        </Field>

        <Field label={t('Date')} htmlFor="date" error={errors.date} required>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update('date', todayIso())}
              className={`shrink-0 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                isToday ? 'border-ink bg-ink text-white' : 'border-border text-charcoal hover:bg-paper'
              }`}
            >
              {t("Today")}
            </button>
            <button
              type="button"
              onClick={() => update('date', yesterdayIso())}
              className={`shrink-0 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                isYesterday ? 'border-ink bg-ink text-white' : 'border-border text-charcoal hover:bg-paper'
              }`}
            >
              {t("Yesterday")}
            </button>
            <Input
              id="date"
              type="date"
              value={values.date}
              onChange={(e) => update('date', e.target.value)}
              className="min-w-0 flex-1"
            />
          </div>
        </Field>

        {noteOpen ? (
          <Field label={t('Note')} htmlFor="note" error={errors.note} hint={t('Optional, up to 500 characters')}>
            <Textarea id="note" value={values.note} onChange={(e) => update('note', e.target.value)} autoFocus />
          </Field>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="flex items-center gap-1.5 self-start text-sm font-medium text-muted transition-colors hover:text-charcoal"
          >
            <Plus size={14} />
            {t("Add note")}
          </button>
        )}

        {errors.form && <p className="text-sm text-expense">{t(errors.form)}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit" loading={loading}>
            {editing ? t('Save changes') : t('Add transaction')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
