import { z } from "zod";
import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type TechHomeOrder,
	techHomeOrderResponseSchema,
	techHomeOrdersResponseSchema,
} from "../schemas/orders.schema";
import {
	type TechHomeAvailabilityResponse,
	type TechHomeSelfProfile,
	techHomeAvailabilityResponseSchema,
	techHomeSelfResponseSchema,
} from "../schemas/profile.schema";
import {
	type TechHomeStats,
	techHomeStatsResponseSchema,
} from "../schemas/stats.schema";

// ─── Dashboard stats ────────────────────────────────────────────────────────

export async function getTechHomeStats(): Promise<TechHomeStats> {
	const response = await apiClient.get("/api/technicians/me/stats");
	return safeParseResponse(
		techHomeStatsResponseSchema,
		response.data,
		"getTechHomeStats",
	).stats;
}

// ─── Self profile (shared ["technician","self"] cache) ─────────────────────

export async function getTechHomeSelf(): Promise<TechHomeSelfProfile> {
	const response = await apiClient.get("/api/technicians/me");
	return safeParseResponse(
		techHomeSelfResponseSchema,
		response.data,
		"getTechHomeSelf",
	).profile;
}

// ─── Availability toggle ────────────────────────────────────────────────────

export async function patchAvailability(
	isAvailable: boolean,
): Promise<TechHomeAvailabilityResponse> {
	const response = await apiClient.patch("/api/technicians/me/availability", {
		is_available: isAvailable,
	});
	return safeParseResponse(
		techHomeAvailabilityResponseSchema,
		response.data,
		"patchAvailability",
	);
}

// ─── Orders (shared ["technician-bookings"] cache — see schemas/query-keys) ──

export async function getTechHomeOrders(): Promise<TechHomeOrder[]> {
	const response = await apiClient.get("/api/orders/technician/orders");
	return safeParseResponse(
		techHomeOrdersResponseSchema,
		response.data,
		"getTechHomeOrders",
	).data;
}

export async function acceptOrder(orderId: string): Promise<TechHomeOrder> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/accept`,
	);
	return safeParseResponse(
		techHomeOrderResponseSchema,
		response.data,
		"acceptOrder",
	).data;
}

export async function declineOrder(
	orderId: string,
	reason?: string,
): Promise<TechHomeOrder> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/decline`,
		reason ? { reason } : {},
	);
	return safeParseResponse(
		techHomeOrderResponseSchema,
		response.data,
		"declineOrder",
	).data;
}

// ─── Notification unread badge (shared key with notifications feature) ──────

const unreadCountResponseSchema = z.object({
	data: z.object({ unread_count: z.number() }),
});

export async function getUnreadNotificationCount(): Promise<number> {
	const response = await apiClient.get(
		"/api/notifications/technician/logs/unread-count",
	);
	return safeParseResponse(
		unreadCountResponseSchema,
		response.data,
		"getUnreadNotificationCount",
	).data.unread_count;
}
