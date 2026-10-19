import { CATEGORY_ICONS, CATEGORY_COLORS, DEFAULT_CATEGORY_ICON, DEFAULT_CATEGORY_COLOR } from '../../utils/constants';

// One name -> icon/color map, used everywhere a category renders (transaction
// rows, category list, charts, budget cards) so a category is recognizable by
// shape and color everywhere it appears.
export default function CategoryIcon({ name, size = 16 }) {
  const Icon = CATEGORY_ICONS[name] || DEFAULT_CATEGORY_ICON;
  const color = CATEGORY_COLORS[name] || DEFAULT_CATEGORY_COLOR;
  const boxSize = size + 14;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: boxSize, height: boxSize, backgroundColor: `${color}1A`, color }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}
