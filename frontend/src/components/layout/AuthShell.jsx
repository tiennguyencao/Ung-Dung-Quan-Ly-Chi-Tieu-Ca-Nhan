import { Wallet } from 'lucide-react';
import LanguageSwitcher from '../common/LanguageSwitcher';

// Centered card, logo, shared by Login/Register/Forgot/Reset Password —
// component hierarchy in ui-design-baseline-v1.0.md.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="absolute right-4 top-4"><LanguageSwitcher /></div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
            <Wallet size={22} />
          </div>
          <h1 className="font-serif text-xl font-semibold text-charcoal">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">{children}</div>
      </div>
    </div>
  );
}
