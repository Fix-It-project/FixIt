import express, { type Router } from 'express';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';
import { techniciansRepository } from './technicians.repository.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';

const service = new TechniciansService(techniciansRepository, categoriesRepository);
const controller = new TechniciansController(service);

// Mounted at /api/categories/:categoryId/technicians
export const techniciansRoutes: Router = express.Router({ mergeParams: true });

// GET /api/categories/:categoryId/technicians
techniciansRoutes.get('/', (req, res) => controller.getByCategoryId(req, res));

// GET /api/categories/:categoryId/technicians/search?q=<term>
techniciansRoutes.get('/search', (req, res) => controller.searchInCategory(req, res));

// Mounted at /api/technicians
export const technicianProfileRoutes: Router = express.Router();

// GET /api/technicians/:id/profile  (requires authenticated user)
technicianProfileRoutes.get('/:id/profile', requireUserAuth, (req, res) => controller.getProfile(req, res));
