import { Router, type Router as RouterType } from 'express';
import { usersController } from './users.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { UpdateUserProfileBodySchema } from '../../shared/dtos/index.js';

const router: RouterType = Router();

router.get('/profile', requireUserAuth, (req, res) => usersController.getProfile(req, res));
router.put('/profile', requireUserAuth, validate({ body: UpdateUserProfileBodySchema }), (req, res) => usersController.updateProfile(req, res));

export default router;
