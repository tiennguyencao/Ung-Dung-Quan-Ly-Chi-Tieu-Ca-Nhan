export default function Textarea({ error, className = '', rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={`w-full resize-none rounded-lg border bg-surface px-3 py-2.5 text-sm text-charcoal placeholder:text-muted ${
        error ? 'border-expense' : 'border-border'
      } ${className}`}
      {...rest}
    />
  );
}
