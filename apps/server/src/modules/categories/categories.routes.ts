import express, { type Router } from 'express';
import { categoriesController } from './categories.controller.js';

const router: Router = express.Router();

// GET /api/categories
router.get('/', (req, res) => categoriesController.getAll(req, res));

// GET /api/categories/:id
router.get('/:id', (req, res) => categoriesController.getById(req, res));

export default router;
