import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type {
	AvailabilityTemplate,
	CalendarException,
} from "../schemas/response.schema";
import {
	exceptionResponseSchema,
	getExceptionsResponseSchema,
	getTemplatesResponseSchema,
	publicScheduleResponseSchema,
	templateResponseSchema,
} from "../schemas/response.schema";
import type {
	CreateExceptionPayload,
	CreateTemplatePayload,
	UpdateTemplatePayload,
} from "../types/calendar";

// ─── Availability templates ───────────────────────────────────────────────────

export async function getTemplates(
	technicianId: string,
): Promise<AvailabilityTemplate[]> {
	const response = await apiClient.get(
		`/api/technician-calendar/${technicianId}/templates`,
	);
	return safeParseResponse(
		getTemplatesResponseSchema,
		response.data,
		"getTemplates",
	).data;
}

export async function createTemplate(
	technicianId: string,
	payload: CreateTemplatePayload,
): Promise<AvailabilityTemplate> {
	const response = await apiClient.post(
		`/api/technician-calendar/${technicianId}/templates`,
		payload,
	);
	return safeParseResponse(
		templateResponseSchema,
		response.data,
		"createTemplate",
	).data;
}

export async function updateTemplate(
	technicianId: string,
	templateId: string,
	payload: UpdateTemplatePayload,
): Promise<AvailabilityTemplate> {
	const response = await apiClient.patch(
		`/api/technician-calendar/${technicianId}/templates/${templateId}`,
		payload,
	);
	return safeParseResponse(
		templateResponseSchema,
		response.data,
		"updateTemplate",
	).data;
}

// ─── Calendar exceptions (single-day overrides) ───────────────────────────────

export async function getExceptions(
	technicianId: string,
): Promise<CalendarException[]> {
	const response = await apiClient.get(
		`/api/technician-calendar/${technicianId}`,
	);
	return safeParseResponse(
		getExceptionsResponseSchema,
		response.data,
		"getExceptions",
	).data;
}

export async function createException(
	technicianId: string,
	payload: CreateExceptionPayload,
): Promise<CalendarException> {
	const response = await apiClient.post(
		`/api/technician-calendar/${technicianId}`,
		payload,
	);
	return safeParseResponse(
		exceptionResponseSchema,
		response.data,
		"createException",
	).data;
}

export async function deleteException(
	technicianId: string,
	exceptionId: string,
): Promise<void> {
	await apiClient.delete(
		`/api/technician-calendar/${technicianId}/${exceptionId}`,
	);
}

export async function getPublicSchedule(technicianId: string) {
	const response = await apiClient.get(
		`/api/technician-calendar/public/${technicianId}`,
	);
	return safeParseResponse(
		publicScheduleResponseSchema,
		response.data,
		"getPublicSchedule",
	).data;
}
