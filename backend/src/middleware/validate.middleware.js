import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// Runs immediately after an express-validator rule chain (see each module's
// *.validation.js). If any rule failed, responds 400 in the exact
// {success:false, message, errors:[{field,message}]} shape from
// api-contract-v1.0.md and never calls the controller — input-shape validation
// happens here, before business-rule validation in the service layer.
export default function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  const error = new AppError('Validation failed', 400);
  error.errors = errors;
  next(error);
}
