import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '../../utils/constants';
import { formatVND } from '../../utils/format';
import useLanguage from '../../hooks/useLanguage.js';
import { translateCategoryName } from '../../utils/translations.js';

export default function SpendingByCategoryChart({ data }) {
  const { t, language } = useLanguage();
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-muted">{t('No expenses recorded this month yet.')}</p>;
  }
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="mx-auto h-36 w-36 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="categoryName" innerRadius={38} outerRadius={62} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.categoryId || entry.categoryName} fill={CATEGORY_COLORS[entry.categoryName] || DEFAULT_CATEGORY_COLOR} />
              ))}
            </Pie>
            <Tooltip
              labelFormatter={(name) => translateCategoryName(name, language)}
              formatter={(value) => formatVND(value, language)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2.5">
        {data.map((entry) => (
          <li key={entry.categoryId || entry.categoryName} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-charcoal">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[entry.categoryName] || DEFAULT_CATEGORY_COLOR }}
              />
              <span className="truncate">{translateCategoryName(entry.categoryName, language)}</span>
            </span>
            <span className="shrink-0 text-muted">{entry.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
