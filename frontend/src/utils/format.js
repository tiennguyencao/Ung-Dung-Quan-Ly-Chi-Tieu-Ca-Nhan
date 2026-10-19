export function formatVND(amount, language = 'vi') {
  const locale = language === 'en' ? 'en-US' : 'vi-VN';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

// A calendar day is a label, not an instant. Everything below therefore works
// on "YYYY-MM-DD" strings and LOCAL date parts, never on UTC instants:
//   - toISOString() would shift the day for anyone east/west of UTC (in Hanoi,
//     UTC+7, "today" before 07:00 local resolved to yesterday's date);
//   - new Date("2026-09-15") parses as UTC midnight, which renders as the
//     previous day for any negative-offset timezone.
// isoDateOf/parseIsoDate are the only two places that convert between the two
// representations, so the rest of the app can't reintroduce the drift.

// Public — the one correct way to turn a Date into a "YYYY-MM-DD" local
// calendar-day string. Reach for this instead of .toISOString().slice(0,10),
// which silently shifts the day for any non-UTC timezone (that was the actual
// bug behind the original Invalid Date / off-by-one-month issues).
export function isoDateOf(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Accepts either "YYYY-MM-DD" or a full ISO timestamp (what the API returns for
// a Mongoose Date) and builds a local-midnight Date from the calendar parts.
function parseIsoDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(value, language = 'en') {
  return parseIsoDate(value).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthLabel(yearMonth, language = 'en') {
  const [year, month] = String(yearMonth).slice(0, 7).split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function todayIso() {
  return isoDateOf(new Date());
}

export function yesterdayIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoDateOf(d);
}

// "Today" / "Yesterday" / "12 Sep 2026" — used to group the Transactions list
// under scannable date headers instead of one long undifferentiated list.
export function relativeDateLabel(value, language = 'en') {
  const date = String(value).slice(0, 10);
  if (date === todayIso()) return 'Today';
  if (date === yesterdayIso()) return 'Yesterday';
  return formatDate(value, language);
}

export function currentMonthKey() {
  return todayIso().slice(0, 7);
}

// Moves a "YYYY-MM" key by `delta` months — powers the Budgets page's
// prev/next stepper. Pure calendar arithmetic on the key's own parts, so it
// never touches the local/UTC boundary at all.
export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

// Start/end dates for the calendar month `monthsAgo` months before now
// (0 = current month, 1 = last month) — the shape /stats/compare expects.
// One implementation shared by Statistics and Dashboard, so "this month vs
// last month" always means the same range on both screens.
export function monthBounds(monthsAgo) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
  return { start: isoDateOf(start), end: isoDateOf(end) };
}
