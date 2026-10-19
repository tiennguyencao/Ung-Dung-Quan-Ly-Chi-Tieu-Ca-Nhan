import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatDate,
  formatMonthLabel,
  todayIso,
  yesterdayIso,
  relativeDateLabel,
  currentMonthKey,
  shiftMonthKey,
  monthBounds,
  isoDateOf,
} from '../src/utils/format.js';
import { validateAmount } from '../src/utils/validators.js';
import { getBudgetStatus } from '../src/utils/budget.js';

// These cover the two things that actually broke in this codebase: dates
// crossing the local/UTC boundary, and money losing exactness. The suite is
// run under several timezones (see package.json "test") because both bugs
// were invisible in UTC and only appeared at a non-zero offset.

const localIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test('formatDate accepts the full ISO timestamp the API actually returns', () => {
  // Regression: the API serialises Mongoose Dates as "2026-09-15T00:00:00.000Z".
  // The old implementation appended "T00:00:00" to that and produced "Invalid Date".
  const result = formatDate('2026-09-15T00:00:00.000Z');
  assert.doesNotMatch(result, /Invalid/);
  assert.match(result, /2026/);
  assert.match(result, /15/);
});

test('formatDate accepts a plain calendar date', () => {
  const result = formatDate('2026-09-15');
  assert.doesNotMatch(result, /Invalid/);
  assert.match(result, /15/);
});

test('formatDate does not shift the calendar day across timezones', () => {
  // Parsing "2026-01-01" as UTC midnight renders as 31 Dec in any negative offset.
  assert.match(formatDate('2026-01-01'), /1 Jan 2026/);
  assert.match(formatDate('2026-12-31'), /31 Dec 2026/);
});

test('formatMonthLabel does not shift the month across timezones', () => {
  assert.match(formatMonthLabel('2026-01'), /January 2026/);
  assert.match(formatMonthLabel('2026-12'), /December 2026/);
});

test('todayIso reflects the local calendar date, not the UTC date', () => {
  // Regression: toISOString() returned the previous day for UTC+7 users
  // between midnight and 07:00 local.
  assert.equal(todayIso(), localIso(new Date()));
});

test('yesterdayIso is exactly one calendar day before todayIso', () => {
  const expected = new Date();
  expected.setDate(expected.getDate() - 1);
  assert.equal(yesterdayIso(), localIso(expected));
});

test('relativeDateLabel recognises today and yesterday from full ISO values', () => {
  assert.equal(relativeDateLabel(`${todayIso()}T00:00:00.000Z`), 'Today');
  assert.equal(relativeDateLabel(`${yesterdayIso()}T00:00:00.000Z`), 'Yesterday');
});

test('currentMonthKey reflects the local month', () => {
  assert.equal(currentMonthKey(), localIso(new Date()).slice(0, 7));
});

test('monthBounds starts on the 1st and ends on the last day of the local month', () => {
  // Regression: building the range locally then calling toISOString() pushed
  // the start back a day for every positive-offset timezone, so "this month"
  // silently included the last day of the previous month.
  const { start, end } = monthBounds(0);
  const now = new Date();
  const expectedStart = localIso(new Date(now.getFullYear(), now.getMonth(), 1));
  const expectedEnd = localIso(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  assert.equal(start, expectedStart);
  assert.equal(end, expectedEnd);
  assert.match(start, /-01$/);
});

test('monthBounds(1) is the previous calendar month and does not overlap this one', () => {
  const previous = monthBounds(1);
  const current = monthBounds(0);
  assert.ok(previous.end < current.start, `${previous.end} should precede ${current.start}`);
  assert.equal(previous.start.slice(8), '01');
});

test('isoDateOf converts using local calendar parts, not a UTC-shifted instant', () => {
  // Regression: StatisticsPage's own date-range helper used
  // toISOString().slice(0,10) — the same bug already fixed in monthBounds —
  // and was missed in that pass because it lived outside format.js.
  // A local midnight Date must round-trip to the same day in every timezone.
  const localMidnight = new Date(2026, 0, 1); // 1 Jan 2026, local time
  assert.equal(isoDateOf(localMidnight), '2026-01-01');
});

test('isoDateOf agrees with todayIso for "now"', () => {
  assert.equal(isoDateOf(new Date()), todayIso());
});

test('shiftMonthKey crosses year boundaries in both directions', () => {
  assert.equal(shiftMonthKey('2026-01', -1), '2025-12');
  assert.equal(shiftMonthKey('2026-12', 1), '2027-01');
  assert.equal(shiftMonthKey('2026-06', 0), '2026-06');
});

test('validateAmount rejects fractional VND', () => {
  assert.notEqual(validateAmount('1000.5'), '');
  assert.notEqual(validateAmount(0.1), '');
});

test('validateAmount accepts whole VND and rejects zero or negative', () => {
  assert.equal(validateAmount('50000'), '');
  assert.equal(validateAmount(1), '');
  assert.notEqual(validateAmount('0'), '');
  assert.notEqual(validateAmount('-100'), '');
  assert.notEqual(validateAmount(''), '');
});

test('validateAmount rejects amounts at or above the 10 billion VND ceiling', () => {
  // Regression: amount had no upper bound at all — a data-entry typo (an
  // extra zero or two) had nothing catching it before this.
  assert.notEqual(validateAmount('10000000000'), '');
  assert.notEqual(validateAmount('99999999999'), '');
  assert.equal(validateAmount('9999999999'), '');
});

test('getBudgetStatus maps the server status string and never re-derives it', () => {
  // The 80/100 threshold lives only in budget.service.js. This helper must
  // translate, not decide — passing a percentage instead of a status would
  // silently fall through to "under".
  assert.equal(getBudgetStatus('over').key, 'over');
  assert.equal(getBudgetStatus('near').key, 'near');
  assert.equal(getBudgetStatus('under').key, 'under');
  assert.equal(getBudgetStatus(undefined).key, 'under');
});
