import { body, param } from 'express-validator';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }).withMessage('Category name must be 50 characters or fewer'),
  body('icon').optional({ values: 'falsy' }).isString(),
  body('color').optional({ values: 'falsy' }).matches(HEX_COLOR).withMessage('Color must be a hex code like #RRGGBB'),
];

export const updateCategoryValidation = [
  param('id').isMongoId().withMessage('Invalid category id'),
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty').isLength({ max: 50 }).withMessage('Category name must be 50 characters or fewer'),
  body('icon').optional({ values: 'falsy' }).isString(),
  body('color').optional({ values: 'falsy' }).matches(HEX_COLOR).withMessage('Color must be a hex code like #RRGGBB'),
  body().custom((value) => {
    if (value.name === undefined && value.icon === undefined && value.color === undefined) {
      throw new Error('At least one field is required');
    }
    return true;
  }),
];

export const categoryIdValidation = [param('id').isMongoId().withMessage('Invalid category id')];
