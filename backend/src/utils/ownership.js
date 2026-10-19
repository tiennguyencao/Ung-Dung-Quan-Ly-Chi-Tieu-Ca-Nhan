import AppError from './AppError.js';

// Implements E-AUTH-2 from the use-case model in one place: 404 if the record
// doesn't exist at all, 403 if it exists but belongs to someone else — used by
// every service whose records always belong to exactly one user (Transaction,
// Budget). Category has its own check in category.service.js instead, because
// default categories have userId: null and need different handling.
export async function findOwnedOrFail(Model, id, userId, notFoundMessage = 'Resource not found.') {
  const doc = await Model.findById(id);
  if (!doc) throw new AppError(notFoundMessage, 404);
  if (doc.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have access to this resource.', 403);
  }
  return doc;
}
