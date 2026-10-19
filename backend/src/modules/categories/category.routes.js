import { Router } from 'express';
import * as categoryController from './category.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createCategoryValidation, updateCategoryValidation, categoryIdValidation } from './category.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', createCategoryValidation, validate, categoryController.create);
router.put('/:id', updateCategoryValidation, validate, categoryController.update);
router.delete('/:id', categoryIdValidation, validate, categoryController.remove);

export default router;
