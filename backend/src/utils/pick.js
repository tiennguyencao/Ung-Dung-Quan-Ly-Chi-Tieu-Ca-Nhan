// express-validator checks the fields it knows about; it does NOT remove the
// ones it doesn't. So a request body that passes validation can still carry
// extra keys, and handing that straight to Object.assign(doc, body) or
// findByIdAndUpdate lets a client write any schema path — including userId,
// which would move a record into someone else's account.
//
// Every update path narrows the body through this first. The allowed lists
// mirror the "Validation" section of api-contract-v1.0.md for that endpoint.
export function pick(source, allowedFields) {
  const result = {};
  if (!source || typeof source !== 'object') return result;
  for (const field of allowedFields) {
    if (source[field] !== undefined) result[field] = source[field];
  }
  return result;
}
