import mongoose from 'mongoose';
import Budget from './budget.model.js';
import Category from '../categories/category.model.js';
import Transaction from '../transactions/transaction.model.js';
import AppError from '../../utils/AppError.js';
import { findOwnedOrFail } from '../../utils/ownership.js';

// BR-06, mirrored exactly from the frontend's utils/budget.js so the two never disagree.
function statusFor(percentageUsed) {
  if (percentageUsed >= 100) return 'over';
  if (percentageUsed >= 80) return 'near';
  return 'under';
}

function monthRange(month) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

async function spendForMonth(userId, month) {
  const { start, end } = monthRange(month);
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
  ]);
  return {
    byCategory: new Map(rows.map((r) => [r._id?.toString(), r.total])),
    // An overall budget covers every expense that month, which is exactly the
    // sum of the per-category buckets — no second query needed.
    overall: rows.reduce((sum, r) => sum + r.total, 0),
  };
}

async function assertCategoryAccessible(userId, categoryId) {
  const category = await Category.findById(categoryId);
  const accessible = category && (category.isDefault || category.userId?.toString() === userId.toString());
  if (!accessible) throw new AppError('Selected category could not be found.', 400);
}

// GET /budgets is one enriched endpoint for both the management list and the
// Dashboard status widget (api-contract-v1.0.md) — spentAmount/percentageUsed/
// status are computed here, on read, never stored (avoids a whole class of
// "stale after a transaction changed" bugs).
//
// Query cost is one aggregate per DISTINCT MONTH plus one batched category
// lookup, not two queries per budget row: the previous shape was an N+1 that
// grew with how many budgets a user had set.
export async function listBudgets(userId, month) {
  const query = { userId };
  if (month) query.month = month;
  const budgets = await Budget.find(query).sort({ month: -1, createdAt: 1 });
  if (budgets.length === 0) return [];

  const months = [...new Set(budgets.map((b) => b.month))];
  const spendByMonth = new Map(
    await Promise.all(months.map(async (m) => [m, await spendForMonth(userId, m)]))
  );

  const categoryIds = budgets.map((b) => b.categoryId).filter(Boolean);
  const categories = categoryIds.length ? await Category.find({ _id: { $in: categoryIds } }) : [];
  const nameById = new Map(categories.map((c) => [c._id.toString(), c.name]));

  return budgets.map((budget) => {
    const spend = spendByMonth.get(budget.month);
    const spentAmount = budget.categoryId
      ? spend.byCategory.get(budget.categoryId.toString()) || 0
      : spend.overall;
    const percentageUsed = budget.limitAmount > 0 ? Math.round((spentAmount / budget.limitAmount) * 100) : 0;
    return {
      id: budget.id,
      month: budget.month,
      categoryId: budget.categoryId,
      categoryName: budget.categoryId ? nameById.get(budget.categoryId.toString()) || 'Unknown category' : 'Overall',
      limitAmount: budget.limitAmount,
      spentAmount,
      percentageUsed,
      status: statusFor(percentageUsed),
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  });
}

export async function createBudget(userId, { month, categoryId, limitAmount }) {
  const catId = categoryId || null;
  if (catId) await assertCategoryAccessible(userId, catId);
  const clash = await Budget.findOne({ userId, month, categoryId: catId });
  if (clash) throw new AppError('A budget for this month and category already exists.', 409); // BR-05/E12
  return Budget.create({ userId, month, categoryId: catId, limitAmount });
}

export async function updateBudget(userId, id, { limitAmount }) {
  // Only limitAmount is editable — month/categoryId form the budget's identity
  // (BR-05); changing either means delete-and-recreate, per the API contract.
  const budget = await findOwnedOrFail(Budget, id, userId, 'Budget not found.');
  budget.limitAmount = limitAmount;
  await budget.save();
  return budget;
}

export async function deleteBudget(userId, id) {
  const budget = await findOwnedOrFail(Budget, id, userId, 'Budget not found.');
  await budget.deleteOne();
  return { message: 'Budget deleted.' };
}
