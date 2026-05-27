import { Router, type Router as RouterType } from 'express';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { UpdateUserProfileBodySchema } from '../../shared/dtos/index.js';
import { usersController } from './users.controller.js';

const router: RouterType = Router();

router.get('/profile', requireUserAuth, usersController.getProfile);
router.put('/profile', requireUserAuth, validate({ body: UpdateUserProfileBodySchema }), usersController.updateProfile);

export default router;
