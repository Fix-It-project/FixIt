import express, { type Router } from 'express';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';
import { techniciansRepository } from './technicians.repository.js';
import { categoriesRepository } from '../categories/categories.repository.js';

// Mounted at /api/categories/:categoryId/technicians
const router: Router = express.Router({ mergeParams: true });

// Composition root — wire dependencies here so each layer depends only on abstractions
const service = new TechniciansService(techniciansRepository, categoriesRepository);
const controller = new TechniciansController(service);

// GET /api/categories/:categoryId/technicians
router.get('/', (req, res) => controller.getByCategoryId(req, res));

// GET /api/categories/:categoryId/technicians/search?q=<term>
router.get('/search', (req, res) => controller.searchInCategory(req, res));

export default router;
