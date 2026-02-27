import {
  technicianCalendarRepository,
  type CreateCalendarEntryData,
  type UpdateCalendarEntryData,
  type CalendarQueryParams,
  type CreateTemplateData,
  type UpdateTemplateData,
} from './technician-calendar.repository.js';

export class TechnicianCalendarService {
  // ─── Validation ───────────────────────────────────────────────────────────

  private validateTimeRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw { status: 400, message: 'Invalid date format. Use ISO 8601.' };
    }

    if (startDate >= endDate) {
      throw { status: 400, message: '`start` must be before `end`.' };
    }
  }

  private validateDayOfWeek(day: number) {
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw {
        status: 400,
        message: '`day_of_week` must be an integer between 0 (Sunday) and 6 (Saturday).',
      };
    }
  }

  private validateTimeOnly(start: string, end: string) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      throw { status: 400, message: 'Invalid time format. Use HH:MM:SS.' };
    }

    if (start >= end) {
      throw { status: 400, message: '`start` must be before `end`.' };
    }
  }

  // ─── Calendar entries ─────────────────────────────────────────────────────

  async getCalendar(technicianId: string, params: CalendarQueryParams) {
    return technicianCalendarRepository.getEntriesByTechnicianId(technicianId, params);
  }

  async getEntry(id: string) {
    const entry = await technicianCalendarRepository.getEntryById(id);
    if (!entry) throw { status: 404, message: 'Calendar entry not found.' };
    return entry;
  }

  async createEntry(data: CreateCalendarEntryData) {
    this.validateTimeRange(data.start, data.end);

    return technicianCalendarRepository.createEntry(data);
  }

  async updateEntry(id: string, data: UpdateCalendarEntryData) {
    const existing = await technicianCalendarRepository.getEntryById(id);
    if (!existing) throw { status: 404, message: 'Calendar entry not found.' };

    if (data.start && data.end) {
      this.validateTimeRange(data.start, data.end);
    } else if (data.start || data.end) {
      throw { status: 400, message: 'Both `start` and `end` must be provided together.' };
    }

    return technicianCalendarRepository.updateEntry(id, data);
  }

  async deleteEntry(id: string) {
    const existing = await technicianCalendarRepository.getEntryById(id);
    if (!existing) throw { status: 404, message: 'Calendar entry not found.' };

    await technicianCalendarRepository.deleteEntry(id);
  }

  // ─── Availability templates ───────────────────────────────────────────────

  async getTemplates(technicianId: string, activeOnly: boolean) {
    return technicianCalendarRepository.getTemplatesByTechnicianId(technicianId, activeOnly);
  }

  async getTemplate(id: string) {
    const template = await technicianCalendarRepository.getTemplateById(id);
    if (!template) throw { status: 404, message: 'Availability template not found.' };
    return template;
  }

  async createTemplate(data: CreateTemplateData) {
    this.validateDayOfWeek(data.day_of_week);
    this.validateTimeOnly(data.start, data.end);
    try {
      return await technicianCalendarRepository.createTemplate(data);
    } catch (err: any) {
      if (err.code === '23P01') {
        throw {
          status: 409,
          message: 'This time range overlaps with an existing template for this day.',
        };
      }
      throw err;
    }
  }

  async updateTemplate(id: string, data: UpdateTemplateData) {
    const existing = await technicianCalendarRepository.getTemplateById(id);
    if (!existing) throw { status: 404, message: 'Availability template not found.' };

    if (data.day_of_week !== undefined) this.validateDayOfWeek(data.day_of_week);
    if (data.start && data.end) this.validateTimeOnly(data.start, data.end);
    else if (data.start || data.end) {
      throw { status: 400, message: 'Both `start` and `end` must be provided together.' };
    }

    try {
      return await technicianCalendarRepository.updateTemplate(id, data);
    } catch (err: any) {
      if (err.code === '23P01') {
        throw {
          status: 409,
          message: 'This time range overlaps with an existing template for this day.',
        };
      }
      throw err;
    }
  }

  async deleteTemplate(id: string) {
    const existing = await technicianCalendarRepository.getTemplateById(id);
    if (!existing) throw { status: 404, message: 'Availability template not found.' };

    await technicianCalendarRepository.deleteTemplate(id);
  }
}

export const technicianCalendarService = new TechnicianCalendarService();