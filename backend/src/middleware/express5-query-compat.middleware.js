/**
 * Compatibility bridge for express-mongo-sanitize@2.2.0 with Express 5.
 *
 * Express 5 exposes req.query as a getter rather than a writable property.
 * express-mongo-sanitize@2.2.0 sanitizes query input by assigning a sanitized
 * object back to req.query, which otherwise throws in strict-mode ESM.
 * Shadow the prototype getter with a request-local writable data property so
 * the sanitizer can replace it before any route handler reads it.
 *
 * This middleware must be registered immediately before mongoSanitize().
 */
export default function express5QueryCompatibility(req, res, next) {
  Object.defineProperty(req, 'query', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: req.query,
  });
  next();
}
