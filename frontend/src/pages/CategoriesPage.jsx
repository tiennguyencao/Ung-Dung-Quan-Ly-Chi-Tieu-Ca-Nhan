import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import * as categoryApi from '../services/categoryApi';
import CategoryIcon from '../components/common/CategoryIcon';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorState from '../components/common/ErrorState';
import Panel from '../components/common/Panel';
import Button from '../components/common/Button';
import useLanguage from '../hooks/useLanguage.js';
import { translateCategoryName } from '../utils/translations.js';

export default function CategoriesPage() {
  const { t, language } = useLanguage();
  const { notify } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setCategories(await categoryApi.listCategories());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(message) {
    setModal({ open: false, editing: null });
    notify(message);
    load();
  }

  async function handleDelete() {
    setDeleteError('');
    try {
      await categoryApi.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      notify('Category deleted.');
      load();
    } catch (err) {
      // BR-04: blocked-by-transactions comes back as a specific message with a
      // count — surface it in the dialog itself rather than a generic toast.
      // Not calling setDeleteTarget(null) here is what keeps the dialog open.
      setDeleteError(err.message);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setModal({ open: true, editing: null })}>
          <Plus size={16} />
          {t('Add category')}
        </Button>
      </div>

      <Panel>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted">{t('Loading categories…')}</p>
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <CategoryIcon name={category.name} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal">{translateCategoryName(category.name, language)}</span>
                {category.isDefault ? (
                  <Lock size={14} className="shrink-0 text-muted" aria-label={t('Default category')} />
                ) : (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setModal({ open: true, editing: category })}
                      className="rounded-lg p-2.5 text-muted transition-colors hover:bg-paper hover:text-charcoal"
                      aria-label={t('Edit category')}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget(category);
                      }}
                      className="rounded-lg p-2.5 text-muted transition-colors hover:bg-paper hover:text-expense"
                      aria-label={t('Delete category')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <CategoryFormModal
        open={modal.open}
        editing={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('Delete category?')}
        message={deleteError || (language === 'vi' ? `Xóa danh mục "${translateCategoryName(deleteTarget?.name, language)}"? Thao tác này không thể hoàn tác.` : `Delete "${deleteTarget?.name}"? This can't be undone.`)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
