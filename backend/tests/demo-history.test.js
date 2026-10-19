import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoTransactions, monthsInDemoRange } from '../src/modules/demo/demoHistory.js';

const sampleToday = new Date(2026, 9, 19, 12, 0, 0);

test('demo history spans the previous year through today and does not include future dates', () => {
  const entries = generateDemoTransactions(sampleToday);
  assert.ok(entries.length >= 110, `expected a rich dataset, got ${entries.length}`);
  assert.ok(entries.every((entry) => entry.dateKey >= '2025-10-19' && entry.dateKey <= '2026-10-19'));
  assert.equal(entries[0].dateKey, '2025-10-19');
  assert.ok(entries.some((entry) => entry.dateKey === '2026-10-19'));
});

test('demo history includes income and all four expense categories', () => {
  const entries = generateDemoTransactions(sampleToday);
  const incomes = entries.filter((entry) => entry.type === 'income');
  const expenses = entries.filter((entry) => entry.type === 'expense');
  assert.ok(incomes.length >= 12);
  assert.ok(expenses.length >= 90);
  assert.ok(incomes.every((entry) => ['Lương', 'Thưởng'].includes(entry.categoryName)));
  assert.ok(expenses.every((entry) => ['Ăn uống', 'Di chuyển', 'Hóa đơn', 'Giải trí'].includes(entry.categoryName)));
  assert.ok(entries.every((entry) => Number.isFinite(entry.amount) && entry.amount > 0));
});

test('demo history and budget month list are deterministic for a given day', () => {
  assert.deepEqual(generateDemoTransactions(sampleToday), generateDemoTransactions(sampleToday));
  assert.deepEqual(monthsInDemoRange(sampleToday), [
    '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
  ]);
});

test('demo history uses positive amounts for both income and expenses; type carries the direction', () => {
  const entries = generateDemoTransactions(sampleToday);
  assert.ok(entries.some((entry) => entry.type === 'income' && entry.categoryName === 'Lương'));
  assert.ok(entries.some((entry) => entry.type === 'income' && entry.categoryName === 'Thưởng'));
  assert.ok(entries.some((entry) => entry.type === 'expense' && entry.categoryName === 'Ăn uống'));
  assert.ok(entries.every((entry) => !String(entry.note).includes('[DEMO]')));
});
