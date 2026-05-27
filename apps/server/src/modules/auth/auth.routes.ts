import { Router, type Router as RouterType } from 'express';
import { authController } from './auth.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  SignUpBodySchema,
  SignInBodySchema,
  RefreshTokenBodySchema,
  ForgotPasswordBodySchema,
  ResetPasswordBodySchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();

router.post('/signup', validate({ body: SignUpBodySchema }), authController.signUp);
router.post('/signin', validate({ body: SignInBodySchema }), authController.signIn);
router.post('/signout', requireUserAuth, authController.signOut);
router.get('/me', requireUserAuth, authController.getCurrentUser);
router.post('/refresh', validate({ body: RefreshTokenBodySchema }), authController.refreshToken);
router.post('/forgot-password', validate({ body: ForgotPasswordBodySchema }), authController.requestPasswordReset);
router.post('/reset-password', validate({ body: ResetPasswordBodySchema }), authController.resetPassword);

export default router;
