import { Router, type Router as RouterType } from 'express';
import { usersController } from './users.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';

const router: RouterType = Router();

// GET /api/users/profile — get current user profile with addresses
router.get('/profile', requireUserAuth, (req, res) => usersController.getProfile(req, res));

// PUT /api/users/profile — update profile fields (full_name, email, phone)
router.put('/profile', requireUserAuth, (req, res) => usersController.updateProfile(req, res));

export default router;
