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

    // Entries cannot be scheduled on today or in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(startDate);
    startDay.setHours(0, 0, 0, 0);

    if (startDay <= today) {
      throw { status: 400, message: 'Calendar entries cannot be scheduled on today or in the past.' };
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

  private validateSpecificDate(date: string) {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw { status: 400, message: 'Invalid specific_date format. Use YYYY-MM-DD.' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDay = new Date(parsed);
    parsedDay.setHours(0, 0, 0, 0);

    if (parsedDay <= today) {
      throw { status: 400, message: 'specific_date must be in the future.' };
    }
  }

  private async validateAgainstTemplate(technicianId: string, start: string, end: string) {
    const date = new Date(start).toISOString().split('T')[0] as any; // YYYY-MM-DD
    const template = await technicianCalendarRepository.getTemplateForDate(technicianId, date);

    if (!template) {
      throw { status: 409, message: 'No availability template set for this day. The technician has not defined working hours.' };
    }

    if (!template.active) {
      throw { status: 409, message: 'The technician is marked as unavailable on this day.' };
    }

    // Parse template time range "[HH:MM:SS,HH:MM:SS)"
    const match = template.time_range.match(/\[(.+),(.+)\)/);
    if (!match) throw { status: 500, message: 'Failed to parse template time range.' };

    const entryStart = new Date(start);
    const entryEnd = new Date(end);

    // Build template start/end using the same date as the entry
    const datePrefix = date; // YYYY-MM-DD
    const templateStart = new Date(`${datePrefix}T${match[1]}Z`);
    const templateEnd = new Date(`${datePrefix}T${match[2]}Z`);

    if (entryStart < templateStart || entryEnd > templateEnd) {
      throw {
        status: 409,
        message: `Entry must be within the technician's available hours: ${match[1]} – ${match[2]}.`,
      };
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
    await this.validateAgainstTemplate(data.technician_id, data.start, data.end);
    await this.validateBufferPeriod(data.technician_id, data.start, data.end);

    const entry = await technicianCalendarRepository.createEntry(data);

    const BUFFER_MS = 3 * 60 * 60 * 1000;
    const startMs = new Date(data.start).getTime();
    const endMs = new Date(data.end).getTime();

    // Buffer slot BEFORE the entry
    await technicianCalendarRepository.createEntry({
      technician_id: data.technician_id,
      start: new Date(startMs - BUFFER_MS).toISOString(),
      end: data.start,
      type: 'blocked',
      source: 'blocking as defined',
    });

    // Buffer slot AFTER the entry
    await technicianCalendarRepository.createEntry({
      technician_id: data.technician_id,
      start: data.end,
      end: new Date(endMs + BUFFER_MS).toISOString(),
      type: 'blocked',
      source: 'blocking as defined',
    });

    return entry;
  }

  async updateEntry(id: string, data: UpdateCalendarEntryData) {
    const existing = await technicianCalendarRepository.getEntryById(id);
    if (!existing) throw { status: 404, message: 'Calendar entry not found.' };

    if (data.start && data.end) {
      this.validateTimeRange(data.start, data.end);
      await this.validateAgainstTemplate(existing.technician_id, data.start, data.end);
      await this.validateBufferPeriod(existing.technician_id, data.start, data.end, id);
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

    if (data.is_one_time) {
      // One-time template requires a specific_date
      if (!data.specific_date) {
        throw { status: 400, message: 'specific_date is required for one-time templates.' };
      }
      this.validateSpecificDate(data.specific_date);

      // One slot per day rule — check against other one-time templates for same date
      const existing = await technicianCalendarRepository.getTemplatesByTechnicianId(data.technician_id, false);
      const duplicate = existing.find(
        t => t.is_one_time && t.specific_date === data.specific_date
      );
      if (duplicate) {
        throw { status: 409, message: 'You can only set your time for the entire day. A one-time template for this date already exists.' };
      }
    } else {
      // Recurring template — check one slot per day_of_week rule
      const existing = await technicianCalendarRepository.getTemplatesByTechnicianId(data.technician_id, false);
      const duplicate = existing.find(
        t => !t.is_one_time && t.day_of_week === data.day_of_week
      );
      if (duplicate) {
        throw { status: 409, message: 'You can only set your time for the entire day. A template for this day already exists.' };
      }
    }

    // active:false on one-time = full day off, no time range needed
    if (data.active === false && data.is_one_time) {
      data.start = '00:00';
      data.end = '23:59';
    } else {
      this.validateTimeOnly(data.start, data.end);
    }

    return technicianCalendarRepository.createTemplate(data);
  }

  async updateTemplate(id: string, data: UpdateTemplateData) {
    const existing = await technicianCalendarRepository.getTemplateById(id);
    if (!existing) throw { status: 404, message: 'Availability template not found.' };

    // Block time/day changes if recurring template day is inactive
    if (!existing.active && !existing.is_one_time && (data.start || data.end || data.day_of_week !== undefined)) {
      throw { status: 400, message: 'Cannot update a template for a day that is marked as unavailable. Re-activate the day first.' };
    }

    // Block changing day_of_week to one that already has a recurring template
    if (!existing.is_one_time && data.day_of_week !== undefined && data.day_of_week !== existing.day_of_week) {
      this.validateDayOfWeek(data.day_of_week);
      const allTemplates = await technicianCalendarRepository.getTemplatesByTechnicianId(existing.technician_id, false);
      const duplicate = allTemplates.find(t => !t.is_one_time && t.day_of_week === data.day_of_week);
      if (duplicate) {
        throw { status: 409, message: 'You can only set your time for the entire day. A template for this day already exists.' };
      }
    }

    // Block changing specific_date to one that already has a one-time template
    if (existing.is_one_time && data.specific_date && data.specific_date !== existing.specific_date) {
      this.validateSpecificDate(data.specific_date);
      const allTemplates = await technicianCalendarRepository.getTemplatesByTechnicianId(existing.technician_id, false);
      const duplicate = allTemplates.find(t => t.is_one_time && t.specific_date === data.specific_date);
      if (duplicate) {
        throw { status: 409, message: 'You can only set your time for the entire day. A one-time template for this date already exists.' };
      }
    }

    if (data.start || data.end) {
      const match = existing.time_range.match(/\[(.+),(.+)\)/) as any;
      if (!match) throw { status: 500, message: 'Failed to parse existing template time range.' };
      const currentStart: string = match[1];
      const currentEnd: string = match[2];
      this.validateTimeOnly(data.start ?? currentStart, data.end ?? currentEnd);
    }

    if (data.day_of_week !== undefined) this.validateDayOfWeek(data.day_of_week);

    return technicianCalendarRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string) {
    const existing = await technicianCalendarRepository.getTemplateById(id);
    if (!existing) throw { status: 404, message: 'Availability template not found.' };

    await technicianCalendarRepository.deleteTemplate(id);
  }

  async validateBufferPeriod(technicianId: string, start: string, end: string, excludeId?: string) {
    const BUFFER_MS = 3 * 60 * 60 * 1000;
    const newStart = new Date(start).getTime();
    const newEnd = new Date(end).getTime();

    const entries = await technicianCalendarRepository.getEntriesByTechnicianId(technicianId);

    for (const entry of entries) {
      if (excludeId && entry.id === excludeId) continue;

      // Parse Postgres tsrange format "[start,end)"
      const match = entry.time_range.match(/\[(.+),(.+)\)/) as any;
      if (!match) continue;

      const entryStart = new Date(match[1]).getTime();
      const entryEnd = new Date(match[2]).getTime();

      const tooCloseAfter = newStart < entryEnd + BUFFER_MS;
      const tooCloseBefore = newEnd > entryStart - BUFFER_MS;

      if (tooCloseAfter && tooCloseBefore) {
        throw {
          status: 409,
          message: 'A buffer of 3 hours is required before and after each calendar entry.',
        };
      }
    }
  }
}

export const technicianCalendarService = new TechnicianCalendarService();