import { body } from 'express-validator';

export const updateMeValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('email').optional().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body().custom((value) => {
    if (!value.name && !value.email) throw new Error('At least one field is required');
    return true;
  }),
];
