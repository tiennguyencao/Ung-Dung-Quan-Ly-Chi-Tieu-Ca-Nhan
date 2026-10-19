import AppError from '../utils/AppError.js';

// The one place every error in the app ends up (architecture-baseline §8) — no
// try/catch needed in controllers, since Express 5 forwards rejected promises
// here automatically.
export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Mongoose duplicate key (e.g. a unique index collision not already caught
  // by a service-level check) -> 409, matching the API contract's conflict cases.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'This record already exists.',
      errors: [],
    });
  }

  // Mongoose schema validation error -> 400 with per-field messages.
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Malformed ObjectId in a route param -> 400, not a 500.
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}.`, errors: [] });
  }

  const isKnown = err instanceof AppError;
  const statusCode = isKnown ? err.statusCode : 500;
  const message = isKnown ? err.message : 'Something went wrong. Please try again.';

  if (!isKnown) {
    // Unexpected error — log the real detail server-side, never leak it to the client.
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
}
