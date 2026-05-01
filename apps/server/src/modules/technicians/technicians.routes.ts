import express, { type Router } from 'express';
import multer from 'multer';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';
import { techniciansRepository } from './technicians.repository.js';
import { categoriesRepository } from '../categories/categories.repository.js';
import { storageRepository } from '../../shared/storage/storage.repository.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { UpdateTechnicianSelfBodySchema, TechnicianIdParamsSchema } from '../../shared/dtos/index.js';

const upload = multer({ storage: multer.memoryStorage() });

const service = new TechniciansService(techniciansRepository, categoriesRepository, storageRepository);
const controller = new TechniciansController(service);

export const techniciansRoutes: Router = express.Router({ mergeParams: true });

techniciansRoutes.get('/', (req, res) => controller.getByCategoryId(req, res));
techniciansRoutes.get('/search', (req, res) => controller.searchInCategory(req, res));

export const technicianProfileRoutes: Router = express.Router();

technicianProfileRoutes.get('/:id/profile', requireUserAuth, validate({ params: TechnicianIdParamsSchema }), (req, res) => controller.getProfile(req, res));

export const technicianSelfRoutes: Router = express.Router();

technicianSelfRoutes.get('/me', requireTechnicianAuth, (req, res) => controller.getSelf(req, res));
technicianSelfRoutes.put('/me', requireTechnicianAuth, validate({ body: UpdateTechnicianSelfBodySchema }), (req, res) => controller.updateSelf(req, res));
technicianSelfRoutes.post('/me/profile-image', requireTechnicianAuth, upload.single('profile_image'), (req, res) => controller.uploadProfileImage(req, res));
