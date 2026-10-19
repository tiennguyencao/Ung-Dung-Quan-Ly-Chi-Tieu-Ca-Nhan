import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Field from '../common/Field';
import Input from '../common/Input';
import Button from '../common/Button';
import * as categoryApi from '../../services/categoryApi';
import { validateRequired, runValidators } from '../../utils/validators';
import useLanguage from '../../hooks/useLanguage.js';

// api-contract-v1.0.md scopes both POST and PUT /categories to { name } only —
// icon/color are a presentation-layer lookup by name (utils/constants.js),
// not something the user picks per category.
export default function CategoryFormModal({ open, editing, onClose, onSaved }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.name || '');
      setError('');
    }
  }, [open, editing]);

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = runValidators({ name }, { name: (v) => validateRequired(v, 'Category name') });
    if (fieldErrors.name) {
      setError(fieldErrors.name);
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await categoryApi.updateCategory(editing.id, { name });
        onSaved('Category updated.');
      } else {
        await categoryApi.createCategory({ name });
        onSaved('Category added.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t(editing ? 'Edit category' : 'Add category')} width="max-w-sm">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('Name')} htmlFor="categoryName" error={error} required>
          <Input id="categoryName" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
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
