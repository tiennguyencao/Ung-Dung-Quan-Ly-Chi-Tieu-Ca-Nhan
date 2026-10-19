import { Router } from 'express';
import { query } from 'express-validator';
import * as statsController from './stats.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';

const router = Router();
router.use(authenticate);

const GRANULARITIES = ['day', 'week', 'month', 'year'];
const TYPES = ['income', 'expense'];

router.get(
  '/overview',
  [
    query('granularity').optional().isIn(GRANULARITIES).withMessage('granularity must be day, week, month, or year'),
    query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  ],
  validate,
  statsController.overview
);

router.get(
  '/by-category',
  [
    query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
    query('type').optional().isIn(TYPES).withMessage('type must be income or expense'),
  ],
  validate,
  statsController.byCategory
);

router.get(
  '/compare',
  [
    query('period1Start').isISO8601().withMessage('period1Start must be a valid date'),
    query('period1End').isISO8601().withMessage('period1End must be a valid date'),
    query('period2Start').isISO8601().withMessage('period2Start must be a valid date'),
    query('period2End').isISO8601().withMessage('period2End must be a valid date'),
  ],
  validate,
  statsController.compare
);

export default router;
