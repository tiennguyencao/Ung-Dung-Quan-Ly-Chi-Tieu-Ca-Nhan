import mongoose from 'mongoose';
import Transaction from '../transactions/transaction.model.js';
import Category from '../categories/category.model.js';

const DATE_FORMAT_BY_GRANULARITY = {
  day: '%Y-%m-%d',
  week: '%G-W%V', // ISO week, e.g. 2026-W35
  month: '%Y-%m',
  year: '%Y',
};

function uid(userId) {
  return new mongoose.Types.ObjectId(userId);
}

// Statistics owns no collection (architecture-baseline §"Statistics") — every
// function here reads Transaction (and Category, for labels) and aggregates at
// query time. No pre-computed stats table in MVP; at this data scale, computing
// on read is simpler and avoids a whole class of "stale cache" bugs.

export async function getOverview(userId, { granularity = 'month', startDate, endDate }) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = endDate ? new Date(endDate) : new Date(Date.UTC(now.getUTCFullYear(), 11, 31));
  const format = DATE_FORMAT_BY_GRANULARITY[granularity] || DATE_FORMAT_BY_GRANULARITY.month;

  const rows = await Transaction.aggregate([
    { $match: { userId: uid(userId), date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { period: { $dateToString: { format, date: '$date' } }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const byPeriod = new Map();
  for (const row of rows) {
    const { period, type } = row._id;
    if (!byPeriod.has(period)) byPeriod.set(period, { period, income: 0, expense: 0 });
    byPeriod.get(period)[type] = row.total;
  }
  return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export async function getByCategory(userId, { startDate, endDate, type = 'expense' }) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = endDate ? new Date(endDate) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  const rows = await Transaction.aggregate([
    { $match: { userId: uid(userId), type, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ]);

  const categories = await Category.find({ _id: { $in: rows.map((r) => r._id) } });
  const nameById = new Map(categories.map((c) => [c._id.toString(), c.name]));
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0) || 1;

  return rows.map((r) => ({
    categoryId: r._id,
    categoryName: nameById.get(r._id.toString()) || 'Uncategorised',
    total: r.total,
    percentage: Math.round((r.total / grandTotal) * 100),
  }));
}

async function totalsForRange(userId, start, end) {
  const rows = await Transaction.aggregate([
    { $match: { userId: uid(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  const totals = { income: 0, expense: 0 };
  rows.forEach((r) => {
    totals[r._id] = r.total;
  });
  return totals;
}

function percentChange(from, to) {
  if (from === 0) return to === 0 ? 0 : 100;
  return Math.round(((to - from) / from) * 100);
}

export async function compare(userId, { period1Start, period1End, period2Start, period2End }) {
  const period1 = await totalsForRange(userId, new Date(period1Start), new Date(period1End));
  const period2 = await totalsForRange(userId, new Date(period2Start), new Date(period2End));
  return {
    period1,
    period2,
    delta: { income: period2.income - period1.income, expense: period2.expense - period1.expense },
    percentChange: {
      income: percentChange(period1.income, period2.income),
      expense: percentChange(period1.expense, period2.expense),
    },
  };
}
