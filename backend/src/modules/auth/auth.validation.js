import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'), // BR-07
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords don't match");
    return true;
  }),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Enter a valid email address'),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords don't match");
    return true;
  }),
];
