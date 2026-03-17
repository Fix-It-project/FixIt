import express, { type Router } from 'express';
import multer from 'multer';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';
import { techniciansRepository } from './technicians.repository.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { storageRepository } from '../../shared/storage/storage.repository.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';

const upload = multer({ storage: multer.memoryStorage() });

const service = new TechniciansService(techniciansRepository, categoriesRepository, storageRepository);
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

// Mounted at /api/technicians — self-management routes (requires technician auth)
export const technicianSelfRoutes: Router = express.Router();

// GET /api/technicians/me
technicianSelfRoutes.get('/me', requireTechnicianAuth, (req, res) => controller.getSelf(req, res));

// PUT /api/technicians/me
technicianSelfRoutes.put('/me', requireTechnicianAuth, (req, res) => controller.updateSelf(req, res));

// POST /api/technicians/me/profile-image
technicianSelfRoutes.post('/me/profile-image', requireTechnicianAuth, upload.single('profile_image'), (req, res) => controller.uploadProfileImage(req, res));
