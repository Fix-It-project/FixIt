import { Router, type Router as RouterType } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  SignUpBodySchema,
  SignInBodySchema,
  RefreshTokenBodySchema,
  ForgotPasswordBodySchema,
  ResetPasswordBodySchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();

router.post('/signup', validate({ body: SignUpBodySchema }), (req, res) => authController.signUp(req, res));
router.post('/signin', validate({ body: SignInBodySchema }), (req, res) => authController.signIn(req, res));
router.post('/signout', (req, res) => authController.signOut(req, res));
router.get('/me', (req, res) => authController.getCurrentUser(req, res));
router.post('/refresh', validate({ body: RefreshTokenBodySchema }), (req, res) => authController.refreshToken(req, res));
router.post('/forgot-password', validate({ body: ForgotPasswordBodySchema }), (req, res) => authController.requestPasswordReset(req, res));
router.post('/reset-password', validate({ body: ResetPasswordBodySchema }), (req, res) => authController.resetPassword(req, res));

export default router;
