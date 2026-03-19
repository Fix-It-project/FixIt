import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

// ─── Calendar entries ───────────────────────────────────────────────────────

export interface CalendarException {
  id: string;
  technician_id: string;
  date: string;       // YYYY-MM-DD
  created_at: string; // ISO timestamp
}

export interface CreateCalendarEntryData {
  technician_id: string;
  date: string;       // YYYY-MM-DD
}

export interface UpdateCalendarEntryData {
  date?: string;
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
      .from('calendar_exceptions')
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
    return data as CalendarException[];
  }

  async getEntryById(id: string) {
    const { data, error } = await supabase
      .from('calendar_exceptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as CalendarException;
  }

  async createEntry(dto: CreateCalendarEntryData) {
    const { data, error } = await supabase
      .from('calendar_exceptions')
      .insert({
        technician_id: dto.technician_id,
        date: dto.date,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CalendarException;
  }

  async updateEntry(id: string, dto: UpdateCalendarEntryData) {
    const updates: Record<string, any> = {};

    if (dto.date !== undefined) updates.date = dto.date;

    const { data, error } = await supabase
      .from('calendar_exceptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CalendarException;
  }

  async deleteEntry(id: string) {
    const { error } = await supabase
      .from('calendar_exceptions')
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

  async upsertTemplate(dto: CreateTemplateData) {
    // Uses Supabase upsert with the unique constraint on (technician_id, day_of_week).
    // onConflict targets that constraint so it updates the existing row cleanly.
    const { data, error } = await supabase
      .from('availability_templates')
      .upsert(
        {
          technician_id: dto.technician_id,
          day_of_week: dto.day_of_week,
          active: dto.active ?? true,
        },
        { onConflict: 'technician_id,day_of_week' }
      )
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