import useLanguage from '../../hooks/useLanguage.js';

// One of the Dashboard's 4 Panels, or any bordered card elsewhere — border over
// shadow for separating from the page, per the design system's "Structure" rule.
export default function Panel({ title, action, children, className = '' }) {
  const { t } = useLanguage();
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="font-serif text-base font-semibold text-charcoal">{t(title)}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
