import { Router, type Router as RouterType } from 'express';
import { authController } from './auth.controller.js';

const router: RouterType = Router();

// POST /api/auth/signup - Register a new user
router.post('/signup', (req, res) => authController.signUp(req, res));

// POST /api/auth/signin - Login user
router.post('/signin', (req, res) => authController.signIn(req, res));

// POST /api/auth/signout - Logout user
router.post('/signout', (req, res) => authController.signOut(req, res));

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => authController.getCurrentUser(req, res));

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', (req, res) => authController.requestPasswordReset(req, res));

// POST /api/auth/reset-password - Reset password with new password
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;
