import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as budgetApi from '../services/budgetApi';
import * as statsApi from '../services/statsApi';
import * as transactionApi from '../services/transactionApi';
import * as categoryApi from '../services/categoryApi';
import Panel from '../components/common/Panel';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import ChangeBadge from '../components/common/ChangeBadge';
import TransactionRow from '../components/transactions/TransactionRow';
import SpendingByCategoryChart from '../components/charts/SpendingByCategoryChart';
import { formatVND, currentMonthKey, monthBounds } from '../utils/format';
import { getBudgetStatus } from '../utils/budget';
import useLanguage from '../hooks/useLanguage.js';
import { translateCategoryName } from '../utils/translations.js';

// Mobile-first Home: one hero number (this month's balance), then the two
// numbers it's made of, then just enough budget/spending/recent-activity
// context to answer "am I OK?" in a glance — deeper detail lives on
// Transactions/Budgets/Statistics rather than being duplicated here.
export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { openEditTransaction, refreshKey } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [thisMonth, setThisMonth] = useState({ income: 0, expense: 0 });
  const [changePercent, setChangePercent] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categoryNameById, setCategoryNameById] = useState(new Map());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [budgetResult, categoryStatResult, trendResult, recentResult, categoriesResult, compareResult] =
          await Promise.allSettled([
            budgetApi.listBudgets(currentMonthKey()),
            statsApi.getByCategory({}),
            statsApi.getOverview({ granularity: 'month' }),
            transactionApi.listTransactions({}),
            categoryApi.listCategories(),
            statsApi.getComparison({
              period1Start: monthBounds(1).start,
              period1End: monthBounds(1).end,
              period2Start: monthBounds(0).start,
              period2End: monthBounds(0).end,
            }),
          ]);
        if (cancelled) return;
        setBudgets(budgetResult.status === 'fulfilled' ? budgetResult.value : []);
        setByCategory(categoryStatResult.status === 'fulfilled' ? categoryStatResult.value : []);
        // Reuse the same trend series the old dashboard already fetched (no
        // new endpoint) — just read out the entry matching the current month
        // instead of drawing a whole second chart for it.
        const trend = trendResult.status === 'fulfilled' ? trendResult.value : [];
        const currentEntry = trend.find((t) => t.period === currentMonthKey());
        setThisMonth({ income: currentEntry?.income || 0, expense: currentEntry?.expense || 0 });
        setRecent(recentResult.status === 'fulfilled' ? recentResult.value.slice(0, 5) : []);
        setCategoryNameById(
          new Map(categoriesResult.status === 'fulfilled' ? categoriesResult.value.map((c) => [c.id, c.name]) : [])
        );
        setChangePercent(compareResult.status === 'fulfilled' ? compareResult.value.percentChange : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted">{t('Loading…')}</p>;
  }

  const balance = thisMonth.income - thisMonth.expense;
  const urgentBudgets = [...budgets].sort((a, b) => b.percentageUsed - a.percentageUsed).slice(0, 2);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Panel>
        <p className="text-sm text-muted">{t('Balance this month')}</p>
        <p className={`mt-1 font-serif text-4xl font-semibold ${balance < 0 ? 'text-expense' : 'text-charcoal'}`}>
          {formatVND(balance, language)}
        </p>
        <div className="mt-5 flex gap-6 border-t border-border pt-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-income/10 text-income">
              <ArrowUpRight size={16} />
            </span>
            <div>
              <p className="text-xs text-muted">{t('Income')}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-charcoal">{formatVND(thisMonth.income, language)}</p>
                {changePercent && <ChangeBadge percent={changePercent.income} invert />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-expense/10 text-expense">
              <ArrowDownRight size={16} />
            </span>
            <div>
              <p className="text-xs text-muted">{t('Expenses')}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-charcoal">{formatVND(thisMonth.expense, language)}</p>
                {changePercent && <ChangeBadge percent={changePercent.expense} />}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title={t('Budget progress')}
          action={
            <Link to="/budgets" className="text-xs font-medium text-ink hover:underline">
              {t('See all')}
            </Link>
          }
        >
          {urgentBudgets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t('No budgets set for this month yet.')}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {urgentBudgets.map((budget) => {
                const status = getBudgetStatus(budget.status);
                return (
                  <div key={budget.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-charcoal">{translateCategoryName(budget.categoryName, language)}</span>
                      <span className={status.textClass}>{budget.percentageUsed}%</span>
                    </div>
                    <ProgressBar
                      percent={budget.percentageUsed}
                      barClass={status.barClass}
                      label={language === 'vi' ? `${translateCategoryName(budget.categoryName, language)}: ${budget.percentageUsed}% đã sử dụng` : `${translateCategoryName(budget.categoryName, language)}: ${budget.percentageUsed}% used`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          title={t('Spending overview')}
          action={
            <Link to="/statistics" className="text-xs font-medium text-ink hover:underline">
              {t('See all')}
            </Link>
          }
        >
          <SpendingByCategoryChart data={byCategory} />
        </Panel>
      </div>

      <Panel
        title={t('Recent transactions')}
        action={
          <Link to="/transactions" className="text-xs font-medium text-ink hover:underline">
            {t("See all")}
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t('No transactions yet')}
            description={t('Tap the + button below to log your first one.')}
          />
        ) : (
          <div>
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                categoryName={categoryNameById.get(t.categoryId) || 'Uncategorised'}
                onEdit={() => openEditTransaction(t)}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
