import Category from './category.model.js';
import Transaction from '../transactions/transaction.model.js';
import AppError from '../../utils/AppError.js';
import { pick } from '../../utils/pick.js';

// userId and isDefault are NOT writable: setting userId would hand the
// category to another account, and userId:null would publish it to everyone.
const WRITABLE_FIELDS = ['name', 'icon', 'color'];

// Category needs its own ownership check rather than utils/ownership.js's
// findOwnedOrFail — default categories have userId: null, which that helper's
// strict `doc.userId.toString() !== userId` comparison can't express.
async function findAccessibleOrFail(id, userId) {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found.', 404);
  const isOwner = category.userId && category.userId.toString() === userId.toString();
  if (!category.isDefault && !isOwner) {
    throw new AppError('You do not have access to this category.', 403);
  }
  return category;
}

async function assertNameAvailable(userId, name, excludeId = null) {
  // Case-insensitive on purpose (BR-03/E9) — "Ăn uống" and "ăn uống" being two
  // different rows for the same user would be a data-quality bug, not a feature,
  // even though the DB's unique index alone is case-sensitive (defense in depth
  // below, not the primary check).
  const query = {
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    $or: [{ userId }, { userId: null }],
  };
  if (excludeId) query._id = { $ne: excludeId };
  const clash = await Category.findOne(query);
  if (clash) throw new AppError(`A category named "${name}" already exists.`, 409);
}

export async function listCategories(userId) {
  return Category.find({ $or: [{ userId }, { userId: null }] }).sort({ isDefault: -1, name: 1 });
}

export async function createCategory(userId, { name, icon, color }) {
  await assertNameAvailable(userId, name);
  return Category.create({ userId, isDefault: false, name, icon: icon || null, color: color || undefined });
}

export async function updateCategory(userId, id, rawPatch) {
  const category = await findAccessibleOrFail(id, userId);
  const patch = pick(rawPatch, WRITABLE_FIELDS);
  if (category.isDefault) throw new AppError("Default categories can't be edited.", 403);
  if (!category.userId || category.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have access to this category.', 403);
  }
  if (patch.name && patch.name !== category.name) {
    await assertNameAvailable(userId, patch.name, id);
  }
  Object.assign(category, patch);
  await category.save();
  return category;
}

export async function deleteCategory(userId, id) {
  const category = await findAccessibleOrFail(id, userId);
  if (category.isDefault) throw new AppError("Default categories can't be deleted.", 403);
  if (!category.userId || category.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have access to this category.', 403);
  }
  const inUse = await Transaction.countDocuments({ categoryId: id, userId });
  if (inUse > 0) {
    throw new AppError(
      `Can't delete "${category.name}" — ${inUse} transaction${inUse > 1 ? 's' : ''} still use it. Reassign or delete them first.`,
      409
    );
  }
  await category.deleteOne();
  return { message: 'Category deleted.' };
}
