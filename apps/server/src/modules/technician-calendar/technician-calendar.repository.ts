import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

export type CalendarEntryType = 'booking' | 'blocked';

export interface TechnicianCalendar {
  id: string;
  technician_id: string;
  time_range: string;
  type: CalendarEntryType;
  source: string | null;
  created_at: string;
}

export interface CreateCalendarEntryData {
  technician_id: string;
  start: string;
  end: string;
  type: CalendarEntryType;
  source?: string;
}

export interface UpdateCalendarEntryData {
  start?: string;
  end?: string;
  type?: CalendarEntryType;
  source?: string;
}

export interface CalendarQueryParams {
  from?: string;
  to?: string;
  type?: CalendarEntryType;
}

// ─── Availability Templates ───────────────────────────────────────────────────

export interface AvailabilityTemplate {
  id: string;
  technician_id: string;
  day_of_week: number; // 0 = Sunday
  time_range: string; // e.g. "[09:00:00,17:00:00)"
  active: boolean;
}

export interface CreateTemplateData {
  technician_id: string;
  day_of_week: number;
  start: string; // HH:MM:SS e.g. "09:00:00"
  end: string;   // HH:MM:SS e.g. "17:00:00"
}

export interface UpdateTemplateData {
  day_of_week?: number;
  start?: string;
  end?: string;
  active?: boolean;
}

export class TechnicianCalendarRepository {
  // ─── Calendar entries ─────────────────────────────────────────────────────

  async getEntriesByTechnicianId(technicianId: string, params: CalendarQueryParams = {}) {
    let query = supabase
      .from('technician_calendar')
      .select('*')
      .eq('technician_id', technicianId)
      .order('created_at', { ascending: true });

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.from && params.to) {
      const tsrange = `[${params.from},${params.to})`;
      query = query.filter('time_range', 'ov', tsrange);
    } else if (params.from) {
      query = query.gte('time_range', params.from);
    } else if (params.to) {
      query = query.lte('time_range', params.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TechnicianCalendar[];
  }

  async getEntryById(id: string) {
    const { data, error } = await supabase
      .from('technician_calendar')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as TechnicianCalendar;
  }

  async createEntry(dto: CreateCalendarEntryData) {
    const timeRange = `[${dto.start},${dto.end})`;

    const { data, error } = await supabase
      .from('technician_calendar')
      .insert({
        technician_id: dto.technician_id,
        time_range: timeRange,
        type: dto.type,
        source: dto.source ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as TechnicianCalendar;
  }

  async updateEntry(id: string, dto: UpdateCalendarEntryData) {
    const updates: Record<string, any> = {};

    if (dto.start && dto.end) {
      updates.time_range = `[${dto.start},${dto.end})`;
    }
    if (dto.type) updates.type = dto.type;
    if (dto.source !== undefined) updates.source = dto.source;

    const { data, error } = await supabase
      .from('technician_calendar')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TechnicianCalendar;
  }

  async deleteEntry(id: string) {
    const { error } = await supabase
      .from('technician_calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ─── Availability templates ───────────────────────────────────────────────

  async getTemplatesByTechnicianId(technicianId: string, activeOnly = true) {
    let query = supabase
      .from('availability_templates')
      .select('*')
      .eq('technician_id', technicianId)
      .order('day_of_week', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AvailabilityTemplate[];
  }

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('availability_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as AvailabilityTemplate;
  }

  async createTemplate(dto: CreateTemplateData) {
    const { data, error } = await supabase
      .from('availability_templates')
      .insert({
        technician_id: dto.technician_id,
        day_of_week: dto.day_of_week,
        time_range: `[${dto.start},${dto.end})`,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AvailabilityTemplate;
  }

  async updateTemplate(id: string, dto: UpdateTemplateData) {
    const updates: Record<string, any> = {};

    if (dto.start && dto.end) updates.time_range = `[${dto.start},${dto.end})`;
    if (dto.day_of_week !== undefined) updates.day_of_week = dto.day_of_week;
    if (dto.active !== undefined) updates.active = dto.active;

    const { data, error } = await supabase
      .from('availability_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AvailabilityTemplate;
  }

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('availability_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const technicianCalendarRepository = new TechnicianCalendarRepository();