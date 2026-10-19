import { Pencil, Trash2 } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';
import { formatVND, formatDate } from '../../utils/format';
import useLanguage from '../../hooks/useLanguage.js';
import { translateCategoryName } from '../../utils/translations.js';

export default function TransactionRow({ transaction, categoryName, onEdit, onDelete }) {
  const { t, language } = useLanguage();
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <CategoryIcon name={categoryName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-charcoal">{translateCategoryName(categoryName, language)}</p>
        <p className="truncate text-xs text-muted">{transaction.note || '\u00A0'}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '\u2212'}
          {formatVND(transaction.amount, language)}
        </span>
        <span className="text-xs text-muted">{formatDate(transaction.date, language)}</span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 pl-1">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2.5 text-muted transition-colors hover:bg-paper hover:text-charcoal active:bg-paper"
          aria-label={t('Edit transaction')}
        >
          <Pencil size={16} />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2.5 text-muted transition-colors hover:bg-paper hover:text-expense active:bg-paper"
            aria-label={t('Delete transaction')}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
