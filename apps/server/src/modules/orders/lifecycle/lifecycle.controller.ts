/**
 * Thin HTTP handlers for every lifecycle verb route. Each handler:
 *
 *   1. Extracts the actor id from `req.user.id` (user routes) or
 *      `req.technician.id` (technician routes) — never from the body.
 *   2. Reads the validated body / params off `req` (Zod-validated upstream
 *      by the route's `validate(...)` middleware).
 *   3. Delegates to `lifecycleService.<method>(...)`.
 *   4. Sends the JSON response (201 for create, 200 for everything else).
 *   5. Funnels errors to the Express error middleware via `asyncHandler`.
 *
 * The two GET sub-resource handlers (events + quotes) are the ONLY handlers
 * that touch `supabaseAdmin` directly. They authorize by re-reading the
 * order and asserting the actor owns it (user_id or technician_id match)
 * — service-role bypass is gated by this app-level check (T-02-10).
 */

import type { Request, RequestHandler, Response } from "express";
import { supabaseAdmin } from "../../../shared/db/supabase.js";
import { AppError } from "../../../shared/errors/index.js";
import { asyncHandler } from "../../../shared/errors/async-handler.js";
import {
	requireTechnicianId,
	requireUserId,
} from "../../../shared/utils/request-auth.js";
import { lifecycleService } from "./lifecycle.service.js";

type Role = "user" | "technician";

interface OrderOwnershipRow {
	id: string;
	user_id: string;
	technician_id: string;
}

async function loadOrderForOwnershipCheck(
	orderId: string,
): Promise<OrderOwnershipRow> {
	const { data, error } = await supabaseAdmin
		.from("orders")
		.select("id, user_id, technician_id")
		.eq("id", orderId)
		.maybeSingle();
	if (error) throw error;
	if (!data) throw AppError.notFound("order_not_found");
	return data as OrderOwnershipRow;
}

function assertOwnership(
	order: OrderOwnershipRow,
	role: Role,
	actorId: string,
): void {
	const expected = role === "user" ? order.user_id : order.technician_id;
	if (expected !== actorId) {
		// Use notFound to avoid leaking existence to non-owners (T-02-10).
		throw AppError.notFound("order_not_found");
	}
}

// ─── User actions ──────────────────────────────────────────────────────────

export const submitOrder: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const order = await lifecycleService.submitOrder(userId, req.body);
	req.log.info({ action: 'order_submitted', orderId: order.id, userId });
	res.status(201).json({ data: order });
});

export const userCancelOrder: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const reason = (req.body as { reason?: string | null }).reason ?? null;
	const order = await lifecycleService.cancelOrder(
		orderId,
		userId,
		"user",
		reason,
	);
	req.log.info({ action: 'order_cancelled_by_user', orderId, userId });
	res.status(200).json({ data: order });
});

export const userSubmitQuote: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const { amount, notes } = req.body as {
		amount: number;
		notes?: string | null;
	};
	const quote = await lifecycleService.submitQuote(
		orderId,
		userId,
		"user",
		amount,
		notes ?? null,
	);
	req.log.info({ action: 'quote_submitted', orderId, userId, amount });
	res.status(201).json({ data: quote });
});

export const userAcceptQuote: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const quoteId = req.params.quoteId as string;
	const order = await lifecycleService.acceptQuote(quoteId, userId, "user");
	req.log.info({ action: 'quote_accepted', orderId: order.id, userId });
	res.status(200).json({ data: order });
});

export const userConfirmCompletion: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.confirmCompletion(
		orderId,
		userId,
		"user",
	);
	req.log.info({ action: 'completion_confirmed_by_user', orderId, userId });
	res.status(200).json({ data: order });
});

export const userDeclineCompletion: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.declineCompletion(
		orderId,
		userId,
		"user",
	);
	req.log.info({ action: 'completion_declined_by_user', orderId, userId });
	res.status(200).json({ data: order });
});

export const userCheckout: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const { method } = req.body as { method: "cash" };
	const order = await lifecycleService.choosePaymentMethod(
		orderId,
		userId,
		method,
	);
	req.log.info({ action: 'payment_method_chosen', orderId, userId, method });
	res.status(200).json({ data: order });
});

// ─── Technician actions ───────────────────────────────────────────────────

