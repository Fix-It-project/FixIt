import apiClient from '@/src/lib/api-client';
import type {
  AvailabilityTemplate,
  GetTemplatesResponse,
  TemplateResponse,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  CalendarException,
  GetExceptionsResponse,
  ExceptionResponse,
  CreateExceptionPayload,
  TechnicianOrder,
  GetTechnicianOrdersResponse,
  PublicScheduleResponse
} from '../types/calendar';

// ─── Availability templates ───────────────────────────────────────────────────

export async function getTemplates(technicianId: string): Promise<AvailabilityTemplate[]> {
  const response = await apiClient.get<GetTemplatesResponse>(
    `/api/technician-calendar/${technicianId}/templates`
  );
  return response.data.data;
}

export async function createTemplate(
  technicianId: string,
  payload: CreateTemplatePayload
): Promise<AvailabilityTemplate> {
  const response = await apiClient.post<TemplateResponse>(
    `/api/technician-calendar/${technicianId}/templates`,
    payload
  );
  return response.data.data;
}

export async function updateTemplate(
  technicianId: string,
  templateId: string,
  payload: UpdateTemplatePayload
): Promise<AvailabilityTemplate> {
  const response = await apiClient.patch<TemplateResponse>(
    `/api/technician-calendar/${technicianId}/templates/${templateId}`,
    payload
  );
  return response.data.data;
}

// ─── Calendar exceptions (single-day overrides) ───────────────────────────────

export async function getExceptions(technicianId: string): Promise<CalendarException[]> {
  const response = await apiClient.get<GetExceptionsResponse>(
    `/api/technician-calendar/${technicianId}`
  );
  return response.data.data;
}

export async function createException(
  technicianId: string,
  payload: CreateExceptionPayload
): Promise<CalendarException> {
  const response = await apiClient.post<ExceptionResponse>(
    `/api/technician-calendar/${technicianId}`,
    payload
  );
  return response.data.data;
}

export async function deleteException(
  technicianId: string,
  exceptionId: string
): Promise<void> {
  await apiClient.delete(
    `/api/technician-calendar/${technicianId}/${exceptionId}`
  );
}

export async function getTechnicianOrders(technicianId: string): Promise<TechnicianOrder[]> {
  // Uses the existing technician orders endpoint — we group by date on the client.
  const response = await apiClient.get<GetTechnicianOrdersResponse>(
    `/api/orders/technician/orders`
  );
  return response.data.data;
}

export async function getPublicSchedule(technicianId: string) {
  const response = await apiClient.get<PublicScheduleResponse>(
    `/api/technician-calendar/public/${technicianId}`
  );
  return response.data.data;
}