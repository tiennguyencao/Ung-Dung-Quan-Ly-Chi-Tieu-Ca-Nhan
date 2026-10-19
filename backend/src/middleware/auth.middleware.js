import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../modules/auth/user.model.js';

// Applied to every route except the four under /auth. Verifies the JWT,
// checks it against the user's current tokenVersion (invalidated by a
// password reset — see auth.service.js), and attaches req.user.id — every
// downstream service scopes its query by this, never by anything the client
// sends (BR-01, the Data Isolation Guarantee).
//
// This is the one DB read on an otherwise-stateless auth check, traded
// deliberately for the ability to invalidate a token before its natural
// 7-day expiry. A single indexed findById is a small, known cost against a
// real security gap — a stolen token surviving a password reset.
export default async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('tokenVersion');
    // Same generic message as a bad signature — no need to distinguish "this
    // account no longer exists" from "this session was revoked" to the client.
    if (!user || (payload.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return next(new AppError('Invalid or expired token', 401));
    }
    req.user = { id: payload.userId };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
