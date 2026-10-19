import useLanguage from '../../hooks/useLanguage.js';

// A row of mutually-exclusive pill buttons — the touch-friendly alternative to
// a native <select> when there are only a handful of options (2–4). Extracted
// from the Expense/Income toggle that used to live inline in
// TransactionFormModal so Statistics' granularity/type switches share the same
// control instead of duplicating the button styling a second and third time.
export default function SegmentedControl({ options, value, onChange, size = 'md' }) {
  const { t } = useLanguage();
  const padding = size === 'sm' ? 'py-2 text-xs' : 'py-2.5 text-sm';
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`rounded-lg border font-medium capitalize transition-colors ${padding} ${
              active
                ? `${option.activeClassName || 'border-ink bg-ink text-white'}`
                : 'border-border bg-surface text-charcoal hover:bg-paper'
            }`}
          >
            {t(option.label)}
          </button>
        );
      })}
    </div>
  );
}
