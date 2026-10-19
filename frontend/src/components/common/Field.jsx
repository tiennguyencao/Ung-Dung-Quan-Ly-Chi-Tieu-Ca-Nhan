import { cloneElement, isValidElement, useId } from 'react';
import useLanguage from '../../hooks/useLanguage.js';

// Label + control + error message, shared by Input/Textarea/Select so every
// form field looks and behaves identically (label, spacing, error styling).
// Also wires aria-invalid/aria-describedby onto the control automatically —
// only for a single-element child (Input/Textarea/Select), since a composite
// child (e.g. the Date row's flex of buttons + input) has no one element to
// describe; those fields still show the message, just without the
// programmatic linkage.
export default function Field({ label, htmlFor, error, hint, required, children }) {
  const { t } = useLanguage();
  const messageId = useId();
  const message = error || hint;
  const describedBy = message ? messageId : undefined;

  const control =
    isValidElement(children) && typeof children.type !== 'string'
      ? cloneElement(children, {
          id: children.props.id || htmlFor,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })
      : children;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
          {t(label)}
          {required && <span className="text-expense"> *</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={messageId} className="text-xs text-expense">
          {t(error)}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted">
          {t(hint)}
        </p>
      ) : null}
    </div>
  );
}