export const techAccept: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.techAccept(orderId, techId);
	req.log.info({ action: 'order_accepted_by_tech', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techDecline: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const reason = (req.body as { reason?: string | null }).reason ?? null;
	const order = await lifecycleService.techDecline(orderId, techId, reason);
	req.log.info({ action: 'order_declined_by_tech', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techCancel: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const reason = (req.body as { reason?: string | null }).reason ?? null;
	const order = await lifecycleService.cancelOrder(
		orderId,
		techId,
		"technician",
		reason,
	);
	req.log.info({ action: 'order_cancelled_by_tech', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techStartTracking: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.techStartTracking(orderId, techId);
	req.log.info({ action: 'tracking_started', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techUpsertLocation: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const { latitude, longitude, heading, accuracy } = req.body as {
		latitude: number;
		longitude: number;
		heading?: number | null;
		accuracy?: number | null;
	};
	const result = await lifecycleService.upsertLocation(
		orderId,
		techId,
		latitude,
		longitude,
		heading ?? null,
		accuracy ?? null,
	);
	res.status(200).json({ data: result });
});

export const techStartInspection: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.techStartInspection(orderId, techId);
	req.log.info({ action: 'inspection_started', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techFinishInspection: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.techFinishInspection(
		orderId,
		techId,
	);
	req.log.info({ action: 'inspection_finished', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techSubmitQuote: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const { amount, notes } = req.body as {
		amount: number;
		notes?: string | null;
	};
	const quote = await lifecycleService.submitQuote(
		orderId,
		techId,
		"technician",
		amount,
		notes ?? null,
	);
	req.log.info({ action: 'quote_submitted_by_tech', orderId, technicianId: techId, amount });
	res.status(201).json({ data: quote });
});

export const techAcceptQuote: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const quoteId = req.params.quoteId as string;
	const order = await lifecycleService.acceptQuote(
		quoteId,
		techId,
		"technician",
	);
	req.log.info({ action: 'quote_accepted_by_tech', orderId: order.id, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techConfirmCompletion: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.confirmCompletion(
		orderId,
		techId,
		"technician",
	);
	req.log.info({ action: 'completion_confirmed_by_tech', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techDeclineCompletion: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.declineCompletion(
		orderId,
		techId,
		"technician",
	);
	req.log.info({ action: 'completion_declined_by_tech', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

export const techMarkCashReceived: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await lifecycleService.markCashReceived(orderId, techId);
	req.log.info({ action: 'cash_received', orderId, technicianId: techId });
	res.status(200).json({ data: order });
});

// ─── GET sub-resources (read-only; ownership gated in-handler) ─────────────

export const getUserOrderEvents: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const order = await loadOrderForOwnershipCheck(orderId);
	assertOwnership(order, "user", userId);
	await listEventsAndRespond(req, res, orderId);
});

export const getTechnicianOrderEvents: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await loadOrderForOwnershipCheck(orderId);
	assertOwnership(order, "technician", techId);
	await listEventsAndRespond(req, res, orderId);
});

export const getUserOrderQuotes: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const order = await loadOrderForOwnershipCheck(orderId);
	assertOwnership(order, "user", userId);
	await listQuotesAndRespond(res, orderId);
});

export const getTechnicianOrderQuotes: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await loadOrderForOwnershipCheck(orderId);
	assertOwnership(order, "technician", techId);
	await listQuotesAndRespond(res, orderId);
});

// ─── Distance / ETA / geofence (Phase 4a Plan 04) ────────────────────────

export const getUserOrderDistance: RequestHandler = asyncHandler(async (req: Request, res) => {
	const userId = requireUserId(req);
	const orderId = req.params.id as string;
	const order = await loadOrderForOwnershipCheck(orderId);
	assertOwnership(order, "user", userId);
	const result = await lifecycleService.getOrderDistance(orderId);
	res.status(200).json({ data: result });
});

export const getTechnicianOrderDistance: RequestHandler = asyncHandler(async (req: Request, res) => {
	const techId = requireTechnicianId(req);
	const orderId = req.params.id as string;
	const order = await loadOrderForOwnershipCheck(orderId);
	assertOwnership(order, "technician", techId);
	const result = await lifecycleService.getOrderDistance(orderId);
	res.status(200).json({ data: result });
});

async function listEventsAndRespond(
	req: Request,
	res: Response,
	orderId: string,
): Promise<void> {
	const { page, pageSize } = req.query as unknown as {
		page: number;
		pageSize: number;
	};
	const offset = (page - 1) * pageSize;
	const { data, error, count } = await supabaseAdmin
		.from("order_events")
		.select("*", { count: "exact" })
		.eq("order_id", orderId)
		.order("created_at", { ascending: false })
		.range(offset, offset + pageSize - 1);
	if (error) throw error;
	res.status(200).json({
		data: {
			page,
			pageSize,
			total: count ?? 0,
			items: data ?? [],
		},
	});
}

async function listQuotesAndRespond(
	res: Response,
	orderId: string,
): Promise<void> {
	const { data, error } = await supabaseAdmin
		.from("order_quotes")
		.select("*")
		.eq("order_id", orderId)
		.order("round_number", { ascending: true });
	if (error) throw error;
	res.status(200).json({ data: data ?? [] });
}
