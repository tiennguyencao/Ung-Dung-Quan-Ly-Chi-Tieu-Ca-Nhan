import { WifiOff } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import useLanguage from '../../hooks/useLanguage.js';

// The installed app opens and navigates offline because the shell is
// precached — but nothing financial is. This says so plainly, so an empty
// screen is never mistaken for "you have no transactions", and no one
// assumes an edit made offline was saved somewhere.
export default function OfflineBanner() {
  const { t } = useLanguage();
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warn/15 px-4 py-2 text-xs font-medium text-charcoal"
    >
      <WifiOff size={14} className="shrink-0 text-warn" />
      {t("You're offline — figures can't be loaded or saved right now.")}
    </div>
  );
}
