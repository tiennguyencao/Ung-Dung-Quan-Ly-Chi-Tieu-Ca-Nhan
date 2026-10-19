import { Utensils, Car, Receipt, Film, Briefcase, Gift, GraduationCap, Tag } from 'lucide-react';

// One name → icon/color map, imported everywhere a category needs to render
// (transaction rows, category list, charts, budget cards) — this is what "do not
// hardcode repeated UI structures" means applied to data, not just components.
export const CATEGORY_ICONS = {
  'Ăn uống': Utensils,
  'Di chuyển': Car,
  'Hóa đơn': Receipt,
  'Giải trí': Film,
  'Lương': Briefcase,
  'Thưởng': Gift,
  'Học phí': GraduationCap,
};
export const DEFAULT_CATEGORY_ICON = Tag;

export const CATEGORY_COLORS = {
  'Ăn uống': '#C17F17',
  'Di chuyển': '#2A5C8A',
  'Hóa đơn': '#8B4038',
  'Giải trí': '#6B4C7A',
  'Lương': '#0E4B3F',
  'Thưởng': '#2D7A6B',
  'Học phí': '#5C6B62',
};
export const DEFAULT_CATEGORY_COLOR = '#5C6B62';

export const TRANSACTION_TYPES = ['expense', 'income'];

// The 5 primary nav destinations (mobile bottom bar + desktop sidebar share
// this one list, so they can never drift apart). Categories keeps its
// existing route (/categories) but is reached from Profile now instead of
// being a 6th tab — it's a low-frequency management screen, not part of the
// core "record → categorize → review" loop this nav is optimized for.
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Home', path: '/dashboard' },
  { key: 'transactions', label: 'Transactions', path: '/transactions' },
  { key: 'budgets', label: 'Budgets', path: '/budgets' },
  { key: 'statistics', label: 'Statistics', path: '/statistics' },
  { key: 'profile', label: 'Profile', path: '/profile' },
];
