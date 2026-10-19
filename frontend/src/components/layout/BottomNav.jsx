import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { NAV_ICONS } from './navIcons';
import useLanguage from '../../hooks/useLanguage.js';

function NavItem({ item }) {
  const { t } = useLanguage();
  const Icon = NAV_ICONS[item.key];
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
          isActive ? 'text-ink' : 'text-muted'
        }`
      }
    >
      <Icon size={18} />
      {t(item.label)}
    </NavLink>
  );
}

// Mobile only (<768px) — same five destinations as Sidebar. The Add button
// isn't one of NAV_ITEMS — it opens the modal AppShell owns rather than
// navigating — so it gets its own fixed 64px slot between Transactions and
// Budgets, as a direct flex sibling of the five NavLinks. That keeps all 5
// tabs perfectly equal-width regardless of which side of the button they're
// on, and gives the button a guaranteed-clear space to float in rather than
// risking overlap with a tab icon on narrow phones.
export default function BottomNav({ onAddTransaction }) {
  const { t } = useLanguage();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label={t('Primary')}
    >
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <NavItem key={item.key} item={item} />
      ))}

      <div className="relative w-16 shrink-0">
        <button
          type="button"
          onClick={onAddTransaction}
          aria-label={t('Add transaction')}
          className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform active:scale-95"
        >
          <Plus size={26} />
        </button>
      </div>

      {NAV_ITEMS.slice(2).map((item) => (
        <NavItem key={item.key} item={item} />
      ))}
    </nav>
  );
}
