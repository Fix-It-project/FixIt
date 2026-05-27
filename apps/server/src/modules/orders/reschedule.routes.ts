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
router.get(
  '/user/orders/:id/reschedule',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema }),
  rescheduleController.get('user'),
);

router.post(
  '/user/orders/:id/reschedule',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRequestBodySchema }),
  rescheduleController.createRequest('user'),
);

router.post(
  '/user/orders/:id/reschedule/approve',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema }),
  rescheduleController.approve('user'),
);

router.post(
  '/user/orders/:id/reschedule/reject',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRejectBodySchema }),
  rescheduleController.reject('user'),
);

router.post(
  '/user/orders/:id/reschedule/withdraw',
  requireUserAuth,
  validate({ params: OrderIdParamsSchema }),
  rescheduleController.withdraw('user'),
);

// Technician surface
router.get(
  '/technician/orders/:id/reschedule',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema }),
  rescheduleController.get('technician'),
);

router.post(
  '/technician/orders/:id/reschedule',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRequestBodySchema }),
  rescheduleController.createRequest('technician'),
);

router.post(
  '/technician/orders/:id/reschedule/approve',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema }),
  rescheduleController.approve('technician'),
);

router.post(
  '/technician/orders/:id/reschedule/reject',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema, body: RescheduleRejectBodySchema }),
  rescheduleController.reject('technician'),
);

router.post(
  '/technician/orders/:id/reschedule/withdraw',
  requireTechnicianAuth,
  validate({ params: OrderIdParamsSchema }),
  rescheduleController.withdraw('technician'),
);

export default router;
