import { Router } from 'express';
import * as usersController from './users.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { updateMeValidation } from './users.validation.js';

const router = Router();
router.use(authenticate); // every route below requires a valid JWT

router.get('/me', usersController.getMe);
router.put('/me', updateMeValidation, validate, usersController.updateMe);

export default router;
