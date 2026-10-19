import useLanguage from '../../hooks/useLanguage.js';

export default function EmptyState({ icon: Icon, title, description, action }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-muted">
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="font-medium text-charcoal">{t(title)}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-muted">{t(description)}</p>}
      </div>
      {action}
    </div>
  );
}
