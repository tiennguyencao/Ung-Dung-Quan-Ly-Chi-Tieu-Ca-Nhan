export default function Input({ error, className = '', ...rest }) {
  return (
    <input
      className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-charcoal placeholder:text-muted ${
        error ? 'border-expense' : 'border-border'
      } ${className}`}
      {...rest}
    />
  );
}
