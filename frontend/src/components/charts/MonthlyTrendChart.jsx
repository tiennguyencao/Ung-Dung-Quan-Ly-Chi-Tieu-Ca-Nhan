import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatVND } from '../../utils/format';
import useLanguage from '../../hooks/useLanguage.js';

// Vietnamese-shorthand axis labels ("5tr", "500k") — VND amounts run into the
// millions, so full formatVND() digits don't fit a narrow Y-axis without
// clipping (caught by screenshotting this chart during review).
function compactVND(value, language = 'en') {
  if (Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000;
    return language === 'vi' ? `${Number.isInteger(millions) ? millions : millions.toFixed(1)}tr` : `${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`;
  }
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

// Axis ticks need to stay compact — "day" granularity can show ~30 bars,
// and the raw period strings ("2026-09-15", "2026-W35") are too wide to
// repeat that many times on a phone-width chart. The full date still shows
// in the tooltip on tap/hover, so nothing is actually lost, just deferred
// until the person asks for it.
function shortPeriodLabel(period, language = 'en') {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return String(Number(period.slice(8, 10))); // day -> "15"
  if (/^\d{4}-W\d{2}$/.test(period)) return period.slice(5); // week -> "W35"
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' }); // month -> "Sep"
  }
  return period; // year -> "2026", already compact
}

function fullPeriodLabel(period, language = 'en') {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const [year, month, day] = period.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  if (/^\d{4}-W\d{2}$/.test(period)) return language === 'vi' ? `Tuần ${period.slice(6)}, ${period.slice(0, 4)}` : `Week ${period.slice(6)}, ${period.slice(0, 4)}`;
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });
  }
  return period;
}

// Hex values match tailwind.config.js's ink/expense/border tokens exactly —
// recharts renders raw SVG and needs literal color values, not utility classes.
export default function MonthlyTrendChart({ data }) {
  const { t, language } = useLanguage();
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-muted">{t('Not enough history yet.')}</p>;
  }
  return (
    <div className="h-56 w-full md:h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E1E5DF" vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={(period) => shortPeriodLabel(period, language)}
            tick={{ fontSize: 11, fill: '#5C6B62' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#5C6B62' }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(value) => compactVND(value, language)}
          />
          <Tooltip formatter={(value) => formatVND(value, language)} labelFormatter={(period) => fullPeriodLabel(period, language)} />
          <Bar dataKey="income" fill="#0E4B3F" radius={[4, 4, 0, 0]} name={t('Income')} />
          <Bar dataKey="expense" fill="#B23A20" radius={[4, 4, 0, 0]} name={t('Expense')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
