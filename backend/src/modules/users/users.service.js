import User from '../auth/user.model.js';
import AppError from '../../utils/AppError.js';
import { pick } from '../../utils/pick.js';

// Password changes go through /auth, never this endpoint — passwordHash and
// the reset-token fields must not be settable here.
const WRITABLE_FIELDS = ['name', 'email'];

// Reuses auth's User model rather than duplicating it — Users depends on Auth,
// one direction only, matching the component architecture's dependency graph.

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  return user;
}

export async function updateUser(userId, rawPatch) {
  const patch = pick(rawPatch, WRITABLE_FIELDS);
  if (patch.email) {
    const existing = await User.findOne({ email: patch.email, _id: { $ne: userId } });
    if (existing) throw new AppError('This email is already in use.', 409);
  }
  const user = await User.findByIdAndUpdate(userId, patch, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404);
  return user;
}
