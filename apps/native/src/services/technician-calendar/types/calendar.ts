// ─── Availability templates ───────────────────────────────────────────────────

export interface AvailabilityTemplate {
  id: string;
  technician_id: string;
  day_of_week: number; // 0 (Sun) to 6 (Sat)
  active: boolean;
}

export interface GetTemplatesResponse {
  data: AvailabilityTemplate[];
}

export interface TemplateResponse {
  data: AvailabilityTemplate;
}

export interface CreateTemplatePayload {
  day_of_week: number;
  active: boolean;
}

export interface UpdateTemplatePayload {
  active: boolean;
}

// ─── Calendar exceptions (single-day unavailability overrides) ────────────────

export interface CalendarException {
  id: string;
  technician_id: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface GetExceptionsResponse {
  data: CalendarException[];
}

export interface ExceptionResponse {
  data: CalendarException;
}

export interface CreateExceptionPayload {
  date: string; // YYYY-MM-DD
}

// ─── Technician orders (for calendar display) ─────────────────────────────────

export interface TechnicianOrder {
  id: string;
  technician_id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled_by_user' | 'cancelled_by_technician' | 'completed';
  problem_description: string | null;
  scheduled_date: string; // YYYY-MM-DD
  active: boolean;
  created_at: string;
}

export interface GetTechnicianOrdersResponse {
  data: TechnicianOrder[];
}

export interface PublicScheduleResponse {
  data: {
    templates: AvailabilityTemplate[];
    exceptions: CalendarException[];
  };
}