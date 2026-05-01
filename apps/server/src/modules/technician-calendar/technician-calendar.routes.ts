import { Router, type Router as RouterType } from 'express';
import { technicianCalendarController } from './technician-calendar.controller.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  CreateCalendarEntryBodySchema,
  UpdateCalendarEntryBodySchema,
  CreateTemplateBodySchema,
  UpdateTemplateBodySchema,
  CalendarQuerySchema,
  TechnicianCalendarParamsSchema,
  CalendarEntryParamsSchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();

// Public routes
router.get('/public/:technicianId', validate({ params: TechnicianCalendarParamsSchema, query: CalendarQuerySchema }), (req, res) => technicianCalendarController.getPublicSchedule(req, res));

// Availability templates
router.get('/:technicianId/templates', requireTechnicianAuth, validate({ params: TechnicianCalendarParamsSchema }), (req, res) => technicianCalendarController.getTemplates(req, res));
router.post('/:technicianId/templates', requireTechnicianAuth, validate({ params: TechnicianCalendarParamsSchema, body: CreateTemplateBodySchema }), (req, res) => technicianCalendarController.createTemplate(req, res));
router.get('/:technicianId/templates/:id', requireTechnicianAuth, validate({ params: CalendarEntryParamsSchema }), (req, res) => technicianCalendarController.getTemplate(req, res));
router.patch('/:technicianId/templates/:id', requireTechnicianAuth, validate({ params: CalendarEntryParamsSchema, body: UpdateTemplateBodySchema }), (req, res) => technicianCalendarController.updateTemplate(req, res));
router.delete('/:technicianId/templates/:id', requireTechnicianAuth, validate({ params: CalendarEntryParamsSchema }), (req, res) => technicianCalendarController.deleteTemplate(req, res));

// Calendar entries
router.get('/:technicianId', requireTechnicianAuth, validate({ params: TechnicianCalendarParamsSchema, query: CalendarQuerySchema }), (req, res) => technicianCalendarController.getCalendar(req, res));
router.post('/:technicianId', requireTechnicianAuth, validate({ params: TechnicianCalendarParamsSchema, body: CreateCalendarEntryBodySchema }), (req, res) => technicianCalendarController.createEntry(req, res));
router.get('/:technicianId/:id', requireTechnicianAuth, validate({ params: CalendarEntryParamsSchema }), (req, res) => technicianCalendarController.getEntry(req, res));
router.patch('/:technicianId/:id', requireTechnicianAuth, validate({ params: CalendarEntryParamsSchema, body: UpdateCalendarEntryBodySchema }), (req, res) => technicianCalendarController.updateEntry(req, res));
router.delete('/:technicianId/:id', requireTechnicianAuth, validate({ params: CalendarEntryParamsSchema }), (req, res) => technicianCalendarController.deleteEntry(req, res));

export default router;
