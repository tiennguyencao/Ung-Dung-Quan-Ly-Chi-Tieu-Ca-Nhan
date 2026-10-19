import { ChevronDown } from 'lucide-react';

export default function Select({ error, className = '', children, ...rest }) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none rounded-lg border bg-surface px-3 py-2.5 pr-9 text-sm text-charcoal ${
          error ? 'border-expense' : 'border-border'
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}
