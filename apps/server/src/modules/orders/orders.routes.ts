import { Router } from 'express';
import type { Router as RouterType } from 'express';
import multer from 'multer';
import { ordersController } from './orders.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  CreateOrderBodySchema,
  UserUpdateOrderBodySchema,
  TechnicianUpdateOrderBodySchema,
  OrderIdParamsSchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/user/orders', requireUserAuth, (req, res) => ordersController.getUserOrders(req, res));
router.post('/user/orders', requireUserAuth, upload.single('attachment'), validate({ body: CreateOrderBodySchema }), (req, res) => ordersController.createOrder(req, res));
router.get('/user/orders/:id', requireUserAuth, validate({ params: OrderIdParamsSchema }), (req, res) => ordersController.getUserOrderById(req, res));
router.patch('/user/orders/:id', requireUserAuth, validate({ params: OrderIdParamsSchema, body: UserUpdateOrderBodySchema }), (req, res) => ordersController.userUpdateOrder(req, res));

router.get('/technician/orders', requireTechnicianAuth, (req, res) => ordersController.getTechnicianOrders(req, res));
router.get('/technician/orders/:id', requireTechnicianAuth, validate({ params: OrderIdParamsSchema }), (req, res) => ordersController.getTechnicianOrderById(req, res));
router.patch('/technician/orders/:id', requireTechnicianAuth, validate({ params: OrderIdParamsSchema, body: TechnicianUpdateOrderBodySchema }), (req, res) => ordersController.technicianUpdateOrder(req, res));

export default router;
