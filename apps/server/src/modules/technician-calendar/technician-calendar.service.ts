import {
  technicianCalendarRepository,
  type CreateCalendarEntryData,
  type UpdateCalendarEntryData,
  type CalendarQueryParams,
  type CreateTemplateData,
  type UpdateTemplateData,
} from './technician-calendar.repository.js';
import { ordersRepository } from '../orders/orders.repository.js';

export class TechnicianCalendarService {
  // ─── Helpers ──────────────────────────────────────────────────────────────

  private normalizeDate(date: string) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      throw { status: 400, message: 'Invalid date format. Use YYYY-MM-DD.' };
    }
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  /** Holidays/off days can be today or later (not in the past). */
  private ensureNotPastDate(date: string) {
    const normalized = this.normalizeDate(date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(normalized);
    target.setHours(0, 0, 0, 0);

    if (target < today) {
      throw { status: 400, message: 'Date cannot be in the past.' };
    }

    return normalized;
  }

  private validateDayOfWeek(day: number) {
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw {
        status: 400,
        message: '`day_of_week` must be an integer between 0 (Sunday) and 6 (Saturday).',
      };
    }
  }

  /** Holiday rules: no other exception exists for this day, and no active bookings. */
  private async ensureHolidayConstraints(technicianId: string, date: string, excludeId?: string) {
    const entries = await technicianCalendarRepository.getEntriesByTechnicianId(technicianId, {
      from: date,
      to: date,
    });

    const hasHoliday = entries.some(e => !excludeId || e.id !== excludeId);
    if (hasHoliday) {
      throw { status: 409, message: 'A holiday/exception already exists for this day.' };
    }

    // NEW: Check the orders table for active bookings
    const activeOrdersCount = await ordersRepository.getActiveOrdersCountForDate(technicianId, date);
    if (activeOrdersCount > 0) {
      throw {
        status: 409,
        message: 'There are active bookings on this day. Cancel them before setting a holiday.',
      };
    }
  }

  // ─── Calendar entries (per‑day exceptions) ──────────────────────

  async getCalendar(technicianId: string, params: CalendarQueryParams) {
    const { from, to } = params;
    const normalized: CalendarQueryParams = {};
    if (from) normalized.from = this.normalizeDate(from);
    if (to) normalized.to = this.normalizeDate(to);
    return technicianCalendarRepository.getEntriesByTechnicianId(technicianId, normalized);
  }

  async getEntry(id: string) {
    const entry = await technicianCalendarRepository.getEntryById(id);
    if (!entry) throw { status: 404, message: 'Calendar entry not found.' };
    return entry;
  }

  async createEntry(data: CreateCalendarEntryData) {
    const technicianId = data.technician_id;
    const normalizedDate = this.ensureNotPastDate(data.date);

    await this.ensureHolidayConstraints(technicianId, normalizedDate);

    return technicianCalendarRepository.createEntry({
      technician_id: technicianId,
      date: normalizedDate,
    });
  }

  async updateEntry(id: string, data: UpdateCalendarEntryData) {
    const existing = await technicianCalendarRepository.getEntryById(id);
    if (!existing) throw { status: 404, message: 'Calendar entry not found.' };

    const updates: UpdateCalendarEntryData = {};

    if (data.date) {
      const normalizedDate = this.ensureNotPastDate(data.date);
      await this.ensureHolidayConstraints(existing.technician_id, normalizedDate, id);
      updates.date = normalizedDate;
    }

    if (Object.keys(updates).length === 0) {
      return existing;
    }

    return technicianCalendarRepository.updateEntry(id, updates);
  }

  async deleteEntry(id: string) {
    const existing = await technicianCalendarRepository.getEntryById(id);
    if (!existing) throw { status: 404, message: 'Calendar entry not found.' };

    await technicianCalendarRepository.deleteEntry(id);
  }

  // ─── Availability templates (recurring on/off weekdays) ──────────────────

  async getTemplates(technicianId: string, activeOnly: boolean) {
    return technicianCalendarRepository.getTemplatesByTechnicianId(technicianId, activeOnly);
  }

  async getTemplate(id: string) {
    const template = await technicianCalendarRepository.getTemplateById(id);
    if (!template) throw { status: 404, message: 'Availability template not found.' };
    return template;
  }

  async createTemplate(data: CreateTemplateData) {
    if (data.day_of_week === undefined) {
      throw { status: 400, message: 'day_of_week is required for availability templates.' };
    }

    this.validateDayOfWeek(data.day_of_week);

    // Upsert: delegate to the repository which uses Supabase's native upsert
    // on the (technician_id, day_of_week) unique constraint. POST is now
    // fully idempotent — no 409 ever reaches the frontend.
    return technicianCalendarRepository.upsertTemplate({
      technician_id: data.technician_id,
      day_of_week: data.day_of_week,
      active: data.active,
    });
  }

  async updateTemplate(id: string, data: UpdateTemplateData) {
    const existing = await technicianCalendarRepository.getTemplateById(id);
    if (!existing) throw { status: 404, message: 'Availability template not found.' };

    if (data.day_of_week !== undefined && data.day_of_week !== existing.day_of_week) {
      this.validateDayOfWeek(data.day_of_week);
      const allTemplates = await technicianCalendarRepository.getTemplatesByTechnicianId(existing.technician_id, false);
      const duplicate = allTemplates.find(t => t.day_of_week === data.day_of_week);
      if (duplicate) {
        throw {
          status: 409,
          message: 'A template for this weekday already exists.',
        };
      }
    }

    return technicianCalendarRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string) {
    const existing = await technicianCalendarRepository.getTemplateById(id);
    if (!existing) throw { status: 404, message: 'Availability template not found.' };

    await technicianCalendarRepository.deleteTemplate(id);
  }

  async isDateHoliday(technicianId: string, date: string): Promise<boolean> {
    const entries = await technicianCalendarRepository.getEntriesByTechnicianId(technicianId, {
      from: date,
      to: date,
    });
    // If any record exists in calendar_exceptions for this date, it's considered blocked.
    return entries.length > 0;
  }
}

export const technicianCalendarService = new TechnicianCalendarService();
