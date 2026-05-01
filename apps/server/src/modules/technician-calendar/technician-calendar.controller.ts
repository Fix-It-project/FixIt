import type { Request, Response } from 'express';
import { technicianCalendarService } from './technician-calendar.service.js';
import { normalizeError } from '../../shared/errors/index.js';

export class TechnicianCalendarController {
  private checkOwnership(req: Request, res: Response): string | null {
    const { technicianId } = req.params as any;
    const technician = req.technician;

    if (technician!.id !== technicianId) {
      res.status(403).json({ error: 'You can only manage your own calendar.' });
      return null;
    }

    return technicianId;
  }

  async getCalendar(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { from, to } = req.query as any;
      const entries = await technicianCalendarService.getCalendar(technicianId, { from, to });
      return res.status(200).json({ data: entries });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const entry = await technicianCalendarService.getEntry(id);
      return res.status(200).json({ data: entry });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async createEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { date } = req.body;

      const entry = await technicianCalendarService.createEntry({
        technician_id: technicianId,
        date,
      });

      return res.status(201).json({ data: entry });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async updateEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const { date } = req.body;

      const entry = await technicianCalendarService.updateEntry(id, { date });
      return res.status(200).json({ data: entry });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async deleteEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      await technicianCalendarService.deleteEntry(id);
      return res.status(204).send();
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getPublicSchedule(req: Request, res: Response) {
    try {
      const { technicianId } = req.params as any;
      const { from, to } = req.query as any;

      const templates = await technicianCalendarService.getTemplates(technicianId, false);
      const exceptions = await technicianCalendarService.getCalendar(technicianId, { from, to });

      return res.status(200).json({ data: { templates, exceptions } });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getTemplates(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { activeOnly } = req.query as any;
      const templates = await technicianCalendarService.getTemplates(technicianId, activeOnly === 'true');
      return res.status(200).json({ data: templates });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const template = await technicianCalendarService.getTemplate(id);
      return res.status(200).json({ data: template });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async createTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { day_of_week, active } = req.body;

      const template = await technicianCalendarService.createTemplate({
        technician_id: technicianId,
        day_of_week,
        active,
      });

      return res.status(201).json({ data: template });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const { day_of_week, active } = req.body;
      const template = await technicianCalendarService.updateTemplate(id, { day_of_week, active });
      return res.status(200).json({ data: template });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      await technicianCalendarService.deleteTemplate(id);
      return res.status(204).send();
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }
}

export const technicianCalendarController = new TechnicianCalendarController();
