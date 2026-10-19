// Every rule here matches api-contract-v1.0.md's per-endpoint "Validation" section
// exactly, so client-side and (future) server-side rejections never disagree.

export const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value || '');

export function validateEmail(value) {
  if (!value) return 'Email is required';
  return isValidEmail(value) ? '' : 'Enter a valid email address';
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  return value.length >= 8 ? '' : 'Password must be at least 8 characters'; // BR-07
}

export function validateConfirmPassword(value, password) {
  return value === password ? '' : "Passwords don't match";
}

export function validateRequired(value, label = 'This field') {
  return value && String(value).trim() ? '' : `${label} is required`;
}

// Mirrors the backend's max exactly (transaction.model.js / budget.model.js) —
// generous ceiling for any real personal transaction, tight enough to catch
// an extra-zero typo before it silently skews a chart or a budget total.
const MAX_AMOUNT = 10_000_000_000;

export function validateAmount(value) {
  if (value === '' || value === null || value === undefined) return 'Amount is required';
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) return 'Enter an amount greater than 0';
  // VND has no subunit. Allowing fractions means the stored value and the
  // rounded value shown by formatVND drift apart, so a list of rows stops
  // adding up to its own total.
  if (!Number.isInteger(n)) return 'Enter a whole number of VND (no decimals)';
  if (n >= MAX_AMOUNT) return 'Enter an amount less than 10,000,000,000';
  return '';
}

export function validateNote(value) {
  if (value && value.length > 500) return 'Note must be 500 characters or fewer';
  return '';
}

export function validateMonth(value) {
  if (!value) return 'Month is required';
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? '' : 'Use the YYYY-MM format';
}

// Runs a { field: validatorFn(value) } map and returns only the non-empty results.
export function runValidators(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, validator]) => {
    const message = validator(values[field], values);
    if (message) errors[field] = message;
  });
  return errors;
}
