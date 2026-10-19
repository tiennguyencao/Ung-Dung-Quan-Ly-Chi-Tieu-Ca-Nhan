import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatVND, formatMonthLabel } from '../src/utils/format.js';

test('date formatting follows the selected language without timezone day drift', () => {
  const english = formatDate('2026-10-11', 'en');
  const vietnamese = formatDate('2026-10-11', 'vi');
  assert.match(english, /11/);
  assert.match(vietnamese, /11/);
  assert.match(english, /2026/);
  assert.match(vietnamese, /2026/);
  assert.notEqual(english, vietnamese);
});

test('VND amounts use a locale-aware representation and keep the currency', () => {
  assert.match(formatVND(1234567, 'en'), /₫|VND/);
  assert.match(formatVND(1234567, 'vi'), /₫|VND/);
});

test('month labels use the selected locale', () => {
  assert.match(formatMonthLabel('2026-10', 'en'), /October/);
  assert.match(formatMonthLabel('2026-10', 'vi'), /tháng 10/i);
});
