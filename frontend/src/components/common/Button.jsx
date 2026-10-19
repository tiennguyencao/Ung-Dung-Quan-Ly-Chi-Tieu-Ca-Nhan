import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-ink-light disabled:bg-ink/50',
  secondary: 'bg-surface text-charcoal border border-border hover:bg-paper disabled:opacity-50',
  danger: 'bg-expense text-white hover:brightness-110 disabled:bg-expense/50',
  ghost: 'text-charcoal hover:bg-paper disabled:opacity-50',
};

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
