import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './user.model.js';
import AppError from '../../utils/AppError.js';
import { sendPasswordResetEmail } from '../../utils/mailer.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d'; // BR-08
const RESET_TOKEN_TTL_MS = 45 * 60 * 1000; // 45 min, inside BR-09's 30-60 min range

export async function registerUser({ email, password, name }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('This email is already registered.', 409);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ email, passwordHash, name });
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');
  // Same generic message whether the email or the password was wrong — NFR-02,
  // doesn't reveal which field was incorrect.
  if (!user) throw new AppError('Invalid email or password.', 401);
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);
  const token = jwt.sign({ userId: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
  return { token, user };
}

export async function requestPasswordReset({ email }) {
  const user = await User.findOne({ email });
  // Resolves identically whether or not the account exists — BR-10, prevents
  // account enumeration via this endpoint.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Only the HASH of the token is stored — if the database were ever read by
    // an attacker, a stored raw token would let them reset any password directly.
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();
    const resetUrl = `${process.env.CLIENT_ORIGIN?.split(',')[0]}/reset-password?token=${rawToken}`;
    // Awaited so a real SMTP failure surfaces in server logs during this
    // request's lifetime, but mailer.js never throws — this response's
    // message is identical either way, by design (see above).
    await sendPasswordResetEmail({ to: email, resetUrl });
  }
  return { message: 'If that email is registered, a reset link has been sent.' };
}

export async function resetPassword({ token, newPassword }) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +tokenVersion');
  if (!user) throw new AppError('Reset token is invalid or has expired.', 401);
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  // Invalidates every token issued before this moment — the point of a
  // password reset is that a stolen-but-not-yet-expired token stops working.
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  return { message: 'Password updated. Please log in.' };
}
