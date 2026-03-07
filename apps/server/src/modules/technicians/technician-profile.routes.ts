import express, { type Router } from 'express';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';
import { techniciansRepository } from './technicians.repository.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';

// Mounted at /api/technicians
const router: Router = express.Router();

// Composition root — wire dependencies here so each layer depends only on abstractions
const service = new TechniciansService(techniciansRepository, categoriesRepository);
const controller = new TechniciansController(service);

// GET /api/technicians/:id/profile  (requires authenticated user)
router.get('/:id/profile', requireUserAuth, (req, res) => controller.getProfile(req, res));

export default router;
