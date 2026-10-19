import { Router } from 'express';
import * as budgetController from './budget.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  listBudgetsValidation,
  budgetIdValidation,
  createBudgetValidation,
  updateBudgetValidation,
} from './budget.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', listBudgetsValidation, validate, budgetController.list);
router.post('/', createBudgetValidation, validate, budgetController.create);
router.put('/:id', updateBudgetValidation, validate, budgetController.update);
router.delete('/:id', budgetIdValidation, validate, budgetController.remove);

export default router;
