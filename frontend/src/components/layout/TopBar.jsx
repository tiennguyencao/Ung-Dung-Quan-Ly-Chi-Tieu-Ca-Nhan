import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import Button from '../common/Button';
import LanguageSwitcher from '../common/LanguageSwitcher';
import useLanguage from '../../hooks/useLanguage.js';

// "Add transaction" is reachable from any screen (User Flow §5.2 in
// ui-design-baseline-v1.0.md) — AppShell owns the modal, TopBar triggers it on
// desktop. Below md, BottomNav's floating button is the add affordance
// instead, so this one is hidden there rather than duplicating it.
export default function TopBar({ onAddTransaction }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((item) => item.path === pathname);
  const title = pathname === '/categories' ? 'Manage categories' : current?.label || 'Home';

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-4 md:px-8">
      <h1 className="font-serif text-lg font-semibold text-charcoal">{t(title)}</h1>
      <div className="flex items-center gap-2">
      <LanguageSwitcher compact />
      <Button onClick={onAddTransaction} className="hidden !px-3.5 md:inline-flex">
        <Plus size={16} />
        {t('Add transaction')}
      </Button>
      </div>
    </header>
  );
}
