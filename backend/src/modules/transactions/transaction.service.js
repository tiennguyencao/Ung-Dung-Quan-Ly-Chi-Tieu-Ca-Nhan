import Transaction from './transaction.model.js';
import Category from '../categories/category.model.js';
import AppError from '../../utils/AppError.js';
import { findOwnedOrFail } from '../../utils/ownership.js';
import { pick } from '../../utils/pick.js';
import { buildNoteSearchCondition } from './noteSearch.js';

// Exactly the fields api-contract-v1.0.md allows a client to set. userId is
// deliberately absent — it always comes from the verified JWT.
const WRITABLE_FIELDS = ['categoryId', 'type', 'amount', 'date', 'note'];

// Shared by create/update — a transaction's category must exist and be either
// a system default or owned by this same user (E6/E7).
async function assertCategoryAccessible(userId, categoryId) {
  const category = await Category.findById(categoryId);
  const accessible = category && (category.isDefault || category.userId?.toString() === userId.toString());
  if (!accessible) throw new AppError('Selected category could not be found.', 400);
}

export async function listTransactions(userId, filters = {}) {
  const query = { userId };
  if (filters.type) query.type = filters.type;
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  const noteSearchCondition = buildNoteSearchCondition(filters.q);
  if (noteSearchCondition) query.note = noteSearchCondition;
  return Transaction.find(query).sort({ date: -1, createdAt: -1 });
}

export async function getTransaction(userId, id) {
  return findOwnedOrFail(Transaction, id, userId, 'Transaction not found.');
}

export async function createTransaction(userId, data) {
  const payload = pick(data, WRITABLE_FIELDS);
  await assertCategoryAccessible(userId, payload.categoryId);
  return Transaction.create({ ...payload, userId });
}

export async function updateTransaction(userId, id, rawPatch) {
  const transaction = await findOwnedOrFail(Transaction, id, userId, 'Transaction not found.');
  const patch = pick(rawPatch, WRITABLE_FIELDS);
  if (patch.categoryId) await assertCategoryAccessible(userId, patch.categoryId);
  Object.assign(transaction, patch);
  await transaction.save();
  return transaction;
}

export async function deleteTransaction(userId, id) {
  const transaction = await findOwnedOrFail(Transaction, id, userId, 'Transaction not found.');
  await transaction.deleteOne();
  return { message: 'Transaction deleted.' };
}
