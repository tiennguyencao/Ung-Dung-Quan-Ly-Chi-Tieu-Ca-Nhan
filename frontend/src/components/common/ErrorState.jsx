import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import useLanguage from '../../hooks/useLanguage.js';

// A failed fetch and "no results" must never look the same — this is the
// distinct visual for the former, with a Retry action, used wherever a page's
// primary list fetch can fail (Transactions, Budgets, Categories).
export default function ErrorState({ message = "Couldn't load this. Check your connection and try again.", onRetry }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-expense/10 text-expense">
        <AlertTriangle size={22} />
      </div>
      <p className="max-w-xs text-sm text-muted">{t(message)}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('Try again')}
        </Button>
      )}
    </div>
  );
}
