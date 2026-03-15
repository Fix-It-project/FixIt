import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

// ─── Calendar entries ───────────────────────────────────────────────────────

export interface TechnicianCalendar {
  id: string;
  technician_id: string;
  date: string;       // YYYY-MM-DD
  created_at: string; // ISO timestamp
  active: boolean;    // current flag
  source: string | null; // e.g. 'booking', 'holiday', 'system'
}

export interface CreateCalendarEntryData {
  technician_id: string;
  date: string;           // YYYY-MM-DD
  active?: boolean;       // default true
  source?: string | null; // default 'booking'
}

export interface UpdateCalendarEntryData {
  date?: string;            // YYYY-MM-DD
  active?: boolean;
  source?: string | null;
}

export interface CalendarQueryParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

// ─── Availability Templates (recurring only) ───────────────────────────────

export interface AvailabilityTemplate {
  id: string;
  technician_id: string;
  day_of_week: number; // 0 = Sunday
  active: boolean;
}

export interface CreateTemplateData {
  technician_id: string;
  day_of_week: number;
  active?: boolean; // default true
}

export interface UpdateTemplateData {
  day_of_week?: number;
  active?: boolean;
}

export class TechnicianCalendarRepository {
  // ─── Calendar entries ─────────────────────────────────────────────────────

  async getEntriesByTechnicianId(technicianId: string, params: CalendarQueryParams = {}) {
    let query = supabase
      .from('technician_calendar')
      .select('*')
      .eq('technician_id', technicianId)
      .order('date', { ascending: true });

    if (params.from) {
      query = query.gte('date', params.from);
    }

    if (params.to) {
      query = query.lte('date', params.to);
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
    const { data, error } = await supabase
      .from('technician_calendar')
      .insert({
        technician_id: dto.technician_id,
        date: dto.date,
        active: dto.active ?? true,
        source: dto.source ?? 'booking',
      })
      .select()
      .single();

    if (error) throw error;
    return data as TechnicianCalendar;
  }

  async updateEntry(id: string, dto: UpdateCalendarEntryData) {
    const updates: Record<string, any> = {};

    if (dto.date !== undefined) updates.date = dto.date;
    if (dto.active !== undefined) updates.active = dto.active;
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

  // ─── Availability templates (recurring) ──────────────────────────────────

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
        active: dto.active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AvailabilityTemplate;
  }

  async updateTemplate(id: string, dto: UpdateTemplateData) {
    const updates: Record<string, any> = {};

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

  async getTemplateForDate(technicianId: string, date: string): Promise<AvailabilityTemplate | null> {
    const dayOfWeek = new Date(date).getDay();

    const { data, error } = await supabase
      .from('availability_templates')
      .select('*')
      .eq('technician_id', technicianId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as AvailabilityTemplate | null;
  }
}

export const technicianCalendarRepository = new TechnicianCalendarRepository();