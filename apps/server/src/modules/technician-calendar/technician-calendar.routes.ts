import { Router, type Router as RouterType } from 'express';
import { technicianCalendarController } from './technician-calendar.controller.js';
import { requireTechnicianAuth } from '../../shared/middlewares/technician-auth.middleware.js';

const router: RouterType = Router();

// ─── Availability templates ───────────────────────────────────────────────────
router.get('/:technicianId/templates', requireTechnicianAuth, (req, res) => technicianCalendarController.getTemplates(req, res));
router.post('/:technicianId/templates', requireTechnicianAuth, (req, res) => technicianCalendarController.createTemplate(req, res));
router.get('/:technicianId/templates/:id', requireTechnicianAuth, (req, res) => technicianCalendarController.getTemplate(req, res));
router.patch('/:technicianId/templates/:id', requireTechnicianAuth, (req, res) => technicianCalendarController.updateTemplate(req, res));
router.delete('/:technicianId/templates/:id', requireTechnicianAuth, (req, res) => technicianCalendarController.deleteTemplate(req, res));

// ─── Calendar entries ─────────────────────────────────────────────────────────
router.get('/:technicianId', requireTechnicianAuth, (req, res) => technicianCalendarController.getCalendar(req, res));
router.post('/:technicianId', requireTechnicianAuth, (req, res) => technicianCalendarController.createEntry(req, res));
router.get('/:technicianId/:id', requireTechnicianAuth, (req, res) => technicianCalendarController.getEntry(req, res));
router.patch('/:technicianId/:id', requireTechnicianAuth, (req, res) => technicianCalendarController.updateEntry(req, res));
router.delete('/:technicianId/:id', requireTechnicianAuth, (req, res) => technicianCalendarController.deleteEntry(req, res));

export default router;