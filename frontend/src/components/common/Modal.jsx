import { useEffect } from 'react';
import { X } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage.js';

// Tailwind's JIT scanner needs the full class name as a literal string
// somewhere in this file — `md:${width}` at runtime would never be seen by
// the scanner, so it maps each caller-supplied width to its md:-prefixed
// desktop class explicitly instead. Add a line here if a new width is ever needed.
const DESKTOP_WIDTH = {
  'max-w-sm': 'md:max-w-sm',
  'max-w-md': 'md:max-w-md',
  'max-w-lg': 'md:max-w-lg',
};

// Motion rule #1: modal open/close is scale + fade on desktop. Below md, the
// same component presents as a bottom sheet instead (slide-up, anchored to
// the bottom edge, rounded top corners only) — the standard mobile pattern
// for a form that needs the full width and a thumb-reachable Save button.
// Every modal in the app (transaction/category/budget forms, ConfirmDialog)
// renders through this one component, so all of them get both presentations
// for free with no per-modal changes.
export default function Modal({ open, onClose, title, children, width = 'max-w-md' }) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    // Without this, a drag on the dimmed backdrop (as opposed to a tap, which
    // already closes via onClick below) can scroll the page behind an open
    // sheet on touch devices.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[88vh] w-full flex-col overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-xl animate-slide-up pb-[max(1.25rem,env(safe-area-inset-bottom))] md:max-h-none ${
          DESKTOP_WIDTH[width] || DESKTOP_WIDTH['max-w-md']
        } md:animate-scale-in md:rounded-xl md:p-6 md:pb-6`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-border md:hidden" aria-hidden="true" />
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-charcoal">{t(title)}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-paper hover:text-charcoal"
            aria-label={t('Close')}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
