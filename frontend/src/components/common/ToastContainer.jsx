import { CheckCircle2, XCircle } from 'lucide-react';
import useToast from '../../hooks/useToast';
import useLanguage from '../../hooks/useLanguage.js';

// Motion rule #2: toast entrance is a slide-in — animate-slide-in below.
// Cross-cutting layer used from every screen (every create/update/delete/error).
export default function ToastContainer() {
  const { toasts } = useToast();
  const { t } = useLanguage();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[60] flex flex-col gap-2 md:inset-x-auto md:bottom-5 md:right-5 md:w-full md:max-w-sm">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const Icon = isError ? XCircle : CheckCircle2;
        return (
          <div
            key={toast.id}
            className={`flex animate-slide-in items-start gap-2.5 rounded-lg border bg-surface p-3.5 text-sm shadow-lg ${
              isError ? 'border-expense/30 text-expense' : 'border-ink/20 text-charcoal'
            }`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${isError ? 'text-expense' : 'text-ink'}`} />
            <span>{t(toast.message)}</span>
          </div>
        );
      })}
    </div>
  );
}
