import type { Request, Response } from 'express';
import { technicianCalendarService } from './technician-calendar.service.js';

export class TechnicianCalendarController {
  private checkOwnership(req: Request, res: Response): string | null {
    const { technicianId } = req.params as any;
    const technician = (req as any).technician;

    if (technician.id !== technicianId) {
      res.status(403).json({ error: 'You can only manage your own calendar.' });
      return null;
    }

    return technicianId;
  }

  // ─── GET /api/technician-calendar/:technicianId ───────────────────────────

  async getCalendar(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { from, to } = req.query as any;
      const entries = await technicianCalendarService.getCalendar(technicianId, { from, to });
      return res.status(200).json({ data: entries });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── GET /api/technician-calendar/:technicianId/:id ──────────────────────

  async getEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const entry = await technicianCalendarService.getEntry(id);
      return res.status(200).json({ data: entry });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── POST /api/technician-calendar/:technicianId ─────────────────────────

  async createEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { date } = req.body;

      if (!date) {
        return res.status(400).json({ error: '`date` is required in format YYYY-MM-DD.' });
      }

      const entry = await technicianCalendarService.createEntry({
        technician_id: technicianId,
        date,
      });

      return res.status(201).json({ data: entry });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── PATCH /api/technician-calendar/:technicianId/:id ────────────────────

  async updateEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const { date } = req.body; // Removed source and active

      const entry = await technicianCalendarService.updateEntry(id, { date });
      return res.status(200).json({ data: entry });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── DELETE /api/technician-calendar/:technicianId/:id ───────────────────

  async deleteEntry(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      await technicianCalendarService.deleteEntry(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── GET /api/technician-calendar/:technicianId/templates ────────────────

  async getTemplates(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { activeOnly } = req.query as any;
      const templates = await technicianCalendarService.getTemplates(technicianId, activeOnly !== 'false');
      return res.status(200).json({ data: templates });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── GET /api/technician-calendar/:technicianId/templates/:id ────────────

  async getTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const template = await technicianCalendarService.getTemplate(id);
      return res.status(200).json({ data: template });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── POST /api/technician-calendar/:technicianId/templates ───────────────

  async createTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { day_of_week, active } = req.body;

      if (day_of_week === undefined) {
        return res.status(400).json({ error: '`day_of_week` is required for availability templates.' });
      }

      const template = await technicianCalendarService.createTemplate({
        technician_id: technicianId,
        day_of_week,
        active,
      });

      return res.status(201).json({ data: template });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── PATCH /api/technician-calendar/:technicianId/templates/:id ──────────

  async updateTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      const { day_of_week, active } = req.body;
      const template = await technicianCalendarService.updateTemplate(id, { day_of_week, active });
      return res.status(200).json({ data: template });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // ─── DELETE /api/technician-calendar/:technicianId/templates/:id ─────────

  async deleteTemplate(req: Request, res: Response) {
    try {
      const technicianId = this.checkOwnership(req, res);
      if (!technicianId) return;

      const { id } = req.params as any;
      await technicianCalendarService.deleteTemplate(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }
}

export const technicianCalendarController = new TechnicianCalendarController();