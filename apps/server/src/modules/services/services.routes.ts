import express, { type Router } from 'express';
import { servicesController } from './services.controller.js';

// Mounted at /api/categories/:categoryId/services
const router: Router = express.Router({ mergeParams: true });

// GET /api/categories/:categoryId/services
router.get('/', (req, res) => servicesController.getByCategoryId(req, res));

// GET /api/categories/:categoryId/services/:serviceId
router.get('/:serviceId', (req, res) => servicesController.getById(req, res));

export default router;
