import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { rescheduleController } from './reschedule.controller.js';
import { requireUserAuth } from '../../shared/middlewares/user-auth.middleware.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  RescheduleRequestBodySchema,
  RescheduleRejectBodySchema,
  OrderIdParamsSchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();

// User surface
router.post(
  '/user/orders/:id/reschedule',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRequestBodySchema }),
  (req, res) => rescheduleController.requestReschedule(req, res, 'user'),
);

router.post(
  '/user/orders/:id/reschedule/approve',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema }),
  (req, res) => rescheduleController.approveReschedule(req, res, 'user'),
);

router.post(
  '/user/orders/:id/reschedule/reject',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRejectBodySchema }),
  (req, res) => rescheduleController.rejectReschedule(req, res, 'user'),
);

router.post(
  '/user/orders/:id/reschedule/withdraw',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema }),
  (req, res) => rescheduleController.withdrawReschedule(req, res, 'user'),
);

// Technician surface
router.post(
  '/technician/orders/:id/reschedule',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRequestBodySchema }),
  (req, res) => rescheduleController.requestReschedule(req, res, 'technician'),
);

router.post(
  '/technician/orders/:id/reschedule/approve',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema }),
  (req, res) => rescheduleController.approveReschedule(req, res, 'technician'),
);

router.post(
  '/technician/orders/:id/reschedule/reject',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRejectBodySchema }),
  (req, res) => rescheduleController.rejectReschedule(req, res, 'technician'),
);

router.post(
  '/technician/orders/:id/reschedule/withdraw',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema }),
  (req, res) => rescheduleController.withdrawReschedule(req, res, 'technician'),
);

export default router;
