import { Router } from 'express';
import * as transactionController from './transaction.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  listTransactionsValidation,
  transactionIdValidation,
  createTransactionValidation,
  updateTransactionValidation,
} from './transaction.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', listTransactionsValidation, validate, transactionController.list);
router.get('/:id', transactionIdValidation, validate, transactionController.getOne);
router.post('/', createTransactionValidation, validate, transactionController.create);
router.put('/:id', updateTransactionValidation, validate, transactionController.update);
router.delete('/:id', transactionIdValidation, validate, transactionController.remove);

export default router;
