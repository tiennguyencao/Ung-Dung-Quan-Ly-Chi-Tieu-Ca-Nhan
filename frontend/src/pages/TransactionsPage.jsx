import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Receipt, SlidersHorizontal } from 'lucide-react';
import * as transactionApi from '../services/transactionApi';
import * as categoryApi from '../services/categoryApi';
import TransactionRow from '../components/transactions/TransactionRow';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Panel from '../components/common/Panel';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Field from '../components/common/Field';
import Modal from '../components/common/Modal';
import SegmentedControl from '../components/common/SegmentedControl';
import { relativeDateLabel } from '../utils/format';
import useLanguage from '../hooks/useLanguage.js';
import { translateCategoryName } from '../utils/translations.js';

const EMPTY_FILTERS = { type: '', categoryId: '', startDate: '', endDate: '' };
const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

// Groups an already date-descending-sorted list into { label, items }
// sections — relies on the API's default sort (date desc, then createdAt
// desc), so same-day rows are always contiguous and this can group in one pass.
function groupByDate(transactions, language) {
  const groups = [];
  let current = null;
  for (const t of transactions) {
    const label = relativeDateLabel(t.date, language);
    if (!current || current.label !== label) {
      current = { label, items: [] };
      groups.push(current);
    }
    current.items.push(t);
  }
  return groups;
}

export default function TransactionsPage() {
  const { t, language } = useLanguage();
  const { openEditTransaction, refreshKey, notify } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    categoryApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchText(searchText.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      if (filters.type) query.type = filters.type;
      if (filters.categoryId) query.categoryId = filters.categoryId;
      if (debouncedSearchText) query.q = debouncedSearchText;
      if (filters.startDate) query.startDate = filters.startDate;
      if (filters.endDate) query.endDate = filters.endDate;
      const data = await transactionApi.listTransactions(query);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.categoryId, filters.startDate, filters.endDate, debouncedSearchText]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refreshKey]);

  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const sheetFilterCount = [filters.type, filters.categoryId, filters.startDate, filters.endDate].filter(Boolean).length;
  const hasActiveFilter = sheetFilterCount > 0 || searchText.trim().length > 0;
  const groups = useMemo(() => groupByDate(transactions, language), [transactions, language]);

  async function handleDelete() {
    setDeleteError('');
    try {
      await transactionApi.deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      notify('Transaction deleted.');
      loadTransactions();
    } catch (err) {
      // Not clearing deleteTarget here is what keeps the dialog open so the
      // person can see what went wrong and retry, instead of the delete
      // silently failing with no feedback at all.
      setDeleteError(err.message);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder={t('Search notes...')}
            className="pl-9"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterSheetOpen(true)}
          aria-label={t('Filters')}
          className={`relative flex shrink-0 items-center justify-center rounded-lg border px-3.5 transition-colors ${
            sheetFilterCount > 0 ? 'border-ink bg-ink text-white' : 'border-border bg-surface text-charcoal hover:bg-paper'
          }`}
        >
          <SlidersHorizontal size={16} />
          {sheetFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-expense text-[10px] font-semibold text-white">
              {sheetFilterCount}
            </span>
          )}
        </button>
      </div>

      <Panel className="p-0 sm:p-2">
        <div className="px-3">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted">{t('Loading transactions…')}</p>
          ) : error ? (
            <ErrorState onRetry={loadTransactions} />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={hasActiveFilter ? 'No matching transactions' : 'No transactions yet'}
              description={
                hasActiveFilter ? 'Try a different filter or search term.' : 'Use the + button to log your first one.'
              }
            />
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="pb-2 pt-3 text-sm font-semibold text-charcoal">{t(group.label)}</p>
                {group.items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    categoryName={categoryNameById.get(t.categoryId) || 'Uncategorised'}
                    onEdit={() => openEditTransaction(t)}
                    onDelete={() => {
                      setDeleteError('');
                      setDeleteTarget(t);
                    }}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </Panel>

      <Modal open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title={t('Filters')}>
        <div className="flex flex-col gap-5">
          <Field label={t('Type')}>
            <SegmentedControl
              value={filters.type}
              onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
              options={TYPE_FILTER_OPTIONS}
            />
          </Field>

          <Field label={t('Category')} htmlFor="filter-category">
            <Select
              id="filter-category"
              value={filters.categoryId}
              onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">{t('All categories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {translateCategoryName(c.name, language)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('From')} htmlFor="filter-start">
              <Input
                id="filter-start"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              />
            </Field>
            <Field label={t('To')} htmlFor="filter-end">
              <Input
                id="filter-end"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              />
            </Field>
          </div>

          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFilters({ ...EMPTY_FILTERS })}
              disabled={sheetFilterCount === 0}
            >
              {t('Clear filters')}
            </Button>
            <Button type="button" onClick={() => setFilterSheetOpen(false)}>
              {t('Show results')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('Delete transaction?')}
        message={deleteError || "This can't be undone."}
        onConfirm={handleDelete}
      />
    </div>
  );
}
