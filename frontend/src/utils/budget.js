// Presentation mapping ONLY. The 80%/100% threshold that decides under/near/
// over (BR-06) is computed exactly once, server-side, in budget.service.js —
// every budget object from the API already carries that decision as
// `status`. This function's only job is turning that already-decided string
// into a label + Tailwind classes; it must never re-derive the threshold
// itself, or the frontend and backend could disagree after a future rule
// change made in only one place.
export function getBudgetStatus(status) {
  if (status === 'over') {
    return { key: 'over', label: 'Over budget', textClass: 'text-expense', barClass: 'bg-expense' };
  }
  if (status === 'near') {
    return { key: 'near', label: 'Near limit', textClass: 'text-warn-dark', barClass: 'bg-warn' };
  }
  return { key: 'under', label: 'On track', textClass: 'text-income', barClass: 'bg-income' };
}
