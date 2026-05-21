/**
 * Thin HTTP handlers for every lifecycle verb route. Each handler:
 *
 *   1. Extracts the actor id from `req.user.id` (user routes) or
 *      `req.technician.id` (technician routes) — never from the body.
 *   2. Reads the validated body / params off `req` (Zod-validated upstream
 *      by the route's `validate(...)` middleware).
 *   3. Delegates to `lifecycleService.<method>(...)`.
 *   4. Sends the JSON response (201 for create, 200 for everything else).
 *   5. Funnels errors to the Express error middleware via `next(error)`.
 *
 * The two GET sub-resource handlers (events + quotes) are the ONLY handlers
 * that touch `supabaseAdmin` directly. They authorize by re-reading the
 * order and asserting the actor owns it (user_id or technician_id match)
 * — service-role bypass is gated by this app-level check (T-02-10).
 */

import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../../../shared/db/supabase.js";
import { AppError } from "../../../shared/errors/index.js";
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

export class LifecycleController {
	// ─── User actions ──────────────────────────────────────────────────────────

	submitOrder = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const order = await lifecycleService.submitOrder(userId, req.body);
			res.status(201).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	userCancelOrder = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const reason = (req.body as { reason?: string | null }).reason ?? null;
			const order = await lifecycleService.cancelOrder(
				orderId,
				userId,
				"user",
				reason,
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	userSubmitQuote = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
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
			res.status(201).json({ data: quote });
		} catch (error) {
			next(error);
		}
	};

	userAcceptQuote = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const quoteId = req.params.quoteId as string;
			const order = await lifecycleService.acceptQuote(quoteId, userId, "user");
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	userConfirmCompletion = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.confirmCompletion(
				orderId,
				userId,
				"user",
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	userDeclineCompletion = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.declineCompletion(
				orderId,
				userId,
				"user",
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	userCheckout = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const { method } = req.body as { method: "cash" };
			const order = await lifecycleService.choosePaymentMethod(
				orderId,
				userId,
				method,
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	// ─── Technician actions ───────────────────────────────────────────────────

	techAccept = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.techAccept(orderId, techId);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techDecline = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const reason = (req.body as { reason?: string | null }).reason ?? null;
			const order = await lifecycleService.techDecline(orderId, techId, reason);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techCancel = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const reason = (req.body as { reason?: string | null }).reason ?? null;
			const order = await lifecycleService.cancelOrder(
				orderId,
				techId,
				"technician",
				reason,
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techStartTracking = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.techStartTracking(orderId, techId);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techUpsertLocation = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
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
			// D7: response shape = { location, order, arrived }
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	};

	techStartInspection = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.techStartInspection(orderId, techId);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techFinishInspection = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.techFinishInspection(
				orderId,
				techId,
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techSubmitQuote = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
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
			res.status(201).json({ data: quote });
		} catch (error) {
			next(error);
		}
	};

	techAcceptQuote = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const quoteId = req.params.quoteId as string;
			const order = await lifecycleService.acceptQuote(
				quoteId,
				techId,
				"technician",
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techConfirmCompletion = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.confirmCompletion(
				orderId,
				techId,
				"technician",
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techDeclineCompletion = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.declineCompletion(
				orderId,
				techId,
				"technician",
			);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	techMarkCashReceived = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await lifecycleService.markCashReceived(orderId, techId);
			res.status(200).json({ data: order });
		} catch (error) {
			next(error);
		}
	};

	// ─── GET sub-resources (read-only; ownership gated in-handler) ─────────────

	getUserOrderEvents = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const order = await loadOrderForOwnershipCheck(orderId);
			assertOwnership(order, "user", userId);
			await listEventsAndRespond(req, res, orderId);
		} catch (error) {
			next(error);
		}
	};

	getTechnicianOrderEvents = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await loadOrderForOwnershipCheck(orderId);
			assertOwnership(order, "technician", techId);
			await listEventsAndRespond(req, res, orderId);
		} catch (error) {
			next(error);
		}
	};

	getUserOrderQuotes = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const order = await loadOrderForOwnershipCheck(orderId);
			assertOwnership(order, "user", userId);
			await listQuotesAndRespond(res, orderId);
		} catch (error) {
			next(error);
		}
	};

	getTechnicianOrderQuotes = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await loadOrderForOwnershipCheck(orderId);
			assertOwnership(order, "technician", techId);
			await listQuotesAndRespond(res, orderId);
		} catch (error) {
			next(error);
		}
	};

	// ─── Distance / ETA / geofence (Phase 4a Plan 04) ────────────────────────

	getUserOrderDistance = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId = requireUserId(req);
			const orderId = req.params.id as string;
			const order = await loadOrderForOwnershipCheck(orderId);
			assertOwnership(order, "user", userId);
			const result = await lifecycleService.getOrderDistance(orderId);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	};

	getTechnicianOrderDistance = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const techId = requireTechnicianId(req);
			const orderId = req.params.id as string;
			const order = await loadOrderForOwnershipCheck(orderId);
			assertOwnership(order, "technician", techId);
			const result = await lifecycleService.getOrderDistance(orderId);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	};
}

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

export const lifecycleController = new LifecycleController();
