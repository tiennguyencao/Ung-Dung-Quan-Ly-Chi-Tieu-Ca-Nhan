import { body, param, query } from 'express-validator';

const TYPES = ['income', 'expense'];
// Mirrors transaction.model.js's max exactly — keeps the 400 message and the
// eventual Mongoose ValidationError message in agreement.
const MAX_AMOUNT = 10_000_000_000;

export const listTransactionsValidation = [
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  query('categoryId').optional().isMongoId().withMessage('Invalid categoryId'),
  query('type').optional().isIn(TYPES).withMessage('type must be income or expense'),
  query('q').optional().isString(),
];

export const transactionIdValidation = [param('id').isMongoId().withMessage('Invalid transaction id')];

export const createTransactionValidation = [
  body('categoryId').isMongoId().withMessage('A valid category is required'),
  body('type').isIn(TYPES).withMessage('type must be income or expense'),
  body('amount')
    .isFloat({ gt: 0, lt: MAX_AMOUNT })
    .withMessage('Enter an amount greater than 0 and less than 10,000,000,000'),
  body('date').isISO8601().withMessage('date must be a valid date'),
  body('note').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('Note must be 500 characters or fewer'),
];

export const updateTransactionValidation = [
  param('id').isMongoId().withMessage('Invalid transaction id'),
  body('categoryId').optional().isMongoId().withMessage('A valid category is required'),
  body('type').optional().isIn(TYPES).withMessage('type must be income or expense'),
  body('amount')
    .optional()
    .isFloat({ gt: 0, lt: MAX_AMOUNT })
    .withMessage('Enter an amount greater than 0 and less than 10,000,000,000'),
  body('date').optional().isISO8601().withMessage('date must be a valid date'),
  body('note').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('Note must be 500 characters or fewer'),
  body().custom((value) => {
    if (!['categoryId', 'type', 'amount', 'date', 'note'].some((f) => value[f] !== undefined)) {
      throw new Error('At least one field is required');
    }
    return true;
  }),
];
