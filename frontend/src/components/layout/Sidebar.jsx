import { NavLink } from 'react-router-dom';
import { LogOut, Wallet as LogoIcon } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { NAV_ICONS } from './navIcons';
import useAuth from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage.js';

// Desktop only (>=768px) — BottomNav covers the same destinations on mobile.
export default function Sidebar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
          <LogoIcon size={16} />
        </div>
        <span className="font-serif text-sm font-semibold text-charcoal">{t('Expense Manager')}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label={t('Primary')}>
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.key];
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-white' : 'text-charcoal hover:bg-paper'
                }`
              }
            >
              <Icon size={16} />
              {t(item.label)}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="mb-2 truncate px-3 text-xs text-muted">{user?.email}</div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-paper hover:text-expense"
        >
          <LogOut size={16} />
          {t('Log out')}
        </button>
      </div>
    </aside>
  );
}
