import CategoryIcon from '../common/CategoryIcon';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '../../utils/constants';
import useLanguage from '../../hooks/useLanguage.js';
import { translateCategoryName } from '../../utils/translations.js';

// A grid of tap targets instead of a native <select> — category is the one
// field in Add Transaction worth the extra visual space, since it's the step
// FR-11/BR-02 both hinge on and the one most worth doing in a single tap.
// Selection state reuses each category's own color (same alpha-tint pattern
// as CategoryIcon) rather than one generic brand-color highlight, so the
// picker stays visually consistent with how categories render everywhere else.
export default function CategoryPicker({ categories, value, onChange, error }) {
  const { language } = useLanguage();
  return (
    <div>
      <div role="group" aria-label={language === 'vi' ? 'Danh mục' : 'Category'} className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {categories.map((category) => {
          const active = category.id === value;
          const color = CATEGORY_COLORS[category.name] || DEFAULT_CATEGORY_COLOR;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-colors ${
                active ? 'border-current' : 'border-border hover:bg-paper'
              }`}
              style={active ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
            >
              <CategoryIcon name={category.name} size={18} />
              <span className="line-clamp-1 w-full text-[11px] font-medium leading-tight text-charcoal">
                {translateCategoryName(category.name, language)}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-expense">{error}</p>}
    </div>
  );
}
