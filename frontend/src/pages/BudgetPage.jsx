import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import * as budgetApi from '../services/budgetApi';
import * as categoryApi from '../services/categoryApi';
import BudgetFormModal from '../components/budget/BudgetFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Panel from '../components/common/Panel';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatVND, formatMonthLabel, currentMonthKey, shiftMonthKey } from '../utils/format';
import { getBudgetStatus } from '../utils/budget';
import useLanguage from '../hooks/useLanguage.js';
import { translateCategoryName } from '../utils/translations.js';

function BudgetCard({ budget, onEdit, onDelete }) {
  const { t, language } = useLanguage();
  const status = getBudgetStatus(budget.status);
  const remaining = budget.limitAmount - budget.spentAmount;
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-charcoal">{translateCategoryName(budget.categoryName, language)}</p>
          <p className="text-xs text-muted">
            {formatVND(budget.spentAmount, language)} {t('of')} {formatVND(budget.limitAmount, language)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <span className={`mr-1 whitespace-nowrap text-xs font-medium ${status.textClass}`}>{t(status.label)}</span>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2.5 text-muted transition-colors hover:bg-paper hover:text-charcoal"
            aria-label={t('Edit budget')}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2.5 text-muted transition-colors hover:bg-paper hover:text-expense"
            aria-label={t('Delete budget')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <ProgressBar
        percent={budget.percentageUsed}
        barClass={status.barClass}
        label={language === 'vi' ? `Ngân sách ${translateCategoryName(budget.categoryName, language)}: ${budget.percentageUsed}% đã sử dụng` : `${translateCategoryName(budget.categoryName, language)} budget: ${budget.percentageUsed}% used`}
      />
      <p className={`mt-1.5 text-xs ${remaining < 0 ? 'text-expense' : 'text-muted'}`}>
        {remaining < 0 ? `${t('Over by')} ${formatVND(Math.abs(remaining), language)}` : `${formatVND(remaining, language)} ${t('left')}`}
      </p>
    </div>
  );
}

export default function BudgetPage() {
  const { t, language } = useLanguage();
  const { notify } = useOutletContext();
  const [month, setMonth] = useState(currentMonthKey());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    categoryApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setBudgets(await budgetApi.listBudgets(month));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function handleSaved(message) {
    setModal({ open: false, editing: null });
    notify(message);
    load();
  }

  async function handleDelete() {
    setDeleteError('');
    try {
      await budgetApi.deleteBudget(deleteTarget.id);
      setDeleteTarget(null);
      notify('Budget deleted.');
      load();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  const overallBudget = budgets.find((b) => b.categoryId == null);
  const categoryBudgets = budgets.filter((b) => b.categoryId != null);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
              aria-label={t('Previous month')}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-charcoal"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowMonthPicker((v) => !v)}
              className="min-w-[9.5rem] rounded-lg px-2 py-1.5 text-center font-serif text-sm font-semibold text-charcoal transition-colors hover:bg-paper"
            >
              {formatMonthLabel(month, language)}
            </button>
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
              aria-label={t('Next month')}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-charcoal"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {showMonthPicker && (
            <Input
              type="month"
              autoFocus
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setShowMonthPicker(false);
              }}
              className="mt-2 w-40 text-center"
            />
          )}
        </div>
        <Button onClick={() => setModal({ open: true, editing: null })}>
          <Plus size={16} />
          {t('Add budget')}
        </Button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-muted">{t('Loading budgets…')}</p>
      ) : error ? (
        <Panel>
          <ErrorState onRetry={load} />
        </Panel>
      ) : budgets.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Wallet}
            title={t('No budgets for this month')}
            description={t('Tap "Add budget" to set a spending limit.')}
          />
        </Panel>
      ) : (
        <>
          {overallBudget && (
            <Panel title={t('Overall budget')}>
              <BudgetCard
                budget={overallBudget}
                onEdit={() => setModal({ open: true, editing: overallBudget })}
                onDelete={() => {
                  setDeleteError('');
                  setDeleteTarget(overallBudget);
                }}
              />
            </Panel>
          )}
          {categoryBudgets.length > 0 && (
            <Panel title={t('Category budgets')}>
              <div className="flex flex-col gap-4">
                {categoryBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={() => setModal({ open: true, editing: budget })}
                    onDelete={() => {
                      setDeleteError('');
                      setDeleteTarget(budget);
                    }}
                  />
                ))}
              </div>
            </Panel>
          )}
        </>
      )}

      <BudgetFormModal
        open={modal.open}
        editing={modal.editing}
        categories={categories}
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('Delete budget?')}
        message={deleteError || "This can't be undone."}
        onConfirm={handleDelete}
      />
    </div>
  );
}
