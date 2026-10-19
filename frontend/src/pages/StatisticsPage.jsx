import { useEffect, useState } from 'react';
import * as statsApi from '../services/statsApi';
import Panel from '../components/common/Panel';
import SegmentedControl from '../components/common/SegmentedControl';
import ChangeBadge from '../components/common/ChangeBadge';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import SpendingByCategoryChart from '../components/charts/SpendingByCategoryChart';
import { formatVND, monthBounds, isoDateOf } from '../utils/format';
import useLanguage from '../hooks/useLanguage.js';

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];
const CATEGORY_TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

// A day/week/month/year default range from the backend (e.g. "day" over a
// whole default year) would draw ~365 bars — pick a range per granularity so
// the chart always shows a readable number of points.
function rangeForGranularity(granularity) {
  const end = new Date();
  const start = new Date(end);
  if (granularity === 'day') start.setDate(start.getDate() - 29);
  else if (granularity === 'week') start.setDate(start.getDate() - 7 * 11);
  else if (granularity === 'month') start.setMonth(start.getMonth() - 11);
  else start.setFullYear(start.getFullYear() - 4);
  // isoDateOf, not toISOString().slice(0,10) — the latter converts to UTC
  // first, which shifts the boundary by a day for anyone east of UTC (the
  // same bug already fixed in monthBounds).
  return { startDate: isoDateOf(start), endDate: isoDateOf(end) };
}

export default function StatisticsPage() {
  const { t, language } = useLanguage();
  const [granularity, setGranularity] = useState('month');
  const [categoryType, setCategoryType] = useState('expense');
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [compare, setCompare] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { startDate, endDate } = rangeForGranularity(granularity);
        const thisMonth = monthBounds(0);
        const lastMonth = monthBounds(1);
        const [trendResult, categoryResult, compareResult] = await Promise.allSettled([
          statsApi.getOverview({ granularity, startDate, endDate }),
          statsApi.getByCategory({ type: categoryType }),
          statsApi.getComparison({
            period1Start: lastMonth.start,
            period1End: lastMonth.end,
            period2Start: thisMonth.start,
            period2End: thisMonth.end,
          }),
        ]);
        if (cancelled) return;
        setTrend(trendResult.status === 'fulfilled' ? trendResult.value : []);
        setByCategory(categoryResult.status === 'fulfilled' ? categoryResult.value : []);
        setCompare(compareResult.status === 'fulfilled' ? compareResult.value : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [granularity, categoryType]);

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted">{t('Loading statistics…')}</p>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {compare && (
        <Panel title={t('This month vs last month')}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted">{t('Expense')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-charcoal">{formatVND(compare.period2.expense, language)}</span>
                <ChangeBadge percent={compare.percentChange.expense} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">{t('Income')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-charcoal">{formatVND(compare.period2.income, language)}</span>
                <ChangeBadge percent={compare.percentChange.income} invert />
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel title={t('Income vs expense over time')}>
        <div className="mb-4">
          <SegmentedControl value={granularity} onChange={setGranularity} options={GRANULARITY_OPTIONS} size="sm" />
        </div>
        <MonthlyTrendChart data={trend} />
      </Panel>

      <Panel title={t('Breakdown by category')}>
        <div className="mb-4 max-w-[13rem]">
          <SegmentedControl value={categoryType} onChange={setCategoryType} options={CATEGORY_TYPE_OPTIONS} size="sm" />
        </div>
        <SpendingByCategoryChart data={byCategory} />
      </Panel>
    </div>
  );
}
