import { body, param, query } from 'express-validator';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
// Mirrors budget.model.js's max exactly.
const MAX_AMOUNT = 10_000_000_000;

export const listBudgetsValidation = [
  query('month').optional().matches(MONTH_RE).withMessage('month must be in YYYY-MM format'),
];

export const budgetIdValidation = [param('id').isMongoId().withMessage('Invalid budget id')];

export const createBudgetValidation = [
  body('month').matches(MONTH_RE).withMessage('month must be in YYYY-MM format'),
  body('categoryId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid categoryId'),
  body('limitAmount')
    .isFloat({ gt: 0, lt: MAX_AMOUNT })
    .withMessage('Enter a limit amount greater than 0 and less than 10,000,000,000'),
];

export const updateBudgetValidation = [
  param('id').isMongoId().withMessage('Invalid budget id'),
  body('limitAmount')
    .isFloat({ gt: 0, lt: MAX_AMOUNT })
    .withMessage('Enter a limit amount greater than 0 and less than 10,000,000,000'),
];
