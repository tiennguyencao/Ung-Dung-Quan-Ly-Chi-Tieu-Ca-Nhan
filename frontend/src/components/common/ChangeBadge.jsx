import { TrendingUp, TrendingDown } from 'lucide-react';

// Renders a percent-change figure with the correct color direction. For
// expenses, "up" is bad news (spending more) so it's expense-colored; for
// income, "up" is good news so the same positive percent is income-colored.
// Shared by Statistics and Dashboard so a swing is never colored one way on
// one screen and the other way on the other.
export default function ChangeBadge({ percent, invert = false }) {
  const isUp = percent > 0;
  const isGood = invert ? isUp : !isUp;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const colorClass = percent === 0 ? 'text-muted' : isGood ? 'text-income' : 'text-expense';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon size={14} />
      {Math.abs(percent)}%
    </span>
  );
}
